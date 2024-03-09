import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { Rule } from "../dto/rule.dto";
import { RULE_TABLE_NAME } from "../helpers/generic/constants";
import { ddbClient } from "./db-client";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export class RuleDAL {
    public async findAllBy(
        currentQuestionId: number,
        previousQuestionId: number
      ): Promise<Rule[]> {
        const params = {
          TableName: RULE_TABLE_NAME,
          KeyConditionExpression: 'sourceQuestionRefId_currentQuestionRefId = :key',
          ExpressionAttributeValues: {
            ':key': { S: `${previousQuestionId}_${currentQuestionId}` }
          },
          // KeyConditionExpression:
          //   "SourceQuestionRefId = :SourceQuestionRefId AND CurrentQuestionRefId = :CurrentQuestionRefId",
          // ExpressionAttributeValues: {
          //   ":SourceQuestionRefId": { S: previousQuestionId.toString() },
          //   ":CurrentQuestionRefId": { S: currentQuestionId.toString() },
          // },
          ScanIndexForward: false,
          // Limit: 1,
        };
        const { Items } = await ddbClient.send(new QueryCommand(params));
        const umarshalledItems = Items?.map((item) => unmarshall(item));
        console.log("umarshalledItems", umarshalledItems);
        const results: Rule[] = umarshalledItems.map((p) => {
          const [sourceQuestionRefId, currentQuestionRefId] = p['sourceQuestionRefId_currentQuestionRefId'].split('_');
          return {
            sourceQuestionRefId,
            currentQuestionRefId,
            nextQuestionRefId: p.NextQuestionRefId,
            rule: p.Rule
          }
        });

        return results;


        // const [sourceQuestionRefId, currentQuestionRefId] = umarshalledItems[0].split('_');
        // console.log(`${sourceQuestionRefId}, ${currentQuestionId}`);

        // return <Rule>{
        //   sourceQuestionRefId,
        //   currentQuestionRefId,
        //   // sourceQuestionRefId: umarshalledItems[0].SourceQuestionRefId,
        //   // currentQuestionRefId: umarshalledItems[0].CurrentQuestionRefId,
        //   nextQuestionRefId: umarshalledItems[0].NextQuestionRefId,
        //   rule: umarshalledItems[0].Rule,
        // };
      }
}