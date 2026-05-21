import { Context } from "../modules/type"

// Route per verificare se una sessione è ancora valida
export default function (context: Context) {
    const app = context.app

    // GET /check-session - Controlla la validità della sessione corrente
    app.get("/check-session", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        // Se non c'è sessionId, la sessione è invalida
        if (!sessionId) return reply.send({ valid: false })

        // Cerca la sessione nel database
        const sessions = await context.pool.query(
            "SELECT * FROM sessions WHERE id = ?", [sessionId]
        )

        // Sessione non trovata nel database
        if (sessions.length === 0) return reply.send({ valid: false })

        // Verifica se la sessione è scaduta
        if (new Date(sessions[0].expires_at) < new Date()) {
            // Sessione scaduta - eliminala dal database
            await context.pool.query("DELETE FROM sessions WHERE id = ?", [sessionId])
            return reply.send({ valid: false })
        }

        // Sessione valida e non scaduta
        return reply.send({ valid: true })
    })
}