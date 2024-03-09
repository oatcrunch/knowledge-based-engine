import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import {
    QUESTION_FN,
    QUESTION_MEMORY_GB,
    QUESTION_RETRIES_TIMEOUT,
    SEEDER_FN,
    SEEDER_MEMORY_GB,
    SEEDER_RETRIES_TIMEOUT,
    TEMPLATE_FN,
    TEMPLATE_MEMORY_GB,
    TEMPLATE_RETRIES_TIMEOUT,
} from '../modules/knowledge-based-engine-service/src/helpers/generic/constants';

export interface IKbeMicroserviceProps {
    questionTbl: ITable;
    templateTbl: ITable;
    ruleTbl: ITable;
    knowledgeSessionTable: ITable;
}

export class KbeMicroservicesConstruct extends Construct {
    public readonly handleSeederFn: NodejsFunction;
    public readonly handleQuestionFn: NodejsFunction;
    public readonly handleTemplateFn: NodejsFunction;

    constructor(scope: Construct, id: string, props: IKbeMicroserviceProps) {
        super(scope, id);
        this.handleSeederFn = this.createSeederFn(
            props.questionTbl,
            props.templateTbl,
            props.ruleTbl,
        );
        this.handleQuestionFn = this.createQuestionFn(
            props.questionTbl,
            props.knowledgeSessionTable,
            props.ruleTbl,
        );
        this.handleTemplateFn = this.createTemplateFn(
            props.templateTbl,
            props.knowledgeSessionTable,
        );
    }

    private createSeederFn(
        questionTbl: ITable,
        templateTbl: ITable,
        ruleTbl: ITable,
    ): NodejsFunction {
        const fn = new NodejsFunction(this, SEEDER_FN!, {
            functionName: SEEDER_FN,
            memorySize: SEEDER_MEMORY_GB,
            timeout: cdk.Duration.seconds(SEEDER_RETRIES_TIMEOUT),
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'main',
            entry: join(
                __dirname,
                '/../modules/knowledge-based-engine-service/src/handlers/handle-seeder.ts',
            ),
            bundling: {
                minify: true,
                externalModules: ['aws-sdk'],
            },
        });
        questionTbl.grantWriteData(fn);
        templateTbl.grantWriteData(fn);
        ruleTbl.grantWriteData(fn);
        return fn;
    }

    private createQuestionFn(
        questionTbl: ITable,
        knowledgeSessionTable: ITable,
        ruleTable: ITable,
    ) {
        const fn = new NodejsFunction(this, QUESTION_FN!, {
            functionName: QUESTION_FN,
            memorySize: QUESTION_MEMORY_GB,
            timeout: cdk.Duration.seconds(QUESTION_RETRIES_TIMEOUT),
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'main',
            entry: join(
                __dirname,
                '/../modules/knowledge-based-engine-service/src/handlers/handle-question.ts',
            ),
            bundling: {
                minify: true,
                externalModules: ['aws-sdk'],
            },
        });
        questionTbl.grantReadData(fn);
        knowledgeSessionTable.grantReadWriteData(fn);
        ruleTable.grantReadData(fn);
        return fn;
    }

    private createTemplateFn(
        templateTbl: ITable,
        knowledgeSessionTable: ITable,
    ) {
        const fn = new NodejsFunction(this, TEMPLATE_FN!, {
            functionName: TEMPLATE_FN,
            memorySize: TEMPLATE_MEMORY_GB,
            timeout: cdk.Duration.seconds(TEMPLATE_RETRIES_TIMEOUT),
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'main',
            entry: join(
                __dirname,
                '/../modules/knowledge-based-engine-service/src/handlers/handle-template.ts',
            ),
            bundling: {
                minify: true,
                externalModules: ['aws-sdk'],
            },
        });
        templateTbl.grantReadData(fn);
        knowledgeSessionTable.grantReadData(fn);
        return fn;
    }
}
