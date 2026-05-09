import fastify from "fastify"
import fastifyStatic from "@fastify/static"
import fastifyCookie from "@fastify/cookie"
import * as mariadb from "mariadb"
import { join } from "path"
import { Context } from "./modules/type"
import { createSession } from "better-sse";

import standartRoute from "./route/standartRoute"
import login from "./route/login"
import loginPage from "./route/loginPage"
import signupPage from "./route/signupPage"



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


    await app.register(fastifyCookie)
    await standartRoute(context)
    await login(context)
    await loginPage(context)
    await signupPage(context)

    app.addHook("preHandler", async (req, reply) => {
        const sessionId = req.cookies.sessionId;
        
        
        if (req.url === "/loginPage" || req.url === "/signupPage") {
            return
        }

        if (req.url === "/homePage.html") {
            if (!sessionId) {
                return reply.redirect("../index.html");
            }
        }
        const sessions = await context.pool.query(
            "SELECT * FROM sessions WHERE id = ?",
            [sessionId]
        );

        if (sessions.length === 0) {
            return reply.redirect("../login.html");
        }
        return reply.redirect("../homePage.html")


    });

    app.setErrorHandler(async (err, request, reply) => {
        console.log("Error occurred:", err)

        return reply.status(500).send({
            error: "Internal Server Error",
        })
    })

    app.register(fastifyStatic, {
        root: join(__dirname, "../public"),
    })
    app.listen({
        port: 3000,
        host: "0.0.0.0"
    }).then(() => {
        console.log("Server is running on http://localhost:3000")
    })
}

main()