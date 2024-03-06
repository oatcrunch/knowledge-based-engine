export const QuestionType = {
    MCQ: 1 as const,
    MCMA: 2 as const,
    FreeText: 3 as const,
    Undefined: 4 as const,
};

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];
export type QuestionOption = { [key: string]: string };

export class Question {
    refId: string;
    text: string;
    type: QuestionType;
    options?: QuestionOption[];
}

export class QuestionResponse {
    prevQuestionId?: number;
    currentQuestionId?: number;
    response?: any;
}
