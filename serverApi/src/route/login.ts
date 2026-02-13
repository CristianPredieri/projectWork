import { Context } from "../type"

export default function (context: Context) {
    const app = context.app
    app.post("/login", async (req, reply) => {

        const body = req.body as { email: string; password: string }
        let userEmail = body.email
        let userPassword = body.password


        app.get("/users", async (req, reply) => {
            try {
                const result = await pool.query("SELECT * FROM users"); // query sul DB esistente
                reply.send(result.rows);
            } catch (err) {
                console.error(err);
                reply.status(500).send({ error: "Database error" });
            }
        });

    })
}