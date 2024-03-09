import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

export const main = async (
    event: APIGatewayEvent,
    context: Context,
): Promise<APIGatewayProxyResult> => {
    console.log('event 👉', event);
    try {
        if (event.httpMethod === 'POST') {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'TODO',
                }),
            };
        }
        throw new Error('HTTP method unsupported');
    } catch (err: any) {
        console.error(
            `Exception thrown at function handle-template.main: ${err}`,
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
