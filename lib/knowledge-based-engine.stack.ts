import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { KnowledgeDbConstruct } from "./dynamodb.construct";
import { KnowledgeApiGatewayConstruct } from "./api-gateway.construct";
import { ElastiCacheStack } from "./elasticache.stack";
import { LambdaStack } from "./lambda.stack";

export class KnowledgeBasedEngineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const database = new KnowledgeDbConstruct(this, "Database");

    const elastiCacheStack = new ElastiCacheStack(this, 'ElastiCache', {
      env: {
        region: 'ap-southeast-1'
      }
    });
    const lambdaStack = new LambdaStack(this, 'Microservices', {
      redisCache: elastiCacheStack.redisCache,
      redisSG: elastiCacheStack.redisSecurityGroup,
      vpc: elastiCacheStack.vpc,
      questionTbl: database.questionTable,
      templateTbl: database.templateTable,
      ruleTbl: database.ruleTable,
      env: {
        region: 'ap-southeast-1'
      }
    });

    // const microservices = new KnowledgeMicroservicesConstruct(this, 'Microservices', {
    //   questionTbl: database.questionTable,
    //   templateTbl: database.templateTable,
    //   ruleTbl: database.ruleTable
    // });

    const apiGateway = new KnowledgeApiGatewayConstruct(this, "ApiGateway", {
      seederMicroservice: lambdaStack.handleSeederFn,
      questionMicroservice: lambdaStack.handleQuestionFn
    });

    // const cache = new KnowledgeElastiCacheConstruct(this, 'ElastiCache', {
    //   questionMicroservice: microservices.handleQuestionFn
    // });

    // example resource
    // const queue = new sqs.Queue(this, 'KnowledgeBasedEngineQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
