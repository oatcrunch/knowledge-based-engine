import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { QuestionDal } from '../data-access/question.dal';
import { v4 as uuidv4 } from 'uuid';
import { KnowledgeSessionDal } from '../data-access/knowledge-session.dal';
import { RuleDal } from '../data-access/rule.dal';
import { Question } from '../models/question';

const questionDal = new QuestionDal();
const knowledgeSessionDal = new KnowledgeSessionDal();
const ruleDal = new RuleDal();

export const main = async (
    event: APIGatewayEvent,
    context: Context,
): Promise<APIGatewayProxyResult> => {
    console.log('event 👉', event);
    try {
        if (event.httpMethod === 'PUT') {
            let previousQuestionId = -1;
            let currentQuestionId = -1;
            const qsParams = event.queryStringParameters;

            if (qsParams != null) {
                previousQuestionId = Number.parseInt(
                    qsParams.prevQsId as string,
                );
                currentQuestionId = Number.parseInt(
                    qsParams.currQsId as string,
                );
            }

            // If previous question is undefined, treat it as first time, take the first question
            if (currentQuestionId < 0) {
                const sessionId = uuidv4();
                await knowledgeSessionDal.save({ sessionId, response: [] });
                const question = await questionDal.find(1000);
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        question,
                        knowledgeSessionId: sessionId,
                        sessionEnded: false,
                        context: {},
                    }),
                };
            }

            const body = event.body;
            if (!body) {
                throw new Error('Expected a body');
            }

            const parsedBody = JSON.parse(body);
            const responseAnswer = parsedBody?.response;
            if (!responseAnswer) {
                throw new Error('Expected [response] in body');
            }

            // This point forward is assuming that previous session was captured
            const currSessionId = parsedBody?.knowledgeSessionId;
            const sessionResponse =
                await knowledgeSessionDal.find(currSessionId);

            if (!sessionResponse) {
                throw new Error('Session not found');
            }

            // Get the type of question from current question
            const currQuestion = await questionDal.find(currentQuestionId);
            if (!currQuestion || !currQuestion.refId) {
                throw new Error('Current question Id is invalid');
            }
            const type = currQuestion.type;

            // Update response trail based on the knowledge context of a given session
            sessionResponse.response.push({
                currentQuestionId,
                previousQuestionId,
                type,
                response: responseAnswer,
            });

            // Store the updated knowledge context
            await knowledgeSessionDal.save({
                sessionId: currSessionId,
                response: sessionResponse?.response,
            });

            // Get the corresponding rule to look for the next question
            const rules = await ruleDal.findAllBy(
                currentQuestionId,
                previousQuestionId,
            );

            let nextQuestion: Question | {} = {};
            let questionHasEnded = false;

            if (rules.length > 0) {
                const exactRule = rules?.find((p) => {
                    // If question is multiple choice multiple answer
                    const kind = p.rule.kind;
                    console.log('kind', kind);
                    if (kind === 'MCMA') {
                        const parsedResponseAns = JSON.parse(responseAnswer);
                        return parsedResponseAns === p.rule.eq;
                    } else if (kind === 'MCQ') {
                        const parsedResponseAns =
                            Number.parseInt(responseAnswer);
                        return parsedResponseAns === p.rule.eq;
                    }
                    // Otherwise, we assume that it is free text, skip equality check
                    return true;
                });

                if (!exactRule) {
                    throw Error('Rule not found');
                }

                // Query for the next question
                questionHasEnded = exactRule.sessionEnded;
                const nextQuestionRefId = exactRule.nextQuestionRefId;
                console.log('nextQuestionRefId', nextQuestionRefId);
                if (nextQuestionRefId) {
                    nextQuestion = await questionDal.find(
                        Number.parseInt(nextQuestionRefId),
                    );
                }
            }

            // Retrieve current knowledge context
            const context = await knowledgeSessionDal.find(currSessionId);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    question: nextQuestion,
                    knowledgeSessionId: currSessionId,
                    sessionEnded: questionHasEnded,
                    context,
                }),
            };
        }
        throw new Error('HTTP method unsupported');
    } catch (err: any) {
        console.error(
            `Exception thrown at function handle-question.main: ${err}`,
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
