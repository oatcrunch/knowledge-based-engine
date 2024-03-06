import { RemovalPolicy } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  ITable,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import {
  QUESTION_TABLE_NAME,
  RULE_TABLE_NAME,
  TEMPLATE_TABLE_NAME,
} from "../modules/knowledge-based-engine-service/src/helpers/generic/constants";

export class KnowledgeDbConstruct extends Construct {
  public readonly questionTable: ITable;
  public readonly templateTable: ITable;
  public readonly ruleTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.questionTable = this.createQuestionTable();
    this.templateTable = this.createTemplateTable();
    this.ruleTable = this.createRuleTable();
    // const questionsJsonPath = '';
    // const initialData = JSON.parse(fs.readFileSync(questionsJsonPath, 'utf8'));
  }

  private createQuestionTable(): ITable {
    return new Table(this, QUESTION_TABLE_NAME!, {
      // partitionKey: {
      //   name: "Id",
      //   type: AttributeType.NUMBER,
      // },
      // sortKey: {
      //   name: "QuestionRefId",
      //   type: AttributeType.NUMBER,
      // },
      partitionKey: {
        name: "QuestionRefId",
        type: AttributeType.STRING,
      },
      tableName: QUESTION_TABLE_NAME,
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }

  private createTemplateTable(): ITable {
    return new Table(this, TEMPLATE_TABLE_NAME!, {
      // partitionKey: {
      //   name: "Id",
      //   type: AttributeType.NUMBER,
      // },
      // sortKey: {
      //   name: "HashedResponse",
      //   type: AttributeType.STRING,
      // },
      partitionKey: {
        name: "HashedResponse",
        type: AttributeType.STRING,
      },
      tableName: TEMPLATE_TABLE_NAME,
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }

  private createRuleTable(): ITable {
    const table = new Table(this, RULE_TABLE_NAME!, {
      // partitionKey: {
      //   name: "Id",
      //   type: AttributeType.NUMBER,
      // },
      // sortKey: {
      //   name: "CurrentQuestionRefId",
      //   type: AttributeType.NUMBER,
      // },
      partitionKey: {
        name: "SourceQuestionRefId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "CurrentQuestionRefId",
        type: AttributeType.STRING,
      },
      tableName: RULE_TABLE_NAME,
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // table.addGlobalSecondaryIndex({
    //   indexName: "SourceQuestionRefIdIndex",
    //   partitionKey: { name: "SourceQuestionRefId", type: AttributeType.NUMBER },
    //   sortKey: { name: "Id", type: AttributeType.NUMBER },
    // });

    return table;
  }
}
