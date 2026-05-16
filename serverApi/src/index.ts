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
import { encryptMessage } from "./modules/crypto"
import { decryptMessage } from "./modules/crypto"
import checkSession from "./route/check-session"
import { executeQuery } from "./modules/function"
import sse from "./route/sse"


const main = async () => {
    const app = fastify()

    const context: Context = {
        app: app,
        pool: await mariadb.createPool({
            port: 3306,
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'projectwork'
        }),
         sessions: new Map()
    }

    app.register(fastifyStatic, {
        root: join(__dirname, "../public"),
    })
    await app.register(fastifyCookie)

    app.addHook("preHandler", async (req, reply) => {
        // file statici → sempre liberi
        if (req.url.match(/\.(css|js|png|jpg|jpeg|svg|ico|json|webmanifest|html)$/)) return

        const sessionId = req.cookies?.sessionId;

        // route pubbliche API
        if (["/", "/login", "/signup", "/check-session"].includes(req.url)) {
            if (!sessionId) return;
            const sessions = await executeQuery(
                "SELECT * FROM sessions WHERE id = ?", [sessionId], context.pool
            )
            if (sessions.length > 0) return reply.redirect("/homePage.html");
            return;
        }

        // route protette API
        if (!sessionId) return reply.redirect("/index.html");
        const sessions = await executeQuery(
            "SELECT * FROM sessions WHERE id = ?", [sessionId], context.pool
        )
        if (sessions.length === 0) return reply.redirect("/index.html");
    })
    await checkSession(context)
    await standartRoute(context)
    await login(context)
    await signup(context)
    await sse(context)


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