import { Context } from "../modules/type"
import * as mariadb from "mariadb"
import { executeQuery } from "../modules/function"
import cookie from "@fastify/cookie"
import crypto from "crypto"


export default function (context: Context) {
    const app = context.app
    const pool = context.pool

    app.post("/login", async (req, reply) => {

        const body = req.body as { userTag: string; password: string }
        let user = body.userTag
        let userPassword = body.password


        const exist = await executeQuery("select * from users where email = ? or username = ?", [body.userTag, body.userTag], pool)
        if (exist.length == 0) {
            reply.send({ success: false, message: "User not found" })
        } else {
            if (userPassword == exist[0].password) {
                console.log("Login successful for user: " + user)
                const sessionId = crypto.randomBytes(32).toString("hex");
                const date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) // 5 giorni 
                reply.cookie("sessionId", sessionId, {
                    httpOnly: true,
                    sameSite: "strict",
                    maxAge: 1000 * 60 * 60 * 24 * 5
                })

                await pool.query(
                    'INSERT INTO sessions (id, user_id, expires_at)  VALUES (?, ?, ?)',
                    [
                        sessionId,
                        exist[0].idUtente,
                        date
                    ]
                )
                return reply.send({ redirect: "/homePage.html" })
            } else {
                console.log("Login failed for user: " + user)
                reply.send({ success: false, message: "Incorrect password" })
            }
        }



    })
}