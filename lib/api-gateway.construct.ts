import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface KnowledgeApiGatewayProps {
    seederMicroservice: IFunction;
    questionMicroservice: IFunction;
}

export class KnowledgeApiGatewayConstruct extends Construct {
    constructor(scope: Construct, id: string, props: KnowledgeApiGatewayProps) {
        super(scope, id);

        this.createSeederApi(props.seederMicroservice);
        this.createQuestionApi(props.questionMicroservice);
    }

    private createSeederApi(seederMicroservice: IFunction) {
        const apiGateway = new LambdaRestApi(this, 'seederApi', {
            restApiName: 'seederService',
            handler: seederMicroservice,
            proxy: false
        });

        const question = apiGateway.root.addResource('seeder');
        question.addMethod('POST');
    }

    private createQuestionApi(questionMicroservice: IFunction) {
        const apiGateway = new LambdaRestApi(this, 'questionApi', {
            restApiName: 'questionService',
            handler: questionMicroservice,
            proxy: false
        });

        const question = apiGateway.root.addResource('question');
        const nextQuestion = question.addResource('next');
        nextQuestion.addMethod('PUT');
    }   
}