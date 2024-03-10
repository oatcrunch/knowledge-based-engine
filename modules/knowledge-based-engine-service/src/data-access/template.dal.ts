import { TEMPLATE_TABLE_NAME } from "../helpers/generic/constants";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "./db-client";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { Template } from "../models/template";

export class TemplateDal {
    public async find(hash: string): Promise<Template> {
        const params = {
            TableName: TEMPLATE_TABLE_NAME,
            KeyConditionExpression: 'HashedResponse = :HashedResponse',
            ExpressionAttributeValues: {
                ':HashedResponse': { S: hash },
            },
            ScanIndexForward: false,
            Limit: 1,
        };

        const { Items } = await ddbClient.send(new QueryCommand(params));
        const results = Items ? Items?.map((item) => unmarshall(item)) : [];
        let template: Template = {
            title: '',
            description: '',
            refId: ''
        };
        if (results.length > 0) {
            template.refId = results[0].RefId;
            template.description = results[0].Description;
            template.title = results[0].Title;
        }

        return template;
    }
}