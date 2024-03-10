import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { KnowledgeSessionDal } from '../data-access/knowledge-session.dal';
import { TemplateDal } from '../data-access/template.dal';
const { MerkleJson } = require('merkle-json');

const knowledgeSessionDal = new KnowledgeSessionDal();
const templateDal = new TemplateDal();
const mj = new MerkleJson();

export const main = async (
    event: APIGatewayEvent,
    context: Context,
): Promise<APIGatewayProxyResult> => {
    console.log('event 👉', event);
    try {
        if (event.httpMethod === 'POST') {
            const body = event.body;
            if (!body) {
                throw new Error('Expected a body');
            }

            const parsedBody = JSON.parse(body);

            // Retrieve context based on session Id
            const currSessionId = parsedBody?.knowledgeSessionId;
            const sessionResponse =
                await knowledgeSessionDal.find(currSessionId);

            if (!sessionResponse) {
                throw new Error('Session not found');
            }

            const response = sessionResponse.response;
            if (!response || response.length < 1) {
                throw new Error('No response recorded in given context');
            }

            // Map to the desired JSON structure
            const jsonResponse = {};
            for (const r of response) {
                // Only extract MCQ or MCMA type of response
                if (r.type === 'MCQ' || r.type === 'MCMA') {
                    jsonResponse[`${r.currentQuestionId}`] = r.response;
                }
            }

            // Create hash for responses
            const hashedJson = mj.hash(jsonResponse);

            // Retrieve the right template based on responses
            const template = await templateDal.find(hashedJson);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    template,
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
