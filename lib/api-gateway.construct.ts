import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface IKbeApiGatewayProps {
    seederMicroservice: IFunction;
    questionMicroservice: IFunction;
    templateMicroservice: IFunction;
}

export class KbeApiGatewayConstruct extends Construct {
    constructor(scope: Construct, id: string, props: IKbeApiGatewayProps) {
        super(scope, id);

        this.createSeederApi(props.seederMicroservice);
        this.createQuestionApi(props.questionMicroservice);
        this.createTemplateApi(props.templateMicroservice);
    }

    private createSeederApi(seederMicroservice: IFunction) {
        const apiGateway = new LambdaRestApi(this, 'seederApi', {
            restApiName: 'seederService',
            handler: seederMicroservice,
            proxy: false,
        });

        const seeder = apiGateway.root.addResource('seeder');
        seeder.addMethod('POST');
    }

    private createQuestionApi(questionMicroservice: IFunction) {
        const apiGateway = new LambdaRestApi(this, 'questionApi', {
            restApiName: 'questionService',
            handler: questionMicroservice,
            proxy: false,
        });

        const question = apiGateway.root.addResource('question');
        const nextQuestion = question.addResource('next');
        nextQuestion.addMethod('PUT');
    }

    private createTemplateApi(templateMicroservice: IFunction) {
        const apiGateway = new LambdaRestApi(this, 'templateApi', {
            restApiName: 'templateService',
            handler: templateMicroservice,
            proxy: false,
        });

        const template = apiGateway.root.addResource('template');
        template.addMethod('POST');
    }
}
