# ECS Multi-Region Workshop

This repository contains the code for the ECS Multi-region workshop.

The `app` folder contains a Python Flask application for books API that uses DynamoDB as the data store.

The `cdk` folder contains the infrastructure code that deploys this application to Amazon Elastic Container Service (Amazon ECS).

## Prerequisites

1. [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)
2. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
3. [Docker](https://docs.docker.com/get-docker/)

## Branches

The repository contains two main branches that can be used:

* feature/single_region: Used to deploy the application to a single AWS region.
* main: Used to deploy the application to two AWS regions.

## Deploying to AWS

In this section we will explain how to deploy the application to 2 different regions.

### Bootstrapping CDK

1. Navigate to the CDK folder:

```bash
cd cdk
```

2. Install NPM packages:

```bash
npm install
```

3. Make sure that the AWS CLI uses the main region:

```bash
aws configure set region <your main region of choice (e.g. us-east-1)>
```

4. Bootstrap the AWS main region:

```bash
cdk bootstrap
```

5. Export environment variables needed for bootstrapping the secondary region:

```bash
export WORKSHOP_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
export WORKSHOP_SECONDARY_REGION=<your secondary region of choice (e.g. us-west-1)>
```

6. Bootstrap the AWS secondary region:

```bash
cdk bootstrap aws://$WORKSHOP_ACCOUNT_ID/$WORKSHOP_SECONDARY_REGION
```

### Deploying the foundation stack

1. Deploy the foundation stack to the main region:

```bash
cdk deploy workshop-foundation-main
```

2. Deploy the foundation stack to the secondary region:

```bash
cdk deploy workshop-foundation-secondary
```

### Deploying the data stack

To deploy the data stack to both regions, run:

```bash
cdk deploy workshop-data
```

### Deploying the backend stack

The following steps require Docker to be installed and running.

1. Deploy the backend stack to the main region:

```bash
cdk deploy workshop-backend-main --require-approval never
```

2. Deploy the backend stack to the secondary region:

```bash
cdk deploy workshop-backend-secondary --require-approval never
```

### Deploying the routing stack

Before we can deploy the routing stack, we will need to export the secondary region's load balancer ARN as an environment variable. The environment variable will be referenced by the CDK code.


```bash
export WORKSHOP_SECONDARY_ALB_ARN=$(aws elbv2 describe-load-balancers --names "workshop-alb" --query "LoadBalancers[0].LoadBalancerArn" --output text --region $WORKSHOP_SECONDARY_REGION)
```

Then we can deploy the routing stack as follows:

```bash
cdk deploy workshop-routing --require-approval never
```

### Test out the API

* Navigate to Global Accelerators console
* From left navigation select "Accelerators", and click on workshop-accelerator.
* Copy the DNS name, then paste it in a new browser tab. Append `/healthcheck` to the URL. You should be able to see a JSON response for the health check.
