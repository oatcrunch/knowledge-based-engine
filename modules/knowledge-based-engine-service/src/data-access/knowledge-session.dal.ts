import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { KnowledgeSessionResponse } from '../dto/knowledge-session.dto';
import { KNOWLEDGE_SESSION_TABLE_NAME } from '../helpers/generic/constants';
import { ddbClient } from './db-client';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export class KnowledgeSessionDAL {
    public async save(data: KnowledgeSessionResponse): Promise<boolean> {
        try {
            const params = {
                TableName: KNOWLEDGE_SESSION_TABLE_NAME,
                Item: marshall(
                    {
                        SessionId: data.sessionId,
                        Response: data.response,
                    } || {},
                ),
            };
            const createResult = await ddbClient.send(
                new PutItemCommand(params),
            );
            console.log(
                `persistData - createResult: "${JSON.stringify(createResult)}"`,
            );
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    public async find(sessionId: string): Promise<KnowledgeSessionResponse> {
        const params = {
            TableName: KNOWLEDGE_SESSION_TABLE_NAME,
            KeyConditionExpression: 'SessionId = :SessionId',
            ExpressionAttributeValues: {
                ':SessionId': { S: sessionId },
            },
            ScanIndexForward: false,
            Limit: 1,
        };
        const { Items } = await ddbClient.send(new QueryCommand(params));
        const results = Items ? Items?.map((item) => unmarshall(item)) : [];
        let sesionResponse: KnowledgeSessionResponse = {
            sessionId,
            response: [],
        };
        if (results.length > 0) {
            sesionResponse.response = results[0].Response;
        }
        return sesionResponse;
    }
}
