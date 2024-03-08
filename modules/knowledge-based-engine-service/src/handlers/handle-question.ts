import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuidv4 } from 'uuid';
import { QuestionDAL } from "../data-access/question.dal";
import { cacheClient } from "../data-access/cache-client";

const questionDal = new QuestionDAL();

export const main = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("event 👉", event);
  try {
    if (event.httpMethod === "PUT") {
      let previousQuestionId = 0;
      let currentQuestionId = 0;
      let currentSessionId: string = null;
      const qsParams = event.queryStringParameters;

      if (qsParams != null) {
        previousQuestionId = Number.parseInt(qsParams.prevQsId as string);
        currentQuestionId = Number.parseInt(qsParams.currQsId as string);
        currentSessionId = qsParams.sessionId;
      }

      console.log(`Ids: ${previousQuestionId}, ${currentQuestionId}, ${currentSessionId}`);

      if (!currentSessionId || previousQuestionId < 1 || currentQuestionId < 1) {
        const newSessionId: string = uuidv4();
        await cacheClient.connect();
        const cachingRes = await cacheClient.set(newSessionId,'{}');
        console.log('cachingRes', cachingRes);

        const question = await questionDal.find(1000);
        return {
          statusCode: 200,
          body: JSON.stringify({
            question,
            sessionId: newSessionId
          }),
        };
      }

      const body = event.body;
      if (!body) {
        throw new Error("Expected a body");
      }

      const parsedBody = JSON.parse(body);
      const response = parsedBody?.response;
      if (!response) {
        throw new Error('Expected [response] in body');
      }

      // TODO
      await cacheClient.connect();
      const prevSesionData = await cacheClient.get(currentSessionId);
      console.log('prevSessionData', prevSesionData);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Successful",
        }),
      };
    }
    throw new Error("HTTP method unsupported");
  } catch (err: any) {
    console.error(
      `Exception thrown at function handle-email-success.main: ${err}`
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

