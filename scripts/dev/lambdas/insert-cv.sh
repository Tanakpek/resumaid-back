aws ecr get-login-password --profile applicaid_dev --region eu-west-2 | docker login --username AWS --password-stdin 054160827711.dkr.ecr.eu-west-2.amazonaws.com&&
docker build --platform linux/arm64 -f Dockerfile.dev.lambda -t applicaid_insert_cv --build-arg BLD=mhart/alpine-node:16.4.2 --build-arg TARGET=mhart/alpine-node:16.4.2 . &&
docker tag applicaid_insert_cv:latest 054160827711.dkr.ecr.eu-west-2.amazonaws.com/applicaid_insert_cv:latest &&
docker push 054160827711.dkr.ecr.eu-west-2.amazonaws.com/applicaid_insert_cv:latest