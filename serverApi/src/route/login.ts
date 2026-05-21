import { Context } from "../modules/type"
import { executeQuery } from "../modules/function"
import crypto from "crypto"
import bcrypt from "bcrypt"

// Route per il login: valida le credenziali e crea una sessione
export default function (context: Context) {
    const app = context.app
    const pool = context.pool

    // POST /login - Autentica un utente
    app.post("/login", async (req, reply) => {
        const body = req.body as { userTag: string, password: string }

        // Cerca l'utente per email o username
        const exist = await executeQuery(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [body.userTag, body.userTag],
            pool
        )

        if (exist.length === 0) {
            return reply.send({ success: false, message: "Utente non trovato" })
        }

        // Confronta la password fornita con quella hashata nel DB
        const passwordCorretta = await bcrypt.compare(body.password, exist[0].password)

        if (!passwordCorretta) {
            return reply.send({ success: false, message: "Password errata" })
        }

        // Crea una sessione valida per 5 giorni
        const sessionId = crypto.randomBytes(32).toString("hex")
        const date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5)

        // Imposta il cookie di sessione
        reply.cookie("sessionId", sessionId, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 5
        })

        // Cancella le sessioni precedenti dell'utente
        await executeQuery(
            "DELETE FROM sessions WHERE user_id = ?",
            [exist[0].idUtente],
            pool
        )

        // Salva la nuova sessione nel database
        await executeQuery(
            "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
            [sessionId, exist[0].idUtente, date],
            pool
        )

        return reply.send({ redirect: "/homePage.html" })
    })
}