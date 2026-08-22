variable "aws_region" {
  description = "AWS region. Kept as eu-north-1 to match the region hardcoded in s3.js / dynamodb.js — change both if you change this."
  type        = string
  default     = "eu-north-1"
}

variable "instance_type" {
  description = "Free-tier eligible instance type. t3.micro is the free-tier type in eu-north-1 (t2.micro isn't available there)."
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Name to give the AWS key pair that Terraform creates."
  type        = string
  default     = "farmer-helper-key"
}

variable "public_key_path" {
  description = "Path to YOUR local public key (e.g. ~/.ssh/id_rsa.pub). Generate one with `ssh-keygen` if you don't have it. Terraform uploads this to AWS; you keep the matching private key locally for SSH/Ansible."
  type        = string
}

variable "s3_bucket_name" {
  description = "Must match BUCKET_NAME in ml_services/services/crop_service.py. S3 bucket names are globally unique across ALL AWS accounts, so if this exact name is taken, change it here AND in that Python file."
  type        = string
  default     = "farmer-helper-storage-001"
}

variable "allowed_ssh_cidr" {
  description = "Who can SSH into the instance. 0.0.0.0/0 works for coursework but is not something you'd do in production — ideally restrict to your own IP."
  type        = string
  default     = "0.0.0.0/0"
}
