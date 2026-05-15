import { Context } from "../modules/type"

export default function (context: Context) {
    const app = context.app

    app.get("/check-session", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.send({ valid: false })

        const sessions = await context.pool.query(
            "SELECT * FROM sessions WHERE id = ?", [sessionId]
        )
        return reply.send({ valid: sessions.length > 0 })
    })
}