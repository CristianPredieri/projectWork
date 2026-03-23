import { Context } from "../modules/type"
import * as mariadb from "mariadb"


export default function (context: Context) {
    const app = context.app
    app.post("/login", async (req, reply) => {

        const body = req.body as { email: string; password: string }
        let userEmail = body.email
        let userPassword = body.password


        app.get("/users", async (req, reply) => {
            

        })
})
}