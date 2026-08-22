terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ---------------------------------------------------------------------------
# Networking / access
# ---------------------------------------------------------------------------

resource "aws_security_group" "app_sg" {
  name        = "farmer-helper-sg"
  description = "Allow SSH + app ports for Farmer Helper"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "Frontend (Vite)"
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend API"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "ML service"
    from_port   = 5001
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Project = "farmer-helper"
  }
}

resource "aws_key_pair" "deployer" {
  key_name   = var.key_name
  public_key = file(var.public_key_path)
}

# ---------------------------------------------------------------------------
# Compute
# ---------------------------------------------------------------------------

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  root_block_device {
    volume_size = 20 # gp3 default; the ml_service image (torch/ultralytics) is large, 8GB default disk will not be enough
  }

  tags = {
    Name    = "farmer-helper-app"
    Project = "farmer-helper"
  }
}

# ---------------------------------------------------------------------------
# S3 bucket for ML models (must match crop_service.py's BUCKET_NAME)
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "model_storage" {
  bucket = var.s3_bucket_name

  tags = {
    Project = "farmer-helper"
  }
}

resource "aws_s3_object" "crop_model" {
  bucket = aws_s3_bucket.model_storage.id
  key    = "models/crop_recommendation_model.pkl"
  source = "${path.module}/../../Farmer-Helper_V2/ml_services/models/crop_recommendation_model.pkl"
  etag   = filemd5("${path.module}/../../Farmer-Helper_V2/ml_services/models/crop_recommendation_model.pkl")
}

resource "aws_s3_object" "label_encoder" {
  bucket = aws_s3_bucket.model_storage.id
  key    = "models/label_encoder.pkl"
  source = "${path.module}/../../Farmer-Helper_V2/ml_services/models/label_encoder.pkl"
  etag   = filemd5("${path.module}/../../Farmer-Helper_V2/ml_services/models/label_encoder.pkl")
}

# ---------------------------------------------------------------------------
# DynamoDB table for auth (matches TableName: "UsersAuth", Key: { email })
# ---------------------------------------------------------------------------

resource "aws_dynamodb_table" "users_auth" {
  name         = "UsersAuth"
  billing_mode = "PAY_PER_REQUEST" # no capacity planning needed, free-tier friendly
  hash_key     = "email"

  attribute {
    name = "email"
    type = "S"
  }

  tags = {
    Project = "farmer-helper"
  }
}

# ---------------------------------------------------------------------------
# IAM user + keys the app uses to reach S3/DynamoDB (kept simple for coursework;
# an EC2 instance role would be the more "production" way to do this — ask me
# about that if you want the extra viva talking point once the basics work)
# ---------------------------------------------------------------------------

resource "aws_iam_user" "app_user" {
  name = "farmer-helper-app"
}

resource "aws_iam_access_key" "app_user_key" {
  user = aws_iam_user.app_user.name
}

resource "aws_iam_user_policy" "app_user_policy" {
  name = "farmer-helper-app-policy"
  user = aws_iam_user.app_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:HeadObject", "s3:ListBucket"]
        Resource = [aws_s3_bucket.model_storage.arn, "${aws_s3_bucket.model_storage.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:Query"]
        Resource = [aws_dynamodb_table.users_auth.arn]
      }
    ]
  })
}
