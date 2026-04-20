import { Context } from "../modules/type"
import * as mariadb from "mariadb"
import { executeQuery } from "../modules/function"

export default function (context: Context) {
    const app = context.app
    const pool = context.pool
    app.post("/login", async (req, reply) => {

        const body = req.body as { userTag: string; password: string }
        let user = body.userTag
        let userPassword = body.password

        const exist = await executeQuery("select * from users where email = '" + user + "' or username = '" + user + "'", pool)
        if (exist.length == 0) {
            reply.send({ success: false, message: "User not found" })
        } else {
            if (userPassword == exist[0].password) {
                console.log("Login successful for user: " + user)
                reply.send({ redirect: "../homePage.html" })
            } else {
                console.log("Login failed for user: " + user)
                reply.send({ success: false, message: "Incorrect password" })
            }
        }


    })
}