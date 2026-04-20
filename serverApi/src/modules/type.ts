
export type Context = {
    app: import("fastify").FastifyInstance;  
    pool: import("mariadb").Pool;
}