import { Context } from "../modules/type"
import { executeQuery } from "../modules/function"
import crypto from "crypto"
import bcrypt from "bcrypt"  // ← AGGIUNTO


export default function (context: Context) {
    const app = context.app
    const pool = context.pool

    app.post("/login", async (req, reply) => {

        const body = req.body as { userTag: string; password: string }

        const exist = await executeQuery(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [body.userTag, body.userTag],
            pool
        )

        if (exist.length === 0) {
            return reply.send({ success: false, message: "Utente non trovato" })
        }


        const passwordCorretta = await bcrypt.compare(body.password, exist[0].password)

        if (!passwordCorretta) {
            return reply.send({ success: false, message: "Password errata" })
        }

        const sessionId = crypto.randomBytes(32).toString("hex")
        const date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5)

        reply.cookie("sessionId", sessionId, {
            httpOnly: true,

            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 5
        })
        await executeQuery(
            "DELETE FROM sessions WHERE user_id = ?",
            [exist[0].idUtente],
            pool
        )
        await executeQuery(
            "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
            [sessionId, exist[0].idUtente, date],
            pool
        )
     
        return reply.send({ redirect: "/homePage.html" })
    })
}