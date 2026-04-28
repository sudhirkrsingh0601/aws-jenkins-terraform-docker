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

                    // Save Docker image locally
                    sh "docker save ${IMAGE_NAME} -o app.tar"

                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY_FILE', usernameVariable: 'SSH_USER')]) {
                        sh "scp -i '${SSH_KEY_FILE}' -o StrictHostKeyChecking=no app.tar ${SSH_USER}@${ip}:/home/ec2-user/"
                        sh "ssh -i '${SSH_KEY_FILE}' -o StrictHostKeyChecking=no ${SSH_USER}@${ip} \"docker load -i /home/ec2-user/app.tar && docker stop app || true && docker rm app || true && docker run -d -p 80:3000 --name app ${IMAGE_NAME}\""
                    }
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