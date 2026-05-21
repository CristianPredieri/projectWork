import { Session } from "better-sse"

// Tipo per il contesto applicativo che viene passato a tutte le route
// Contiene: istanza app, pool di connessioni DB, e mappe delle sessioni SSE attive
export type Context = {
  app: import("fastify").FastifyInstance
  pool: import("mariadb").Pool
  sessions: Map<string, Session>
}