import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Question, QuestionType } from "../dto/question.dto";
import { QUESTION_TABLE_NAME } from "../helpers/generic/constants";
import { ddbClient } from "./db-client";
import { GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

export class QuestionDAL {
  public async find(questionRefId: number): Promise<Question> {
    // const params = {
    //   TableName: QUESTION_TABLE_NAME,
    //   KeyConditionExpression: "QuestionRefId = :QuestionRefId",
    //   ExpressionAttributeValues: {
    //     ":QuestionRefId": { N: questionRefId },
    //   },
    //   ScanIndexForward: false,
    //   Limit: 1,
    // };
    const params = {
      TableName: QUESTION_TABLE_NAME,
      KeyConditionExpression: "QuestionRefId = :QuestionRefId",
      ExpressionAttributeValues: marshall({ ":QuestionRefId": questionRefId }),
      ScanIndexForward: false,
      Limit: 1,
    };
    const { Items } = await ddbClient.send(new QueryCommand(params));
    console.log("item", Items);
    const results = Items ? Items?.map((item) => unmarshall(item)) : [];
    let question: Question = {
      refId: "",
      text: "",
      type: QuestionType.Undefined,
    };
    if (results.length > 0) {
      question = {
        refId: results[0].QuestionRefId,
        text: results[0].Text,
        type: results[0].Type,
        options: results[0].Options,
      };
    }
    console.log("results", results);
    return question;
  }
}
