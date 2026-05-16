import { Context } from "../modules/type"
import { createSession } from "better-sse"

export default function (context: Context) {



    const app = context.app
    const pool = context.pool


    app.get("/sse", async (req: any, reply: any) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })
        const sessions = await pool.query(
            "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()",
            [sessionId]
        )
        if (sessions.length === 0) return reply.status(401).send({ message: "Sessione scaduta" })

        const userId = String(sessions[0].user_id)

        const session = await createSession(req.raw, reply.raw)

        context.sessions.set(userId, session)

        console.log(`SSE connesso: utente ${userId}`)


        req.raw.on("close", () => {
            context.sessions.delete(userId)
            console.log(`SSE disconnesso: utente ${userId}`)
        })
    })
}