import { config } from "dotenv"
import { join } from "path"
config({ path: join(__dirname, ".env") })

// Converti BigInt a Number per JSON (necessario per alcune operazioni DB)
; (BigInt.prototype as any).toJSON = function () { return Number(this) }

import fastify from "fastify"
import fastifyStatic from "@fastify/static"
import fastifyCookie from "@fastify/cookie"
import * as mariadb from "mariadb"
import { Context } from "./modules/type"

// Import delle route
import signup from "./route/signup"
import standartRoute from "./route/standartRoute"
import login from "./route/login"
import checkSession from "./route/check-session"
import { executeQuery } from "./modules/function"
import sse from "./route/sse"
import users from "./route/users"
import contatti from "./route/contatti"
import logout from "./route/logout"
import chat from "./route/chat"
import whoami from "./route/whoami"
import chats from "./route/chats"


// Funzione principale: configura il server Fastify
const main = async () => {
    // Istanzia il server Fastify
    const app = fastify()

    // Crea il contesto applicativo con pool DB e store sessioni SSE
    const context: Context = {
        app,
        pool: await mariadb.createPool({
            port: 3306,
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'projectwork'
        }),
        sessions: new Map()
    }

    // Registra il middleware per servire file statici dalla cartella public
    app.register(fastifyStatic, {
        root: join(__dirname, "../public")
    })

    // Registra il middleware per gestire i cookies
    await app.register(fastifyCookie)

    // Hook di preHandler: controlla l'autenticazione prima di ogni richiesta
    app.addHook("preHandler", async (req, reply) => {
        const path = req.url.split("?")[0]

        if (path.match(/\.(css|js|png|jpg|jpeg|svg|ico|json|webmanifest|html)$/)) return

        const sessionId = req.cookies?.sessionId

        if (["/login", "/signup", "/check-session"].includes(path)) return

        if (path === "/") {
            if (!sessionId) return

            const sessions = await executeQuery(
                "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()",
                [sessionId],
                context.pool
            )

            if (sessions.length > 0) return reply.redirect("/homePage.html")
            return
        }

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: "Non autorizzato" })
        }

        const sessions = await executeQuery(
            "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()",
            [sessionId],
            context.pool
        )

        if (sessions.length === 0) {
            return reply.status(401).send({ success: false, message: "Sessione scaduta" })
        }
    })

    // Registra tutte le route dell'app
    await checkSession(context)
    await standartRoute(context)
    await login(context)
    await signup(context)
    await sse(context)
    await users(context)
    await contatti(context)
    await logout(context)
    await chat(context)
    await whoami(context)
    await chats(context)

    // Handler globale degli errori
    app.setErrorHandler(async (err, request, reply) => {
        console.log("Error occurred:", err)
        return reply.status(500).send({
            error: "Internal Server Error"
        })
    })

    // Avvia il server sulla porta 3000
    app.listen({
        port: 3000,
        host: "0.0.0.0"
    }).then(() => {
        console.log("Server is running on http://localhost:3000")
    })
}

// Esegui la funzione principale
main()