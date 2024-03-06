import { PutItemCommand, DynamoDB } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../../data-access/db-client";
import { QUESTION_TABLE_NAME } from "../generic/constants";
import { marshall } from '@aws-sdk/util-dynamodb';

export const uploadQuestionsData = async () => {
    try {
        const data: any[] = require('../../../data/questions.json');
        console.log('data', data);
        if (data && data.length > 0) {
            for (const d of data) {
                console.log('d', d);
                const params = {
                    TableName: QUESTION_TABLE_NAME,
                    Item: marshall(d || {}),
                };
                const createResult = await ddbClient.send(new PutItemCommand(params));
                console.log(
                    `persistData - createResult: "${JSON.stringify(createResult)}"`
                );
            }

            // const dynamodb = new DynamoDB({});
            // const params = {
            //     RequestItems: {
            //         QUESTION_TABLE_NAME: data.map((item) => ({
            //             PutRequest: {
            //                 Item: marshall(item || {})
            //             }
            //         }))
            //     }
            // };

            // dynamodb.batchWriteItem(params, (err: any, data: any) => {
            //     if (err) {
            //         console.error('Error inserting items:', err);
            //     } else {
            //         console.log('Items inserted successfully:', data);
            //     }
            // });
        }
    } catch (err) {
        console.error('Exception caught in uploadQuestionsData', err);
    }
}
