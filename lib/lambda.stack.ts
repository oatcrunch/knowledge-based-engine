import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elasticcache from "aws-cdk-lib/aws-elasticache";
import { Role, ManagedPolicy, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import {
  QUESTION_FN,
  QUESTION_RETRIES_TIMEOUT,
  SEEDER_FN,
  SEEDER_MEMORY_GB,
  SEEDER_RETRIES_TIMEOUT,
} from "../modules/knowledge-based-engine-service/src/helpers/generic/constants";
import { join } from "path";

const stackName = "LambdaStack";

interface LambdaStackProps extends StackProps {
  redisCache: elasticcache.CfnCacheCluster;
  vpc: ec2.Vpc;
  redisSG: ec2.SecurityGroup;
  questionTbl: ITable;
  templateTbl: ITable;
  ruleTbl: ITable;
}
export class LambdaStack extends Stack {
  public readonly handleSeederFn: NodejsFunction;
  public readonly handleQuestionFn: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const lambdaRole = new Role(this, `${stackName}lambdaRole`, {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonElastiCacheFullAccess")
    );

    lambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaENIManagementAccess"
      )
    );

    const lambdaSG = new ec2.SecurityGroup(this, `${stackName}lambdaSG`, {
      vpc: props.vpc,
      allowAllOutbound: true,
      securityGroupName: "redis-lambdaFn Security Group",
    });

    lambdaSG.connections.allowTo(
      props.redisSG,
      ec2.Port.tcp(6379),
      "Allow this lambda function connect to the redis cache"
    );

    this.handleSeederFn = this.createSeederFn(
      props.questionTbl,
      props.templateTbl,
      props.ruleTbl
    );

    this.handleQuestionFn = this.createQuestionFn(
      lambdaRole,
      props,
      lambdaSG,
      props.questionTbl
    );
  }

  private createSeederFn(
    questionTbl: ITable,
    templateTbl: ITable,
    ruleTbl: ITable
  ): NodejsFunction {
    const fn = new NodejsFunction(this, SEEDER_FN!, {
      functionName: SEEDER_FN,
      memorySize: SEEDER_MEMORY_GB,
      timeout: cdk.Duration.seconds(SEEDER_RETRIES_TIMEOUT),
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "main",
      entry: join(
        __dirname,
        "/../modules/knowledge-based-engine-service/src/handlers/handle-seeder.ts"
      ),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
    });
    questionTbl.grantWriteData(fn);
    templateTbl.grantWriteData(fn);
    ruleTbl.grantWriteData(fn);
    return fn;
  }

  private createQuestionFn(
    lambdaRole: cdk.aws_iam.Role,
    props: LambdaStackProps,
    lambdaSG: cdk.aws_ec2.SecurityGroup,
    questionTable: ITable
  ) {
    const fn = new NodejsFunction(this, `${stackName}${QUESTION_FN}`, {
      functionName: QUESTION_FN,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "main",
      entry: join(
        __dirname,
        "/../modules/knowledge-based-engine-service/src/handlers/handle-question.ts"
      ),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      role: lambdaRole,
      timeout: cdk.Duration.seconds(QUESTION_RETRIES_TIMEOUT),
      vpc: props.vpc,
      securityGroups: [lambdaSG],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      environment: {
        CACHE_URL: `redis://${props.redisCache.attrRedisEndpointAddress}:${props.redisCache.attrRedisEndpointPort}`,
      },
    });
    questionTable.grantReadData(fn);
    return fn;
  }
}
