// DynamoDB related
export const QUESTION_TABLE_NAME = 'Question'
export const TEMPLATE_TABLE_NAME = 'Template'
export const RULE_TABLE_NAME = 'Rule'

// Microservices related
export const SEEDER_FN = 'QuestionSeederFn';
export const SEEDER_RETRIES_TIMEOUT = 360;
export const SEEDER_MEMORY_GB = 128;

export const QUESTION_FN = 'QuestionFn';
export const QUESTION_RETRIES_TIMEOUT = 360;
export const QUESTION_MEMORY_GB = 128;

// ElastiCache related
export const ELASTICACHE_STACK_NAME = "ElastiCacheStack";
export const CLUSTER_NAME = 'KnowledgeSession';
