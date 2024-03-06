import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface KnowledgeApiGatewayProps {
    questionMicroservice: IFunction;
}

export class KnowledgeApiGatewayConstruct extends Construct {
    constructor(scope: Construct, id: string, props: KnowledgeApiGatewayProps) {
        super(scope, id);

        this.createQuestionApi(props.questionMicroservice);
    }

    private createQuestionApi(questionMicroservice: IFunction) {
        const apiGateway = new LambdaRestApi(this, 'questionApi', {
            restApiName: 'questionService',
            handler: questionMicroservice,
            proxy: false
        });

        const question = apiGateway.root.addResource('question');
        question.addMethod('POST');
    }
}