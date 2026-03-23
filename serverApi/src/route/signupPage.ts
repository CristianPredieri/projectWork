import { Context } from "../modules/type"
import * as mariadb from "mariadb"


export default function (context: Context) {
    const app = context.app
    app.get("/signupPage", async (req, reply) => {
        reply.redirect("../signupPage.html")

})
}