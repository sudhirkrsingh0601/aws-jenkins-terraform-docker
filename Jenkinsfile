pipeline {
    agent any

    parameters {
        string(name: 'KEY_NAME', defaultValue: 'my-new-key', description: 'AWS EC2 key pair name')
        string(name: 'SSH_PUB_KEY_PATH', defaultValue: 'ssh_key.pub', description: 'Path to public SSH key (inside infra folder)')
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
                        C:/terraform/terraform.exe apply -auto-approve \
                        -var="key_name=${KEY_NAME}" \
                        -var="ssh_public_key_path=${SSH_PUB_KEY_PATH}"
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
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'ec2-ssh-key',
                        keyFileVariable: 'SSH_KEY_FILE',
                        usernameVariable: 'SSH_USER'
                    )]) {

                        sh """
                        echo "Saving Docker image..."
                        docker save ${IMAGE_NAME} -o app.tar

                        echo "Fixing SSH key permissions..."
                        chmod 600 \$SSH_KEY_FILE || true

                        echo "Copying image to EC2..."
                        scp -i \$SSH_KEY_FILE -o StrictHostKeyChecking=no app.tar \$SSH_USER@${env.EC2_PUBLIC_IP}:/home/ec2-user/

                        echo "Running container on EC2..."
                        ssh -i \$SSH_KEY_FILE -o StrictHostKeyChecking=no \$SSH_USER@${env.EC2_PUBLIC_IP} '
                            docker load -i /home/ec2-user/app.tar &&
                            docker stop app || true &&
                            docker rm app || true &&
                            docker run -d -p 80:3000 --name app student-web-app:latest
                        '
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment complete!"
            echo "🌐 App URL: http://${env.EC2_PUBLIC_IP}"
            echo "🔗 API URL: http://${env.EC2_PUBLIC_IP}:3000/api/message"
        }
        failure {
            echo "❌ Pipeline failed. Check logs."
        }
    }
}