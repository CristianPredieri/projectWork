import { Context } from "../modules/type"

// Route per il logout: cancella la sessione e redirige al login
export default function (context: Context) {
    const app = context.app
    const pool = context.pool

    // POST /logout - Effettua il logout dell'utente
    app.post("/logout", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        // Se esiste una sessione, cancellala dal database
        if (sessionId) {
            await pool.query("DELETE FROM sessions WHERE id = ?", [sessionId])
        }
        // Cancella il cookie di sessione e redirige al login
        reply.clearCookie("sessionId")
        return reply.send({ redirect: "/index.html" })
    })
}