import { Context } from "../modules/type"

// Route per ottenere i dati dell'utente autenticato corrente
export default function (context: Context) {
    const app = context.app
    const pool = context.pool

    // GET /whoami - Restituisce le informazioni dell'utente loggato
    app.get("/whoami", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })

        // Verifica che la sessione sia valida e non scaduta
        const sessions = await pool.query(
            "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()", [sessionId]
        )
        if (sessions.length === 0) return reply.status(401).send({ message: "Sessione scaduta" })

        // Recupera i dati dell'utente
        const users = await pool.query(
            "SELECT idUtente, nome, cognome, username, status FROM users WHERE idUtente = ?",
            [sessions[0].user_id]
        )
        if (users.length === 0) return reply.status(404).send({ message: "Utente non trovato" })

        return reply.send(users[0])
    })
}