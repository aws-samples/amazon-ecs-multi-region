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
  region: process.env.CDK_DEFAULT_REGION,
}
const envSecondaryRegion = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.WORKSHOP_SECONDARY_REGION,
}

// Foundation Stacks
const mainFoundationStack = new EcsFoundationStack(app, 'workshop-foundation-main', {
  env: envMainRegion
});
const secondaryFoundationStack = new EcsFoundationStack(app, 'workshop-foundation-secondary', {
  env: envSecondaryRegion
});

// Data Stack
const dataStack = new EcsDataStack(app, 'workshop-data', {
  env: envMainRegion,
  tableName: dynamodbTableName,
  replicationRegions: [envSecondaryRegion.region!]
});

// Backend Stacks
const mainBackendStack = new EcsBackendStack(app, 'workshop-backend-main', {
  vpc: mainFoundationStack.vpc,
  tableName: dynamodbTableName,
  env: envMainRegion
});
const secondaryBackendStack = new EcsBackendStack(app, 'workshop-backend-secondary', {
  vpc: secondaryFoundationStack.vpc,
  tableName: dynamodbTableName,
  env: envSecondaryRegion
});

if (process.env.WORKSHOP_SECONDARY_ALB_ARN) {

  // Routing Stack
  const routingStack = new EcsRoutingStack(app, 'workshop-routing', {
    loadBalancer: mainBackendStack.apiService.loadBalancer,
    env: envMainRegion,
    secondaryLoadBalancerArn: process.env.WORKSHOP_SECONDARY_ALB_ARN
  });

}

