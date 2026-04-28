variable "region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-north-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Name of the EC2 key pair for SSH access"
  type        = string
}

variable "ssh_public_key_path" {
  description = "Path to the public SSH key used by Terraform to create the key pair"
  type        = string
  default     = "ssh_key.pub"
}

variable "allowed_ip" {
  description = "CIDR block allowed to connect to the instance"
  type        = string
  default     = "0.0.0.0/0"
}
