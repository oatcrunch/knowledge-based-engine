import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { QuestionDAL } from "../data-access/question.dal";
import { v4 as uuidv4 } from "uuid";
import { KnowledgeSessionDAL } from "../data-access/knowledge-session.dal";
import { RuleDAL } from "../data-access/rule.dal";
import { Question } from "../dto/question.dto";

const questionDal = new QuestionDAL();
const knowledgeSessionDal = new KnowledgeSessionDAL();
const ruleDal = new RuleDAL();

export const main = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("event 👉", event);
  try {
    if (event.httpMethod === "PUT") {
      let previousQuestionId = -1;
      let currentQuestionId = -1;
      let sessionId = "";
      const qsParams = event.queryStringParameters;

      if (qsParams != null) {
        previousQuestionId = Number.parseInt(qsParams.prevQsId as string);
        currentQuestionId = Number.parseInt(qsParams.currQsId as string);
      }

      console.log(`Ids: ${previousQuestionId}, ${currentQuestionId}`);

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
            context: {}
          }),
        };
      }

      const body = event.body;
      if (!body) {
        throw new Error("Expected a body");
      }

      const parsedBody = JSON.parse(body);
      const responseAnswer = parsedBody?.response;

      if (!responseAnswer) {
        throw new Error("Expected [response] in body");
      }

      // TODO
      const currSessionId = parsedBody?.knowledgeSessionId;
      console.log(`currentSessionId: ${currSessionId}`);
      const sessionResponse = await knowledgeSessionDal.find(currSessionId);
      console.log(`sessionResponse ${sessionResponse}`);

      sessionResponse?.response.push({
        currentQuestionId,
        previousQuestionId,
        response: responseAnswer,
      });
      
      await knowledgeSessionDal.save({
        sessionId: currSessionId,
        response: sessionResponse?.response,
      });

      const rules = await ruleDal.findAllBy(
        currentQuestionId,
        previousQuestionId,
      );
      console.log('Rules', rules);

      let nextQuestion: Question | {} = {};

      if (rules.length > 0) {
        const exactRule = rules?.find((p) => {
          if (p.rule.isMultipleAnswer) {
            const parsedResponseAns = JSON.parse(responseAnswer);
            return parsedResponseAns === p.rule.eq;
          }
          console.log(`responseAns: ${responseAnswer}`);
          const parsedResponseAns = Number.parseInt(responseAnswer);
          console.log('parsedResponseAns', parsedResponseAns);
          console.log('p.rule.eq', p.rule.eq);
          return parsedResponseAns === p.rule.eq;
        });
  
        console.log('exactRule', exactRule);
  
        const nextQuestionRefId = Number.parseInt(exactRule.nextQuestionRefId);
        console.log('nextQuestionRefId', nextQuestionRefId);
        nextQuestion = await questionDal.find(nextQuestionRefId);
      }

      const context = await knowledgeSessionDal.find(currSessionId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          question: nextQuestion,
          knowledgeSessionId: currSessionId,
          sessionEnded: true,
          context
        }),
      };
    }
    throw new Error("HTTP method unsupported");
  } catch (err: any) {
    console.error(
      `Exception thrown at function handle-question.main: ${err}`
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to perform operation",
        errorMsg: err.message,
        errorStack: err.stack,
      }),
    };
  }
};
