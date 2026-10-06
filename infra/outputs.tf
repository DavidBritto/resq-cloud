output "api_endpoint" {
  description = "Public URL for ResQ-Cloud HTTP API"
  value       = aws_apigatewayv2_stage.default_stage.invoke_url
}

output "reports_queue_url" {
  description = "URL of the primary SQS reports queue"
  value       = aws_sqs_queue.reports_queue.url
}

output "reports_queue_arn" {
  description = "ARN of the primary SQS reports queue"
  value       = aws_sqs_queue.reports_queue.arn
}

output "reports_dlq_url" {
  description = "URL of the Dead Letter Queue (DLQ)"
  value       = aws_sqs_queue.reports_dlq.url
}

output "dynamodb_table_name" {
  description = "DynamoDB table name for emergency reports"
  value       = aws_dynamodb_table.emergency_reports.name
}

output "lambda_function_name" {
  description = "Name of the triage processor Lambda function"
  value       = aws_lambda_function.report_processor.function_name
}
