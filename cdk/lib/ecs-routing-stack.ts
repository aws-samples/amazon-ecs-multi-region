import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as globalaccelerator from 'aws-cdk-lib/aws-globalaccelerator';
import * as globalaccelerator_endpoints from 'aws-cdk-lib/aws-globalaccelerator-endpoints';
import * as elasticloadbalancingv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export interface EcsRoutingStackProps extends StackProps {
  loadBalancer: elasticloadbalancingv2.ApplicationLoadBalancer;
}

export class EcsRoutingStack extends Stack {

  public readonly loadBalancer: elasticloadbalancingv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: EcsRoutingStackProps) {
    super(scope, id, props);

    var accelerator = new globalaccelerator.Accelerator(this, 'accelerator', {
      acceleratorName: 'workshop-accelerator'
    });

    var listener = accelerator.addListener('workshop-listener', {
      listenerName: 'workshop-listener',
      clientAffinity: globalaccelerator.ClientAffinity.SOURCE_IP,
      portRanges: [{ fromPort: 80 }]
    });

    listener.addEndpointGroup('workshop-group01', {
      healthCheckInterval: Duration.seconds(10),
      healthCheckPath: '/healthcheck',
      healthCheckThreshold: 1,
      healthCheckProtocol: globalaccelerator.HealthCheckProtocol.HTTP,
      region: process.env.MAIN_REGION,
      endpoints: [new globalaccelerator_endpoints.ApplicationLoadBalancerEndpoint(props.loadBalancer, { preserveClientIp: true, weight: 128 })]
    });
  }
}
