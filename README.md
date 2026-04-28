# AWS + GitHub + Jenkins + Terraform + Docker CI/CD Demo

This sample project demonstrates an end-to-end automated deployment flow:
- Jenkins pipeline clones code from GitHub
- Terraform provisions AWS EC2 infrastructure in `ap-south-1`
- Docker image is built by Jenkins
- Application container is deployed to EC2 automatically

## Project structure

- `app/server.js` - Node.js Express dynamic web app
- `Dockerfile` - Docker image definition for the app
- `infra/main.tf` - Terraform resources for EC2 and networking
- `infra/variables.tf` - Terraform input definitions
- `infra/outputs.tf` - Terraform outputs
- `Jenkinsfile` - Declarative pipeline for one-click deployment
- `.gitignore` - ignored files for Git

## Pre-requisites

1. AWS account with IAM user access to EC2 and key pairs.
2. Jenkins server with:
   - Docker installed
   - Terraform installed
   - Git access
   - SSH agent / credentials plugin
3. GitHub repository containing this project.
4. Local SSH key pair for EC2 access.

## Setup steps

1. Clone this repository into GitHub.
2. In Jenkins, create credentials:
   - `aws-access-key-id` (Secret text)
   - `aws-secret-access-key` (Secret text)
   - `ec2-ssh-key` (SSH Username with private key, username = `ec2-user`)
3. Place your EC2 public SSH key into `infra/ssh_key.pub` or update `SSH_PUB_KEY_PATH` in Jenkins pipeline parameters.
4. Create a Jenkins pipeline job pointing to this repository and use this `Jenkinsfile`.

## Jenkins pipeline details

The pipeline includes stages:
1. Clone repository
2. Build Docker image
3. Terraform init
4. Terraform plan
5. Terraform apply
6. Deploy container on EC2 via SSH

The pipeline is designed to run without manual intervention after the job starts.

## Running locally before pipeline

Install Node.js dependencies:

```bash
npm install
```

Run the application locally:

```bash
npm start
```

Open `http://localhost:3000` and `http://localhost:3000/api/message`.

## Deploy instructions

1. Ensure `infra/ssh_key.pub` exists and `KEY_NAME` matches the key pair name.
2. Run the Jenkins pipeline.
3. After deployment, Jenkins outputs the EC2 public IP.
4. Visit:
   - `http://<EC2_PUBLIC_IP>`
   - `http://<EC2_PUBLIC_IP>:3000/api/message`

## Cleanup

From the `infra` folder, run:

```bash
terraform destroy -auto-approve -var="key_name=<your-key-name>" -var="ssh_public_key_path=../ssh_key.pub"
```

## Notes

- AWS credentials are not hardcoded; they are passed securely through Jenkins credentials.
- The Node.js app inside Docker listens on port `3000`.
- The EC2 instance is opened for ports `22`, `80`, and `3000`.
