import { Context } from "../modules/type"
import { executeQuery } from "../modules/function"
import bcrypt from "bcrypt"

// Route per la registrazione: convalida i dati e crea un nuovo utente
export default function (context: Context) {
    const app = context.app
    const pool = context.pool

    // POST /signup - Registra un nuovo utente
    app.post("/signup", async (req, reply) => {
        const body = req.body as {
            nome: string
            cognome: string
            email: string
            username: string
            password: string
            controlloPassword: string
        }

        // Regole di validazione per i campi
        const rules: { field: string, regex: RegExp, msg: string }[] = [
            { field: "nome", regex: /^[a-zA-ZÀ-ù\s]{2,30}$/, msg: "Nome non valido" },
            { field: "cognome", regex: /^[a-zA-ZÀ-ù\s]{2,30}$/, msg: "Cognome non valido" },
            { field: "email", regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: "Email non valida" },
            { field: "username", regex: /^[a-zA-Z0-9._]{3,20}$/, msg: "Username not valid" },
            { field: "password", regex: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/, msg: "Password non valida" }
        ]

        // Valida i campi secondo le regex
        for (const rule of rules) {
            if (!rule.regex.test((body as any)[rule.field])) {
                return reply.send({ success: false, message: rule.msg })
            }
        }

        // Controlla che le due password coincidano
        if (body.password !== body.controlloPassword) {
            return reply.send({ success: false, message: "Le password non coincidono" })
        }

        // Controlla che email e username non siano già registrati
        const exist = await executeQuery(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [body.email, body.username],
            pool
        )
        if (exist.length > 0) {
            const msg = exist[0].email === body.email ? "Email già registrata" : "Username già registrato"
            return reply.send({ success: false, message: msg })
        }

        // Hash della password con bcrypt
        const hashedPassword = await bcrypt.hash(body.password, 10)

        // Inserisce il nuovo utente nel database
        await executeQuery(
            "INSERT INTO users (nome, cognome, email, username, password) VALUES (?, ?, ?, ?, ?)",
            [body.nome, body.cognome, body.email, body.username, hashedPassword],
            pool
        )
        console.log("Registered a new user successfully")
        return reply.send({ success: true, redirect: "/loginPage.html" })
    })
}