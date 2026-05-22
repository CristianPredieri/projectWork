import { Context } from "../modules/type"
import { createSession } from "better-sse"

// Route per Server-Sent Events: connessione WebSocket per messaggi in tempo reale
export default function (context: Context) {
  const app = context.app
  const pool = context.pool

  // GET /sse - Stabilisce una connessione SSE per ricevere messaggi in tempo reale
  app.get("/sse", async (req: any, reply: any) => {
    const sessionId = req.cookies?.sessionId
    if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })

    // Verifica che la sessione sia valida e non scaduta
    const sessions = await pool.query(
      "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()",
      [sessionId]
    )
    if (sessions.length === 0) return reply.status(401).send({ message: "Sessione scaduta" })

    const userId = String(sessions[0].user_id)
    // "Hijack" la risposta HTTP per mantenere la connessione aperta
    reply.hijack()
    const session = await createSession(req.raw, reply.raw)

    // Registra la sessione SSE nel contesto dell'app
    context.sessions.set(userId, session)
    console.log(`SSE connesso: utente ${userId}`)

   

    // ← AGGIUNGI QUI
    // Aggiorna a "consegnato" tutti i messaggi inviati a questo utente che erano ancora "inviato"
    const msgDaConsegnare = await pool.query(`
    SELECT DISTINCT sender_id, chat_id FROM msg 
    JOIN partecipanti_chat p ON p.chat_id = msg.chat_id AND p.user_id = ?
    WHERE msg.sender_id != ? AND msg.statusMsg = 'inviato'
`, [userId, userId])

    await pool.query(`
    UPDATE msg 
    JOIN partecipanti_chat p ON p.chat_id = msg.chat_id AND p.user_id = ?
    SET msg.statusMsg = 'consegnato'
    WHERE msg.sender_id != ? AND msg.statusMsg = 'inviato'
`, [userId, userId])

    // Notifica ogni mittente via SSE
    for (const m of msgDaConsegnare) {
      const sseMittente = context.sessions.get(String(m.sender_id))
      if (sseMittente) {
        try {
          await sseMittente.push(
            { chatId: Number(m.chat_id) },
            "messaggio-consegnato"
          )
        } catch (e) {
          context.sessions.delete(String(m.sender_id))
        }
      }
    }

    // Quando il client si disconnette, rimuovi la sessione
    req.raw.on("close", () => {
      context.sessions.delete(userId)
      console.log(`SSE disconnesso: utente ${userId}`)
    })
  })
}