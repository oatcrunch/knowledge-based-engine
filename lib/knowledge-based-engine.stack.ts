import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { KbeDbConstruct } from './dynamodb.construct';
import { KbeMicroservicesConstruct } from './microservices.construct';
import { KbeApiGatewayConstruct } from './api-gateway.construct';

export class KnowledgeBasedEngineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        const database = new KbeDbConstruct(this, 'Database');

        const microservices = new KbeMicroservicesConstruct(
            this,
            'Microservices',
            {
                questionTbl: database.questionTable,
                templateTbl: database.templateTable,
                ruleTbl: database.ruleTable,
                knowledgeSessionTable: database.knowledgeSessionTable,
            },
        );

        const apiGateway = new KbeApiGatewayConstruct(this, 'ApiGateway', {
            seederMicroservice: microservices.handleSeederFn,
            questionMicroservice: microservices.handleQuestionFn,
            templateMicroservice: microservices.handleTemplateFn,
        });
    }
}
// test commit