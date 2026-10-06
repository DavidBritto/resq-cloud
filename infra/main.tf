terraform {
  required_version = ">= 1.8.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Bootcamp    = "AWS-ContentCreatorsLATAM-2026"
    }
  }
}

# -----------------------------------------------------------------------------
# 1. Amazon SQS: Buffer de Ingesta y Dead Letter Queue (DLQ)
# -----------------------------------------------------------------------------
resource "aws_sqs_queue" "reports_dlq" {
  name                      = "${var.project_name}-reports-dlq"
  message_retention_seconds = 1209600 # 14 días
}

resource "aws_sqs_queue" "reports_queue" {
  name                      = "${var.project_name}-reports-queue"
  message_retention_seconds = 345600 # 4 días
  visibility_timeout_seconds = 30     # Mayor que el timeout de la Lambda

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.reports_dlq.arn
    maxReceiveCount     = 3
  })
}

# -----------------------------------------------------------------------------
# 2. Amazon DynamoDB: Tabla Single-Table para Reportes de Emergencia
# -----------------------------------------------------------------------------
resource "aws_dynamodb_table" "emergency_reports" {
  name         = "${var.project_name}-reports"
  billing_mode = "PAY_PER_REQUEST" # Free Tier friendly (On-Demand)
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}

# -----------------------------------------------------------------------------
# 3. AWS Lambda: Procesador de Reportes y Triage
# -----------------------------------------------------------------------------
data "archive_file" "lambda_dummy" {
  type        = "zip"
  output_path = "${path.module}/lambda_dist.zip"

  source {
    content  = "exports.handler = async () => ({ batchItemFailures: [] });"
    filename = "handler.js"
  }
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.project_name}-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.reports_queue.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query"
        ]
        Resource = aws_dynamodb_table.emergency_reports.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attach" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

resource "aws_lambda_function" "report_processor" {
  function_name = "${var.project_name}-processor"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "handler.handler"
  runtime       = "nodejs20.x"
  memory_size   = 128
  timeout       = 10

  filename         = data.archive_file.lambda_dummy.output_path
  source_code_hash = data.archive_file.lambda_dummy.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.emergency_reports.name
    }
  }

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

# Disparador SQS con ReportBatchItemFailures
resource "aws_lambda_event_source_mapping" "sqs_processor" {
  event_source_arn                   = aws_sqs_queue.reports_queue.arn
  function_name                      = aws_lambda_function.report_processor.arn
  batch_size                         = 10
  maximum_batching_window_in_seconds = 5
  function_response_types            = ["ReportBatchItemFailures"]
}

# -----------------------------------------------------------------------------
# 4. Amazon API Gateway (HTTP API): Integración Directa a SQS
# -----------------------------------------------------------------------------
resource "aws_iam_role" "apigw_sqs_role" {
  name = "${var.project_name}-apigw-sqs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "apigateway.amazonaws.com" }
    }]
  })
}

resource "aws_iam_policy" "apigw_sqs_policy" {
  name = "${var.project_name}-apigw-sqs-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "sqs:SendMessage"
      Resource = aws_sqs_queue.reports_queue.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "apigw_sqs_attach" {
  role       = aws_iam_role.apigw_sqs_role.name
  policy_arn = aws_iam_policy.apigw_sqs_policy.arn
}

resource "aws_apigatewayv2_api" "resq_api" {
  name          = "${var.project_name}-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "sqs_integration" {
  api_id                 = aws_apigatewayv2_api.resq_api.id
  integration_type       = "AWS_PROXY"
  integration_subtype    = "SQS-SendMessage"
  credentials_arn        = aws_iam_role.apigw_sqs_role.arn
  payload_format_version = "1.0"

  request_parameters = {
    QueueUrl    = aws_sqs_queue.reports_queue.url
    MessageBody = "$request.body"
  }
}

resource "aws_apigatewayv2_route" "reports_route" {
  api_id    = aws_apigatewayv2_api.resq_api.id
  route_key = "POST /reports"
  target    = "integrations/${aws_apigatewayv2_integration.sqs_integration.id}"
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.resq_api.id
  name        = "$default"
  auto_deploy = true
}
