import fastify from "fastify"
import fastifyStatic from "@fastify/static"
import fastifyCookie from "@fastify/cookie"
import { join } from "path"
import { Context } from "./modules/type"
import standartRoute from "./route/standartRoute"
import login from "./route/login"
import loginPage from "./route/loginPage"
import signupPage from "./route/signupPage"


const main = async () => {
    const app = fastify()

    const context: Context = {
        app: app
    }

    await app.register(fastifyCookie)
    await standartRoute(context)
    await login(context)
    await loginPage(context)
    await signupPage(context)
    
    app.addHook("preHandler", async (req, reply) => {
        //console.log(req.cookies)
    })
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