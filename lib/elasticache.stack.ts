import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { CfnSubnetGroup } from "aws-cdk-lib/aws-dax";
import { SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { CfnCacheCluster } from "aws-cdk-lib/aws-elasticache";
import { Construct } from "constructs";
import { ELASTICACHE_STACK_NAME } from "../modules/knowledge-based-engine-service/src/helpers/generic/constants";

export class ElastiCacheStack extends Stack {
  public readonly vpc: Vpc;
  public readonly redisCache: CfnCacheCluster;
  public readonly redisSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.vpc = this.createVpc();
    this.redisSecurityGroup = this.createSecurityGroup(this.vpc);
    this.redisCache = this.createCache(this.redisSecurityGroup);
  }

  private createVpc() {
    return new Vpc(this, `${ELASTICACHE_STACK_NAME}Vpc`, {
      maxAzs: 1,
      cidr: "10.32.0.0/24",
      natGateways: 1,
      subnetConfiguration: [
        {
          name: `${ELASTICACHE_STACK_NAME}PublicSubnet`,
          subnetType: SubnetType.PUBLIC,
        },
        {
          name: `${ELASTICACHE_STACK_NAME}PrivateSubnet`,
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }

  private createSecurityGroup(vpc: Vpc): SecurityGroup {
    return new SecurityGroup(
      this,
      `${ELASTICACHE_STACK_NAME}redisSecurityGroup`,
      {
        vpc,
        allowAllOutbound: true,
        description: "Security group for the redis cluster",
      }
    );
  }

  private createCache(redisSecurityGroup: SecurityGroup): CfnCacheCluster {
    const redisSubnetGroup = new CfnSubnetGroup(
      this,
      `${ELASTICACHE_STACK_NAME}redisSubnetGroup`,
      {
        description: "Subnet group for the redis cluster",
        subnetIds: this.vpc.publicSubnets.map((ps) => ps.subnetId),
        subnetGroupName: "POC-Redis-Subnet-Group",
      }
    );

    const redisCache = new CfnCacheCluster(
      this,
      `${ELASTICACHE_STACK_NAME}redisCache`,
      {
        engine: "redis",
        cacheNodeType: "cache.t2.micro",
        numCacheNodes: 1,
        clusterName: "POC-Cluster",
        vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
        cacheSubnetGroupName: redisSubnetGroup.ref,
        engineVersion: "6.2",
        preferredMaintenanceWindow: "fri:00:30-fri:01:30",
      }
    );

    redisCache.addDependency(redisSubnetGroup);

    new CfnOutput(this, `${ELASTICACHE_STACK_NAME}CacheEndpointUrl`, {
      value: redisCache.attrRedisEndpointAddress,
    });

    new CfnOutput(this, `${ELASTICACHE_STACK_NAME}CachePort`, {
      value: redisCache.attrRedisEndpointPort,
    });

    return redisCache;
  }
}
