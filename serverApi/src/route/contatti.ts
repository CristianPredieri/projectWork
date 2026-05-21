import { Context } from "../modules/type"
import { executeQuery } from "../modules/function"

// Route per gestire i contatti: visualizza, aggiungi e rimuovi contatti
export default function (context: Context) {
  const app = context.app
  const pool = context.pool

  // GET /contatti - Recupera la lista di contatti dell'utente
  app.get("/contatti", async (req, reply) => {
    const sessionId = req.cookies?.sessionId
    // Verifica che la sessione sia valida
    const sessions = await pool.query(
      "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()", [sessionId]
    )
    if (sessions.length === 0) return reply.status(401).send({ message: "Non autorizzato" })
    const myId = sessions[0].user_id

// Recupera i contatti dell'utente con i dettagli
    const contatti = await executeQuery(`
      SELECT u.idUtente, u.nome, u.cognome, u.username, u.status, c.added_at
      FROM contatti c
      JOIN users u ON u.idUtente = c.contact_id
      WHERE c.user_id = ?
      ORDER BY u.nome ASC
    `, [myId], pool)

    return reply.send({ success: true, contatti })
  })

  // POST /contatti - Aggiungi un nuovo contatto
  app.post("/contatti", async (req, reply) => {
    const sessionId = req.cookies?.sessionId
    // Verifica che la sessione sia valida
    const sessions = await pool.query(
      "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()", [sessionId]
    )
    if (sessions.length === 0) return reply.status(401).send({ message: "Non autorizzato" })
    const myId = sessions[0].user_id

    const body = req.body as { username: string }

    // Cerca l'utente per username
    const users = await executeQuery(
      "SELECT idUtente FROM users WHERE username = ?",
      [body.username], pool
    )
    if (users.length === 0) return reply.send({ success: false, message: "Utente non trovato" })

    const contactId = users[0].idUtente

    // Non puoi aggiungere te stesso come contatto
    if (contactId === myId) return reply.send({ success: false, message: "Non puoi aggiungere te stesso" })

    // Controlla se è già un contatto
    const existing = await executeQuery(
      "SELECT * FROM contatti WHERE user_id = ? AND contact_id = ?",
      [myId, contactId], pool
    )
    if (existing.length > 0) return reply.send({ success: false, message: "Contatto già presente" })

    // Inserisce il nuovo contatto
    await executeQuery(
      "INSERT INTO contatti (user_id, contact_id) VALUES (?, ?)",
      [myId, contactId], pool
    )

    return reply.send({ success: true, message: "Contatto aggiunto" })
  })

  // DELETE /contatti/:contactId - Rimuovi un contatto
  app.delete("/contatti/:contactId", async (req, reply) => {
    const sessionId = req.cookies?.sessionId
    // Verifica che la sessione sia valida
    const sessions = await pool.query(
      "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()", [sessionId]
    )
    if (sessions.length === 0) return reply.status(401).send({ message: "Non autorizzato" })
    const myId = sessions[0].user_id

    const { contactId } = req.params as { contactId: string }

    // Elimina il contatto dal database
    await executeQuery(
      "DELETE FROM contatti WHERE user_id = ? AND contact_id = ?",
      [myId, contactId], pool
    )

    return reply.send({ success: true, message: "Contatto rimosso" })
  })
}