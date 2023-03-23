terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "ca-central-1"
}

locals {
  save_note_function_name   = "save-note-30151330"
  delete_note_function_name = "delete-note-30151330"
  get_notes_function_name   = "get-notes-30151330"
  handler_name              = "main.lambda_handler"
  artifact_name             = "artifact.zip"
}

resource "aws_dynamodb_table" "dynamodb" {
  name         = "lotion-30145429"
  billing_mode = "PROVISIONED"

  read_capacity  = 1
  write_capacity = 1

  hash_key  = "email"
  range_key = "id"

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_iam_role" "lambda_role" {
  name               = "iam-for-lambda-role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "lambda-logging-policy"
  description = "IAM policy for logging from a lambda"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:Query",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

data "archive_file" "get_notes" {
  type        = "zip"
  source_file = "../functions/get-notes/main.py"
  output_path = "../functions/get-notes/artifact.zip"
}

data "archive_file" "save_note" {
  type        = "zip"
  source_file = "../functions/save-note/main.py"
  output_path = "../functions/save-note/artifact.zip"
}

data "archive_file" "delete_note" {
  type        = "zip"
  source_file = "../functions/delete-note/main.py"
  output_path = "../functions/delete-note/artifact.zip"
}

resource "aws_lambda_function" "get_notes" {
  role             = aws_iam_role.lambda_role.arn
  function_name    = local.get_notes_function_name
  handler          = local.handler_name
  filename         = "../functions/get-notes/${local.artifact_name}"
  source_code_hash = data.archive_file.get_notes.output_base64sha256
  runtime          = "python3.9"
}

resource "aws_lambda_function" "save_note" {
  role             = aws_iam_role.lambda_role.arn
  function_name    = local.save_note_function_name
  handler          = local.handler_name
  filename         = "../functions/save-note/${local.artifact_name}"
  source_code_hash = data.archive_file.save_note.output_base64sha256
  runtime          = "python3.9"
}

resource "aws_lambda_function" "delete_note" {
  role             = aws_iam_role.lambda_role.arn
  function_name    = local.delete_note_function_name
  handler          = local.handler_name
  filename         = "../functions/delete-note/${local.artifact_name}"
  source_code_hash = data.archive_file.delete_note.output_base64sha256
  runtime          = "python3.9"
}

resource "aws_lambda_function_url" "get_notes" {
  function_name      = aws_lambda_function.get_notes.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

resource "aws_lambda_function_url" "save_note" {
  function_name      = aws_lambda_function.save_note.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST", "PUT"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

resource "aws_lambda_function_url" "delete_note" {
  function_name      = aws_lambda_function.delete_note.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.dynamodb.name
}

output "lambda_get_url" {
  value = aws_lambda_function_url.get_notes.function_url
}

output "lambda_save_url" {
  value = aws_lambda_function_url.save_note.function_url
}

output "lambda_delete_url" {
  value = aws_lambda_function_url.delete_note.function_url
}

