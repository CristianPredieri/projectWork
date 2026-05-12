import { Context } from "../modules/type"
import { executeQuery } from "../modules/function"



export default function (context: Context) {
    const app = context.app
    const pool = context.pool

    app.post("/signup", async (req, reply) => {

        const body = req.body as { nome : string, cognome : string,  email: string, username:string, password: string, confirmPassword : string }


    const rules: { field: string, regex: RegExp, msg: string }[] = [
        { field: "nome",     regex: /^[a-zA-ZÀ-ù\s]{2,30}$/,          msg: "Nome non valido" },
        { field: "cognome",  regex: /^[a-zA-ZÀ-ù\s]{2,30}$/,          msg: "Cognome non valido" },
        { field: "email",    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,      msg: "Email non valida" },
        { field: "username", regex: /^[a-zA-Z0-9._]{3,20}$/, msg : "Username not valid"},
        { field: "password", regex: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/, msg: "Password non valida" }
    ]

    for (const rule of rules) {
        if (!rule.regex.test((body as any)[rule.field])) {
            return reply.send({ success: false, message: rule.msg })
    }
    }

    if (body.password !== body.confirmPassword) {
        return reply.send({ success: false, message: "Le password non coincidono" })
    }

        const exist = await executeQuery(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [body.email, body.username], 
            pool
        )
        if (exist.length > 0) {
            const msg = exist[0].email === body.email ? "Email già registrata" : "Username già registrato"
            return reply.send({ success: false, message: msg })
        }
        
    await executeQuery("INSERT INTO users (nome, cognome, email, username, password) VALUES (?, ?, ?, ?, ?)",
        [body.nome, body.cognome, body.email, body.username, body.password],
        pool
    )
       return reply.send({success : true, redirect : "/loginPage.html"})

    })
}