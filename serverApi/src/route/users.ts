import { Context } from "../modules/type"
import { executeQuery } from "../modules/function"

// Route per cercare utenti per username
export default function (context: Context) {
    const app = context.app
    const pool = context.pool
    app.get("/users/search", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        const session = await executeQuery("select * from sessions where id =? and expires_at>NOW()", [sessionId], pool)
        if (session.length === 0) return reply.status(401).send({ message: "not authorized" })
        const myId = session[0].user_id

        const { username } = req.query as { username: string }
        // Valida che lo username sia abbastanza lungo
        if (!username || username.trim().length < 2) return reply.send({ success: false, message: "username troppo corto", users: [] })

        // Cerca utenti per username (escludendo se stessi)
        const users = await executeQuery(`
      SELECT idUtente, nome, cognome, username, status
      FROM users
      WHERE username LIKE ? AND idUtente != ?
      LIMIT 10
    `, [`%${username}%`, myId], pool)

        return reply.send({ success: true, users })
    })
}