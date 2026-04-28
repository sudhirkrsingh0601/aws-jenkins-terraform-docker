pipeline {
agent any

parameters {
string(name: 'KEY_NAME', defaultValue: 'my-ec2-key', description: 'AWS EC2 key pair name')
string(name: 'SSH_PUB_KEY_PATH', defaultValue: 'ssh_key.pub', description: 'Local path to public SSH key for Terraform')
}

environment {
AWS_DEFAULT_REGION = 'ap-south-1'
TF_IN_AUTOMATION = '1'
IMAGE_NAME = 'student-web-app:latest'
}

stages {

stage('Checkout') {
  steps {
    checkout scm
  }
}

stage('Build Docker image') {
  steps {
    sh 'docker build -t ${IMAGE_NAME} .'
  }
}

stage('Terraform init') {
  steps {
    dir('infra') {
      sh 'C:/terraform/terraform.exe init'
    }
  }
}

stage('Terraform plan') {
  steps {
    withCredentials([
      string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
      string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
    ]) {
      dir('infra') {
        sh 'C:/terraform/terraform.exe plan -var="key_name=${KEY_NAME}" -var="ssh_public_key_path=${SSH_PUB_KEY_PATH}"'
      }
    }
  }
}

stage('Terraform apply') {
  steps {
    withCredentials([
      string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
      string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
    ]) {
      dir('infra') {
        sh 'C:/terraform/terraform.exe apply -auto-approve -var="key_name=${KEY_NAME}" -var="ssh_public_key_path=${SSH_PUB_KEY_PATH}"'

        script {
          env.EC2_PUBLIC_IP = sh(
            script: 'C:/terraform/terraform.exe output -raw public_ip',
            returnStdout: true
          ).trim()
        }
      }
    }
  }
}

stage('Deploy container on EC2') {
    steps {
        script {
            def ip = sh(script: "C:/terraform/terraform.exe output -raw public_ip", returnStdout: true).trim()

            sh """
            docker save student-web-app:latest -o app.tar

            scp -o StrictHostKeyChecking=no -i C:/Users/YourName/Downloads/my-ec2-key.pem app.tar ec2-user@${ip}:/home/ec2-user/

            ssh -o StrictHostKeyChecking=no -i C:/Users/YourName/Downloads/my-ec2-key.pem ec2-user@${ip} '
                docker load -i app.tar &&
                docker stop app || true &&
                docker rm app || true &&
                docker run -d -p 80:3000 --name app student-web-app:latest
            '
            """
        }
    }
}

}

post {
success {
echo "Deployment complete!"
echo "App URL: http://${EC2_PUBLIC_IP}"
echo "API URL: http://${EC2_PUBLIC_IP}:3000/api/message"
}
failure {
echo "Pipeline failed. Check the Jenkins console output."
}
}
}
