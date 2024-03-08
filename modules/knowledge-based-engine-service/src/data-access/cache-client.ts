import { createClient } from "redis";

console.log(`process.env.CACHE_URL: ${process.env.CACHE_URL}`);
const cacheClient = createClient({
    url: process.env.CACHE_URL,
});
export { cacheClient };