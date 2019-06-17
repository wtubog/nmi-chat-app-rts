# /usr/bin/sh

docker build -t striv-chat .
docker tag striv-chat:latest 187325535940.dkr.ecr.ap-southeast-1.amazonaws.com/striv-chat:latest
docker push 187325535940.dkr.ecr.ap-southeast-1.amazonaws.com/striv-chat:latest
aws ecs update-service --service striv-chat-service --cluster striv-cluster --force-new-deploy --profile wilco