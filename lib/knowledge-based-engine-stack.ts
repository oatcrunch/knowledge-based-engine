import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { KnowledgeDbConstruct } from './dynamodb.construct';
import { KnowledgeMicroservicesConstruct } from './microservices.construct';
import { KnowledgeApiGatewayConstruct } from './api-gateway.construct';

export class KnowledgeBasedEngineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const database = new KnowledgeDbConstruct(this, 'Database');

    const microservices = new KnowledgeMicroservicesConstruct(this, 'Microservices', {
      questionTbl: database.questionTable,
      templateTbl: database.templateTable,
      ruleTbl: database.ruleTable
    });

    const apiGateway = new KnowledgeApiGatewayConstruct(this, 'ApiGateway', {
      seederMicroservice: microservices.handleSeederFn,
      questionMicroservice: microservices.handleQuestionFn
    });

    // example resource
    // const queue = new sqs.Queue(this, 'KnowledgeBasedEngineQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
