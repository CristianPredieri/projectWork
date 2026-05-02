import { Session } from "better-sse";
export type Context = {
    app: import("fastify").FastifyInstance;  
    pool: import("mariadb").Pool;
    sessions : Map<string, Session>;
}