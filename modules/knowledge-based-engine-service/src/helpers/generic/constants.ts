// DynamoDB related
export const QUESTION_TABLE_NAME = 'Question';
export const TEMPLATE_TABLE_NAME = 'Template';
export const RULE_TABLE_NAME = 'Rule';
export const KNOWLEDGE_SESSION_TABLE_NAME = 'KnowledgeSession';

// Microservices related
export const SEEDER_FN = 'QuestionSeederFn';
export const SEEDER_RETRIES_TIMEOUT = 360;
export const SEEDER_MEMORY_GB = 128;

export const QUESTION_FN = 'QuestionFn';
export const QUESTION_RETRIES_TIMEOUT = 360;
export const QUESTION_MEMORY_GB = 128;

export const TEMPLATE_FN = 'TemplateFn';
export const TEMPLATE_RETRIES_TIMEOUT = 360;
export const TEMPLATE_MEMORY_GB = 128;
