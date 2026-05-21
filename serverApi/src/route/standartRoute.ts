import { Context } from "../modules/type"

// Route principale: redirige alle pagine di login e signup
export default function (context: Context) {
    const app = context.app

    // GET / - Redirige alla pagina di login
    app.get("/", async (request: any, reply: any) => {
        reply.redirect("../index.html")
    })

    // POST / - Redirige alla pagina di login
    app.post("/", async (request: any, reply: any) => {
        reply.redirect("../index.html")
    })
}