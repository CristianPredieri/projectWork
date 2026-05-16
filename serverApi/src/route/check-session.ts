import { Context } from "../modules/type"

export default function (context: Context) {
    const app = context.app

    app.get("/check-session", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.send({ valid: false })

        const sessions = await context.pool.query(
            "SELECT * FROM sessions WHERE id = ?", [sessionId]
        )

        // sessione non trovata
        if (sessions.length === 0) return reply.send({ valid: false })

        // sessione scaduta
        if (new Date(sessions[0].expires_at) < new Date()) {
            await context.pool.query("DELETE FROM sessions WHERE id = ?", [sessionId])
            return reply.send({ valid: false })
        }

        return reply.send({ valid: true })
    })
}