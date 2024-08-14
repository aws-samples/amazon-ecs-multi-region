import { Stack, StackProps, Duration, aws_dynamodb } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as elasticloadbalancingv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { CfnOutput } from "aws-cdk-lib/core";

export interface EcsBackendStackProps extends StackProps {
  vpc: ec2.Vpc;
  tableName: string;
}

const relativeAppPath = "../app";

export class EcsBackendStack extends Stack {
  public readonly apiService: ecs_patterns.ApplicationLoadBalancedFargateService;
  public readonly apiServiceUrl: string;

  constructor(scope: Construct, id: string, props: EcsBackendStackProps) {
    super(scope, id, props);

    // Find DynamoDB table by name
    const table = dynamodb.Table.fromTableName(
      this,
      "dynamodb-table",
      props.tableName,
    );

    const cluster = new ecs.Cluster(this, "cluster", {
      clusterName: "workshop-cluster",
      vpc: props.vpc,
    });

    // Task Role
    const taskRole = new iam.Role(this, "task-role", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });
    taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: [
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
        ],
        resources: [table.tableArn],
      }),
    );

    // Service
    this.apiService = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "service",
      {
        cluster: cluster,
        serviceName: "workshop-service",
        maxHealthyPercent: 100,
        minHealthyPercent: 50,
        // Loadbalancer
        loadBalancerName: "workshop-alb",
        protocol: elasticloadbalancingv2.ApplicationProtocol.HTTP,
        publicLoadBalancer: true,
        assignPublicIp: false,
        listenerPort: 80,
        // Task Definition
        desiredCount: 3,
        cpu: 512,
        memoryLimitMiB: 1024,
        taskImageOptions: {
          image: ecs.ContainerImage.fromAsset(relativeAppPath),
          taskRole: taskRole,
          environment: {
            DYNAMODB_TABLE_NAME: props.tableName,
          },
          containerPort: 5000,
        },
      },
    );

    //Target group/Health check
    this.apiService.targetGroup.setAttribute(
      "deregistration_delay.timeout_seconds",
      "5",
    );
    this.apiService.targetGroup.configureHealthCheck({
      path: "/healthcheck",
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      interval: Duration.seconds(6),
    });
    // Output the region name of the ECS Cluster
    new CfnOutput(this, "EcsRegionName", {
      value: cluster.env.region,
    });

    // Output the Name of the ECS Service
    new CfnOutput(this, "EcsServiceName", {
      value: this.apiService.service.serviceName,
    });

    // Output the ARN of the ECS Service
    new CfnOutput(this, "EcsServiceArn", {
      value: this.apiService.service.serviceArn,
    });

    // Output the Name of the ECS Cluster
    new CfnOutput(this, "EcsClusterName", {
      value: cluster.clusterName,
    });

    // Output the ARN of the ECS Cluster
    new CfnOutput(this, "EcsClusterArn", {
      value: cluster.clusterArn,
    });
    
    // Output the Name of the ECS Task Execution Role
    new CfnOutput(this, "ecsTaskExecutionRole", {
      value: this.apiService.taskDefinition.executionRole?.roleName || 'Role not defined',
    });

  }
}
