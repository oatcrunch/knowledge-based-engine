import { RemovalPolicy } from 'aws-cdk-lib';
import {
    AttributeType,
    BillingMode,
    ITable,
    Table,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import {
    QUESTION_TABLE_NAME,
    RULE_TABLE_NAME,
    KNOWLEDGE_SESSION_TABLE_NAME,
    TEMPLATE_TABLE_NAME,
} from '../modules/knowledge-based-engine-service/src/helpers/generic/constants';

export class KbeDbConstruct extends Construct {
    public readonly questionTable: ITable;
    public readonly templateTable: ITable;
    public readonly ruleTable: ITable;
    public readonly knowledgeSessionTable: ITable;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.questionTable = this.createQuestionTable();
        this.templateTable = this.createTemplateTable();
        this.ruleTable = this.createRuleTable();
        this.knowledgeSessionTable = this.createKnowledgeSessionTable();
    }

    private createQuestionTable(): ITable {
        return new Table(this, QUESTION_TABLE_NAME!, {
            partitionKey: {
                name: 'QuestionRefId',
                type: AttributeType.NUMBER,
            },
            tableName: QUESTION_TABLE_NAME,
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        });
    }

    private createTemplateTable(): ITable {
        return new Table(this, TEMPLATE_TABLE_NAME!, {
            partitionKey: {
                name: 'HashedResponse',
                type: AttributeType.STRING,
            },
            tableName: TEMPLATE_TABLE_NAME,
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        });
    }

    private createRuleTable(): ITable {
        const table = new Table(this, RULE_TABLE_NAME!, {
            partitionKey: {
                name: 'SourceQuestionRefId_CurrentQuestionRefId',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'Id',
                type: AttributeType.NUMBER,
            },
            tableName: RULE_TABLE_NAME,
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        });

        return table;
    }

    private createKnowledgeSessionTable(): ITable {
        const table = new Table(this, KNOWLEDGE_SESSION_TABLE_NAME!, {
            partitionKey: {
                name: 'SessionId',
                type: AttributeType.STRING,
            },
            tableName: KNOWLEDGE_SESSION_TABLE_NAME,
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        });

        return table;
    }
}
