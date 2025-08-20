#!/usr/bin/env bash

# Variables
AWS_REGION="us-east-2"                        # <-- change this
AWS_ACCOUNT_ID="018772930825"                 # <-- change this
ECR_REPO_NAME="birch_frontend_staging"
LOCAL_IMAGE_NAME="birch_frontend_staging"
ECR_IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:latest"

# 1. Authenticate Docker to ECR
echo "Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# 2. Ensure repo exists
aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION >/dev/null 2>&1 || \
aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION

# 3. Stop and remove old container
docker kill $LOCAL_IMAGE_NAME 2>/dev/null
docker stop $LOCAL_IMAGE_NAME 2>/dev/null
docker rm $LOCAL_IMAGE_NAME 2>/dev/null

# 4. Build and tag image
echo "Building Docker image..."
docker build -t $LOCAL_IMAGE_NAME .

docker tag $LOCAL_IMAGE_NAME:latest $ECR_IMAGE_URI

# 5. Push to ECR
echo "Pushing Docker image to ECR..."
docker push $ECR_IMAGE_URI

# 6. Run container from local image (already tagged/pushed)
echo "Running container..."
docker run -d --name $LOCAL_IMAGE_NAME -p 5000:5000 $LOCAL_IMAGE_NAME:latest

# 7. Save logs
docker logs $LOCAL_IMAGE_NAME >& ${LOCAL_IMAGE_NAME}.log

echo "Deployment complete! Image pushed to: $ECR_IMAGE_URI"
