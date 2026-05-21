import { Context } from "../modules/type"
import { executeQuery } from "../modules/function"
import { decryptMessage } from "../modules/crypto"

// Route per recuperare tutte le chat dell'utente con l'ultimo messaggio
export default function (context: Context) {
  const app = context.app
  const pool = context.pool

  // GET /chats - Recupera la lista di tutte le chat dell'utente con l'ultimo messaggio
  app.get("/chats", async (req, reply) => {
    const sessionId = req.cookies?.sessionId
    if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })

    // Verifica che la sessione sia valida e non scaduta
    const sessions = await pool.query(
      "SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()", [sessionId]
    )
    if (sessions.length === 0) return reply.status(401).send({ message: "Non autorizzato" })
    const myId = sessions[0].user_id

    // Recupera le chat con i dettagli dell'ultimo messaggio
    const chats = await executeQuery(`
  SELECT 
    c.idChat,
    c.is_group,
    c.nomeChat,
    u.nome,
    u.cognome,
    u.username,
    m.content AS lastMessage,
    m.sent_at AS lastSentAt,
    (
      SELECT COUNT(*) FROM msg 
      WHERE chat_id = c.idChat 
      AND sender_id != ? 
      AND statusMsg != 'letto'
    ) AS unreadCount
  FROM chat c
  JOIN partecipanti_chat p ON p.chat_id = c.idChat AND p.user_id = ?
  LEFT JOIN partecipanti_chat p2 ON p2.chat_id = c.idChat AND p2.user_id != ? AND c.is_group = 0
  LEFT JOIN users u ON u.idUtente = p2.user_id AND c.is_group = 0
  LEFT JOIN msg m ON m.idMsg = (
    SELECT idMsg FROM msg 
    WHERE chat_id = c.idChat 
    ORDER BY sent_at DESC LIMIT 1
  )
  ORDER BY m.sent_at DESC
`, [myId, myId, myId], pool)
    // Decifra i messaggi prima di inviarli al client
    const result = chats.map((c: any) => ({
      ...c,
      lastMessage: c.lastMessage ? decryptMessage(c.lastMessage) : null
    }))

    return reply.send({ success: true, chats: result })
  })
}