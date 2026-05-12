import fastify from "fastify"
import fastifyStatic from "@fastify/static"
import fastifyCookie from "@fastify/cookie"
import * as mariadb from "mariadb"
import { join } from "path"
import { Context } from "./modules/type"
import { createSession } from "better-sse";
import signup from "./route/signup"
import standartRoute from "./route/standartRoute"
import login from "./route/login"



const main = async () => {
    const app = fastify()

    const context: Context = {
        app: app,
        pool: await mariadb.createPool({
            port: 3500,
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'projectwork'
        })
    }

    app.register(fastifyStatic, {
        root: join(__dirname, "../public"),
    })
    await app.register(fastifyCookie)

    app.addHook("preHandler", async (req, reply) => {
        // 1. Sempre liberi — file statici
        if (req.url.match(/\.(css|js|png|jpg|jpeg|svg|ico|json|webmanifest)$/)) return

        const sessionId = req.cookies?.sessionId;

        // 2. Route pubbliche — se hai sessione valida, vai a home
        if (["/", "/index.html", "/loginPage.html", "/signupPage.html", "/login", "/signup"].includes(req.url)) {
            if (!sessionId) return; // nessuna sessione → lascia passare normalmente

            const sessions = await context.pool.query(
                "SELECT * FROM sessions WHERE id = ?", [sessionId]
            )
            if (sessions.length > 0) return reply.redirect("/homePage.html"); // sessione valida → home
            return; // sessione non valida → lascia passare
        }

        // 3. Route protette — serve sessione valida
        if (!sessionId) return reply.redirect("/index.html");

        const sessions = await context.pool.query(
            "SELECT * FROM sessions WHERE id = ?", [sessionId]
        )
        if (sessions.length === 0) return reply.redirect("/index.html");

        return; // sessione valida → lascia passare
    });

    await standartRoute(context)
    await login(context)
    await signup(context)


    app.setErrorHandler(async (err, request, reply) => {
        console.log("Error occurred:", err)

        return reply.status(500).send({
            error: "Internal Server Error",
        })
    })


    app.listen({
        port: 3000,
        host: "0.0.0.0"
    }).then(() => {
        console.log("Server is running on http://localhost:3000")
    })
}

main()