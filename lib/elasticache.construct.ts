import { CfnCacheCluster, CfnSubnetGroup } from "aws-cdk-lib/aws-elasticache";
import { Construct } from "constructs";
import * as elasticcache from "aws-cdk-lib/aws-elasticache";
import { CLUSTER_NAME } from "../modules/knowledge-based-engine-service/src/helpers/generic/constants";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { CfnOutput } from "aws-cdk-lib";

export interface IKnowledgeElasiCacheProps {
  questionMicroservice: IFunction;
}

const stackName = "cacheSeriesStack";

// REFER: https://sewb.dev/posts/cdk-series:-creating-an-elasticache-cluster-bc1zupe

export class KnowledgeElastiCacheConstruct extends Construct {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props: IKnowledgeElasiCacheProps) {
    super(scope, id);
    this.vpc = this.createVpc();
    this.createKnowledgeSessionCache(props.questionMicroservice);
  }

  private createVpc() {
    return new Vpc(this, `${stackName}Vpc`, {
      maxAzs: 1,
      cidr: "10.32.0.0/24",
      natGateways: 1,
      subnetConfiguration: [
        {
          name: `${stackName}PublicSubnet`,
          subnetType: SubnetType.PUBLIC,
        },
        {
          name: `${stackName}PrivateSubnet`,
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }

  private createKnowledgeSessionCache(questionMicroservice: IFunction) {
    const redisSubnetGroup = new elasticcache.CfnSubnetGroup(
      this,
      `${stackName}redisSubnetGroup`,
      {
        description: "Subnet group for the redis cluster",
        subnetIds: this.vpc.publicSubnets.map((ps) => ps.subnetId),
        cacheSubnetGroupName: "GT-Redis-Subnet-Group",
      }
    );

    const redisSecurityGroup = new SecurityGroup(
      this,
      `${stackName}redisSecurityGroup`,
      {
        vpc: this.vpc,
        allowAllOutbound: true,
        description: "Security group for the redis cluster",
      }
    );

    const redisCache = new elasticcache.CfnCacheCluster(
      this,
      `${stackName}redisCache`,
      {
        engine: "redis",
        cacheNodeType: "cache.t3.micro",
        numCacheNodes: 1,
        clusterName: "GT-Dev-Cluster",
        vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
        cacheSubnetGroupName: redisSubnetGroup.ref,
        engineVersion: "6.2",
        preferredMaintenanceWindow: "fri:00:30-fri:01:30",
      }
    );

    redisCache.addDependency(redisSubnetGroup);

    new CfnOutput(this, `${stackName}CacheEndpointUrl`, {
      value: redisCache.attrRedisEndpointAddress,
    });

    new CfnOutput(this, `${stackName}CachePort`, {
      value: redisCache.attrRedisEndpointPort,
    });

    // const subnetGroup = new CfnSubnetGroup(
    //   this,
    //   "RedisClusterPrivateSubnetGroup",
    //   {
    //     cacheSubnetGroupName: "privata",
    //     subnetIds: privateSubnets.subnetIds,
    //     description: "subnet di sviluppo privata",
    //   }
    // );

    // const redis = new CfnCacheCluster(this, `RedisCluster`, {
    //   engine: "redis",
    //   cacheNodeType: "cache.t2.small",
    //   numCacheNodes: 1,
    //   clusterName: "redis-sviluppo",
    //   vpcSecurityGroupIds: [vpc.defaultSecurityGroup.securityGroupId],
    //   cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName,
    // });
    // redis.addDependency(subnetGroup);

    // const cluster = new CfnCacheCluster(this, CLUSTER_NAME, {
    //   cacheNodeType: "cache.t2.micro",
    //   engine: "memcached",
    //   numCacheNodes: 1,
    // });

    questionMicroservice.addToRolePolicy(
      new PolicyStatement({
        actions: [
          "elasticache:DescribeCacheClusters",
          "elasticache:DescribeCacheNodes",
          "elasticache:ListTagsForResource",
        ],
        resources: ["*"],
      })
    );
  }
}
