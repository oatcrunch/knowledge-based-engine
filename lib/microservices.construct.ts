import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { QUESTION_SEEDER_FN, QUESTION_SEEDER_MEMORY_GB, QUESTION_SEEDER_RETRIES_TIMEOUT } from "../modules/knowledge-based-engine-service/src/helpers/generic/constants";

export interface IMicroserviceProps {
    questionTbl: ITable;
}

export class KnowledgeMicroservicesConstruct extends Construct {
    public readonly handleQuestionSeedingFn: NodejsFunction;

    constructor(scope: Construct, id: string, props: IMicroserviceProps) {
        super(scope, id);
        this.handleQuestionSeedingFn = this.createQuestionsSeedFn(
            props.questionTbl
        );
    }

    private createQuestionsSeedFn(dbTable: ITable): NodejsFunction {
        const fn = new NodejsFunction(this, QUESTION_SEEDER_FN!, {
            functionName: QUESTION_SEEDER_FN,
            memorySize: QUESTION_SEEDER_MEMORY_GB,
            timeout: cdk.Duration.seconds(QUESTION_SEEDER_RETRIES_TIMEOUT),
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'main',
            entry: join(
                __dirname,
                '/../modules/knowledge-based-engine-service/src/handlers/handle-question-seeder.ts'
            ),
            bundling: {
                minify: true,
                externalModules: ['aws-sdk'],
            },
            environment: {
                PRIMARY_KEY: 'id',
                SORT_KEY: 'QuestionRefId',
                MAIL_TRAIL_TABLE_NAME: dbTable.tableName,
            },
        });
        dbTable.grantWriteData(fn); // to allow lambda function to write data to database
        return fn;
    }
}