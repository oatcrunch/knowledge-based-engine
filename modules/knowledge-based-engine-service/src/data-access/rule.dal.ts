import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { Rule } from '../dto/rule.dto';
import { RULE_TABLE_NAME } from '../helpers/generic/constants';
import { ddbClient } from './db-client';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export class RuleDAL {
    public async findAllBy(
        currentQuestionId: number,
        previousQuestionId: number,
    ): Promise<Rule[]> {
        const params = {
            TableName: RULE_TABLE_NAME,
            KeyConditionExpression:
                'SourceQuestionRefId_CurrentQuestionRefId = :key',
            ExpressionAttributeValues: {
                ':key': { S: `${previousQuestionId}_${currentQuestionId}` },
            },
            ScanIndexForward: false,
        };
        const { Items } = await ddbClient.send(new QueryCommand(params));
        const umarshalledItems = Items?.map((item) => unmarshall(item));
        console.log('umarshalledItems', umarshalledItems);
        const results: Rule[] = umarshalledItems.map((p) => {
            const [sourceQuestionRefId, currentQuestionRefId] =
                p['SourceQuestionRefId_CurrentQuestionRefId'].split('_');
            return {
                sourceQuestionRefId,
                currentQuestionRefId,
                nextQuestionRefId: p.NextQuestionRefId,
                rule: p.Rule,
                sessionEnded: p.EndOfQuestion ?? false,
            };
        });

        return results;
    }
}
