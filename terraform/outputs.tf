output "public_ip" {
  description = "EC2 public IP — feed this into ansible/inventory.ini"
  value       = aws_instance.app_server.public_ip
}

output "s3_bucket_name" {
  value = aws_s3_bucket.model_storage.id
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.users_auth.name
}

output "app_access_key_id" {
  value = aws_iam_access_key.app_user_key.id
}

output "app_secret_access_key" {
  value     = aws_iam_access_key.app_user_key.secret
  sensitive = true
}
