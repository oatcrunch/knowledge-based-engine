import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { KnowledgeDbConstruct } from './dynamodb.construct';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class KnowledgeBasedEngineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const database = new KnowledgeDbConstruct(this, 'Database');

    // example resource
    // const queue = new sqs.Queue(this, 'KnowledgeBasedEngineQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
