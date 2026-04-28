output "public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.web.public_ip
}

output "security_group_id" {
  description = "Security group ID for the EC2 instance"
  value       = aws_security_group.web_sg.id
}
