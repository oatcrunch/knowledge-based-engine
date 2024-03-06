import { Question } from "../dto/question.dto";

export class QuestionDAL {
    public find(nextQuestionRefId: number): Question {
        throw new Error('TODO');
    }

    public findBy(currentQuestionId: number, previousQuestionId: number, answer: any): Question {
        throw new Error('TODO');
    }
}