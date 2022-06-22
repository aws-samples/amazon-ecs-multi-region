import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface EcsDataStackProps extends StackProps {
  tableName: string;
  replicationRegions: Array<string>;
}

export class EcsDataStack extends Stack {

  public readonly dynamoTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: EcsDataStackProps) {
    super(scope, id, props);

    this.dynamoTable = new dynamodb.Table(this, 'table', {
      partitionKey: {
        name: 'itemId',
        type: dynamodb.AttributeType.STRING
      },
      tableName: props.tableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      replicationRegions: props.replicationRegions,

      /**
       *  The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
       * the new table, and it will remain in your account until manually deleted. By setting the policy to
       * DESTROY, cdk destroy will delete the table (even if it has data in it)
       */
      removalPolicy: RemovalPolicy.DESTROY // NOT recommended for production code
    });
  }
}
