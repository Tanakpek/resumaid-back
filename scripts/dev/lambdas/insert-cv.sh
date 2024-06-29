aws ecr get-login-password --profile applicaid_dev --region eu-west-2 | docker login --username AWS --password-stdin 054160827711.dkr.ecr.eu-west-2.amazonaws.com &&
docker build --no-cache --platform linux/arm64 -f Dockerfile.dev.lambda -t applicaid_insert_cv  --build-arg FUNCTION_DIR=app --build-arg BLD=node:18.20-bullseye --build-arg TARGET=node:18.20-bullseye . &&
docker tag applicaid_insert_cv:latest 054160827711.dkr.ecr.eu-west-2.amazonaws.com/applicaid_insert_cv:latest &&
docker push 054160827711.dkr.ecr.eu-west-2.amazonaws.com/applicaid_insert_cv:latest