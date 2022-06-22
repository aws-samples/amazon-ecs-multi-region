#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EcsFoundationStack } from '../lib/ecs-foundation-stack';
import { EcsBackendStack } from '../lib/ecs-backend-stack';
import { EcsDataStack } from '../lib/ecs-data-stack';
import { EcsRoutingStack } from '../lib/ecs-routing-stack';

const app = new cdk.App();
const dynamodbTableName = 'workshop-table';

// Environment Settings
const envMainRegion = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
}

// Foundation Stacks
const mainFoundationStack = new EcsFoundationStack(app, 'workshop-foundation-main', {
  env: envMainRegion
});

// Data Stack
const dataStack = new EcsDataStack(app, 'workshop-data', {
  env: envMainRegion,
  tableName: dynamodbTableName
});

// Backend Stacks
const mainBackendStack = new EcsBackendStack(app, 'workshop-backend-main', {
  vpc: mainFoundationStack.vpc,
  tableName: dynamodbTableName,
  env: envMainRegion
});

// Routing Stack
const routingStack = new EcsRoutingStack(app, 'workshop-routing', {
  loadBalancer: mainBackendStack.apiService.loadBalancer,
  env: envMainRegion,
});
