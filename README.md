# ECS Multi-Region Workshop

This repository contains the code for the ECS Multi-region workshop.

The `app` folder contains a Python Flask application for books API that uses DynamoDB as the data store.

The `cdk` folder contains the infrastructure code that deploys this application to Amazon Elastic Container Service (Amazon ECS).

## Prerequisites

1. [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)
2. [Docker](https://docs.docker.com/get-docker/)

## Branches

The repository contains two main branches that can be used:

* feature/single_region: Used to deploy the application to a single AWS region.
* main: Used to deploy the application to two AWS regions.

## Deploying to AWS

1. Make sure that the AWS CLI uses the intended region:

```bash
aws configure set region <your main region of choice (e.g. us-east-1)>
```

2. Navigate to the CDK folder:

```bash
cd cdk
```

3. Install NPM packages:

```bash
npm install
```

4. Deploy the foundation stack:

```bash
cdk deploy workshop-foundation-main
```

5. Deploy the data stack:

```bash
cdk deploy workshop-data
```

6. Deploy the backend stack (requires Docker to be installed and running):

```bash
cdk deploy workshop-backend-main --require-approval never
```

7. Deploy the routing stack:

```bash
cdk deploy workshop-routing --require-approval never
```
