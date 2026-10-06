variable "aws_region" {
  description = "AWS region for deploying resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project prefix for resource naming"
  type        = string
  default     = "resq-cloud"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}
