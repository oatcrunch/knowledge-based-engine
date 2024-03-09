import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import {
    uploadQuestionsData,
    uploadRuleData,
    uploadTemplateData,
} from '../helpers/upload/upload-util';

export const main = async (
    event: APIGatewayEvent,
    context: Context,
): Promise<APIGatewayProxyResult> => {
    console.log('event 👉', event);
    try {
        console.log('Uploading question data');
        await uploadQuestionsData();

        console.log('Uploading template data');
        await uploadTemplateData();

        console.log('Uploading rule data');
        await uploadRuleData();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully seeded questions data',
            }),
        };
    } catch (err: any) {
        console.error(
            `Exception thrown at function handle-email-success.main: ${err}`,
        );
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to perform operation',
                errorMsg: err.message,
                errorStack: err.stack,
            }),
        };
    }
};
