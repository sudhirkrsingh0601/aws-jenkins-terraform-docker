pipeline {
    agent any

    parameters {
        string(name: 'KEY_NAME', defaultValue: 'my-new-key', description: 'AWS EC2 key pair name')
        string(name: 'SSH_PUB_KEY_PATH', defaultValue: 'ssh_key.pub', description: 'Local path to public SSH key')
    }

    environment {
        AWS_DEFAULT_REGION = 'ap-south-1'
        TF_IN_AUTOMATION = '1'
        IMAGE_NAME = 'student-web-app:latest'

        // ✅ UPDATE THIS PATH (must exist)
        PEM_PATH = 'C:/Users/Sudhir/Downloads/my-new-key.pem'

        // ✅ Git tools
        SCP_PATH = 'C:/Program Files/Git/usr/bin/scp.exe'
        SSH_PATH = 'C:/Program Files/Git/usr/bin/ssh.exe'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker image') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Terraform init') {
            steps {
                dir('infra') {
                    sh 'C:/terraform/terraform.exe init'
                }
            }
        }

        // ✅ FORCE recreation (VERY IMPORTANT for new key)
        stage('Force recreate EC2') {
            steps {
                dir('infra') {
                    sh 'C:/terraform/terraform.exe taint aws_instance.web || true'
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
                        sh """
                        C:/terraform/terraform.exe apply -auto-approve -var="key_name=${KEY_NAME}" -var="ssh_public_key_path=${SSH_PUB_KEY_PATH}"
                        """

                        script {
                            env.EC2_PUBLIC_IP = sh(
                                script: 'C:/terraform/terraform.exe output -raw public_ip',
                                returnStdout: true
                            ).trim()

                            echo "EC2 IP: ${env.EC2_PUBLIC_IP}"
                        }
                    }
                }
            }
        }

        stage('Deploy container on EC2') {
            steps {
                script {

                    def ip = env.EC2_PUBLIC_IP

                    // ✅ Save Docker image
                    sh "docker save ${IMAGE_NAME} -o app.tar"

                    // ✅ Copy to EC2 (FIXED QUOTING)
                    sh "\"${SCP_PATH}\" -o StrictHostKeyChecking=no -i \"${PEM_PATH}\" app.tar ec2-user@${ip}:/home/ec2-user/"

                    // ✅ Run container (FIXED SSH COMMAND)
                    sh """
                    "${SSH_PATH}" -o StrictHostKeyChecking=no -i "${PEM_PATH}" ec2-user@${ip} "
                        docker load -i app.tar &&
                        docker stop app || true &&
                        docker rm app || true &&
                        docker run -d -p 80:3000 --name app ${IMAGE_NAME}
                    "
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment complete!"
            echo "🌐 App URL: http://${EC2_PUBLIC_IP}"
            echo "🔗 API URL: http://${EC2_PUBLIC_IP}:3000/api/message"
        }
        failure {
            echo "❌ Pipeline failed. Check logs."
        }
    }
}