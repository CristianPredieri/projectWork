import { Context } from "../modules/type"
import { executeQuery } from "../modules/function"
import { encryptMessage, decryptMessage } from "../modules/crypto"

export default function (context: Context) {
    const app = context.app
    const pool = context.pool


    async function getUserId(sessionId: string): Promise<number | null> {
        const sessions = await pool.query(
            "SELECT user_id FROM sessions WHERE id = ? AND expires_at > NOW()",
            [sessionId]
        )
        return sessions.length > 0 ? sessions[0].user_id : null
    }


    // POST /chat
    // Crea una chat privata (1 partecipante) o di gruppo (2+)
    // Body: { partecipanti: string[], nomeGruppo?: string }

    app.post("/chat", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })
        const myId = await getUserId(sessionId)
        if (!myId) return reply.status(401).send({ message: "Non autorizzato" })

        const body = req.body as { partecipanti: string[], nomeGruppo?: string }

        if (!body.partecipanti || body.partecipanti.length === 0) {
            return reply.send({ success: false, message: "Nessun partecipante selezionato" })
        }

        // trova gli id dagli username
        const ids: number[] = []
        for (const username of body.partecipanti) {
            const user = await executeQuery(
                "SELECT idUtente FROM users WHERE username = ? ",
                [username], pool
            )
            if (user.length === 0) {
                return reply.send({ success: false, message: `Utente @${username} non trovato` })
            }
            ids.push(user[0].idUtente)
        }

        const isGroup = ids.length > 1

        // CHAT PRIVATA 
        if (!isGroup) {
            const receiverId = ids[0]

            // controlla se esiste già una chat privata tra i due
            const existing = await executeQuery(`
                SELECT c.idChat FROM chat c
                JOIN partecipanti_chat p1 ON p1.chat_id = c.idChat AND p1.user_id = ?
                JOIN partecipanti_chat p2 ON p2.chat_id = c.idChat AND p2.user_id = ?
                WHERE c.is_group = 0
            `, [myId, receiverId], pool)

            if (existing.length > 0) {
                // chat già esistente → restituisci quella
                return reply.send({ success: true, chatId: existing[0].idChat, isGroup: false })
            }

            // crea nuova chat privata
            const result = await executeQuery(
                "INSERT INTO chat (is_group, created_by) VALUES (0, ?)",
                [myId], pool
            )
            const chatId = result.insertId

            // aggiungi entrambi come membri
            await executeQuery(
                "INSERT INTO partecipanti_chat (chat_id, user_id, ruolo) VALUES (?, ?, 'membro'), (?, ?, 'membro')",
                [chatId, myId, chatId, receiverId], pool
            )

            return reply.send({ success: true, chatId, isGroup: false })
        }

        // CHAT DI GRUPPO 
        const nomeGruppo = body.nomeGruppo?.trim() || "Gruppo"

        const result = await executeQuery(
            "INSERT INTO chat (is_group, nomeChat, created_by) VALUES (1, ?, ?)",
            [nomeGruppo, myId], pool
        )
        const chatId = result.insertId

        // aggiungi me come amministratore
        await executeQuery(
            "INSERT INTO partecipanti_chat (chat_id, user_id, ruolo) VALUES (?, ?, 'amministratore')",
            [chatId, myId], pool
        )

        // aggiungi tutti gli altri come membri
        for (const userId of ids) {
            await executeQuery(
                "INSERT INTO partecipanti_chat (chat_id, user_id, ruolo) VALUES (?, ?, 'membro')",
                [chatId, userId], pool
            )
        }

        return reply.send({ success: true, chatId, isGroup: true })
    })


    // POST /chat/:chatId/msg
    // Invia un messaggio in una chat
    // Body: { content: string }

    app.post("/chat/:chatId/msg", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })
        const myId = await getUserId(sessionId)
        if (!myId) return reply.status(401).send({ message: "Non autorizzato" })

        const { chatId } = req.params as { chatId: string }
        const body = req.body as { content: string }

        if (!body.content?.trim()) {
            return reply.send({ success: false, message: "Messaggio vuoto" })
        }

        // controlla che l'utente faccia parte della chat
        const partecipa = await executeQuery(
            "SELECT * FROM partecipanti_chat WHERE chat_id = ? AND user_id = ?",
            [chatId, myId], pool
        )
        if (partecipa.length === 0) {
            return reply.status(403).send({ success: false, message: "Non sei partecipante di questa chat" })
        }

        // cifra e salva il messaggio
        const contenutoCifrato = encryptMessage(body.content.trim())
        const result = await executeQuery(
            "INSERT INTO msg (chat_id, sender_id, content, message_type, statusMsg) VALUES (?, ?, ?, 'text', 'inviato')",
            [chatId, myId, contenutoCifrato], pool
        )

        // prendi username mittente per SSE
        const sender = await executeQuery(
            "SELECT username FROM users WHERE idUtente = ?",
            [myId], pool
        )
        const username = sender[0]?.username

        // notifica via SSE tutti i partecipanti della chat tranne me
        const partecipanti = await executeQuery(
            "SELECT user_id FROM partecipanti_chat WHERE chat_id = ? AND user_id != ?",
            [chatId, myId], pool
        )

        for (const p of partecipanti) {
            const sseSession = context.sessions.get(String(p.user_id))
            if (sseSession) {
                try {
                    await sseSession.push(
                        {
                            chatId: Number(chatId),
                            senderId: myId,
                            username,
                            content: body.content.trim()  // mando in chiaro via SSE (già su HTTPS)
                        },
                        "nuovo-messaggio"
                    )
                } catch (e) {
                    context.sessions.delete(String(p.user_id))
                }

            }
        }

        // aggiorna stato msg a consegnato se il destinatario è connesso (solo chat private)
        const chatInfo = await executeQuery(
            "SELECT is_group FROM chat WHERE idChat = ?",
            [chatId], pool
        )
        if (!chatInfo[0].is_group) {
            const destinatario = partecipanti[0]
            if (destinatario && context.sessions.has(String(destinatario.user_id))) {
                await executeQuery(
                    "UPDATE msg SET statusMsg = 'consegnato' WHERE idMsg = ?",
                    [result.insertId], pool
                )
                const sseMittente = context.sessions.get(String(myId))
                if (sseMittente) {
                    try {
                        await sseMittente.push(
                            { chatId: Number(chatId), msgId: Number(result.insertId) },
                            "messaggio-consegnato"
                        )
                    } catch (e) {
                        context.sessions.delete(String(myId))
                    }
                }
            }
        }

        return reply.send({ success: true, msgId: result.insertId })
    })

    // GET /chat/:chatId/msg
    // Recupera i messaggi di una chat (con decifratura)

    app.get("/chat/:chatId/msg", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })
        const myId = await getUserId(sessionId)
        if (!myId) return reply.status(401).send({ message: "Non autorizzato" })

        const { chatId } = req.params as { chatId: string }

        // controlla che l'utente faccia parte della chat
        const partecipa = await executeQuery(
            "SELECT * FROM partecipanti_chat WHERE chat_id = ? AND user_id = ?",
            [chatId, myId], pool
        )
        if (partecipa.length === 0) {
            return reply.status(403).send({ success: false, message: "Non sei partecipante di questa chat" })
        }

        // recupera messaggi
        const messaggi = await executeQuery(`
            SELECT 
                m.idMsg,
                m.sender_id,
                m.content,
                m.message_type,
                m.statusMsg,
                m.sent_at,
                u.username,
                u.nome
            FROM msg m
            JOIN users u ON u.idUtente = m.sender_id
            WHERE m.chat_id = ?
            ORDER BY m.sent_at ASC
        `, [chatId], pool)

        // decifra ogni messaggio
        const result = messaggi.map((m: any) => ({
            ...m,
            content: decryptMessage(m.content)
        }))

        // aggiorna i messaggi ricevuti a "letto"
        await executeQuery(`
            UPDATE msg SET statusMsg = 'letto'
            WHERE chat_id = ? AND sender_id != ? AND statusMsg != 'letto'
        `, [chatId, myId], pool)


        const mittenti = await executeQuery(`
    SELECT DISTINCT sender_id FROM msg 
    WHERE chat_id = ? AND sender_id != ? AND statusMsg = 'letto'
`, [chatId, myId], pool)

        for (const m of mittenti) {
            const sseMittente = context.sessions.get(String(m.sender_id))

            
            if (sseMittente) {
                try {
                    await sseMittente.push(
                        { chatId: Number(chatId) },
                        "messaggi-letti"
                    )
                } catch (e) {
                    context.sessions.delete(String(m.sender_id))
                }
            }
        }

        return reply.send({ success: true, messages: result })
    })


    // GET /chat/:chatId/info
    // Info sulla chat (nome, partecipanti, tipo)

    app.get("/chat/:chatId/info", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })
        const myId = await getUserId(sessionId)
        if (!myId) return reply.status(401).send({ message: "Non autorizzato" })

        const { chatId } = req.params as { chatId: string }

        const chat = await executeQuery(
            "SELECT * FROM chat WHERE idChat = ?",
            [chatId], pool
        )
        if (chat.length === 0) return reply.status(404).send({ message: "Chat non trovata" })

        const partecipanti = await executeQuery(`
            SELECT u.idUtente, u.username, u.nome, u.cognome, u.status, p.ruolo
            FROM partecipanti_chat p
            JOIN users u ON u.idUtente = p.user_id
            WHERE p.chat_id = ?
        `, [chatId], pool)

        return reply.send({ success: true, chat: chat[0], partecipanti })
    })

    // DELETE /chat/:chatId
    // Abbandona una chat (o elimina se sei l'ultimo)

    app.delete("/chat/:chatId", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })
        const myId = await getUserId(sessionId)
        if (!myId) return reply.status(401).send({ message: "Non autorizzato" })

        const { chatId } = req.params as { chatId: string }

        // rimuovi me dai partecipanti
        await executeQuery(
            "DELETE FROM partecipanti_chat WHERE chat_id = ? AND user_id = ?",
            [chatId, myId], pool
        )

        // se non ci sono altri partecipanti, elimina la chat e i messaggi
        const rimasti = await executeQuery(
            "SELECT * FROM partecipanti_chat WHERE chat_id = ?",
            [chatId], pool
        )

        if (rimasti.length === 0) {
            await executeQuery("DELETE FROM statoMsg WHERE message_id IN (SELECT idMsg FROM msg WHERE chat_id = ?)", [chatId], pool)
            await executeQuery("DELETE FROM msg WHERE chat_id = ?", [chatId], pool)
            await executeQuery("DELETE FROM chat WHERE idChat = ?", [chatId], pool)
        }

        return reply.send({ success: true, message: "Chat abbandonata" })
    })


    // POST /chat/:chatId/members  (solo gruppi)
    // Aggiungi un membro al gruppo
    // Body: { username: string }

    app.post("/chat/:chatId/members", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })
        const myId = await getUserId(sessionId)
        if (!myId) return reply.status(401).send({ message: "Non autorizzato" })

        const { chatId } = req.params as { chatId: string }
        const body = req.body as { username: string }

        // controlla che sia un gruppo e che io sia amministratore
        const chat = await executeQuery(
            "SELECT * FROM chat WHERE idChat = ? AND is_group = 1",
            [chatId], pool
        )
        if (chat.length === 0) return reply.status(404).send({ message: "Gruppo non trovato" })

        const ruolo = await executeQuery(
            "SELECT ruolo FROM partecipanti_chat WHERE chat_id = ? AND user_id = ?",
            [chatId, myId], pool
        )
        if (ruolo.length === 0 || ruolo[0].ruolo !== "amministratore") {
            return reply.status(403).send({ message: "Solo l'amministratore può aggiungere membri" })
        }

        // trova utente
        const user = await executeQuery(
            "SELECT idUtente FROM users WHERE username = ?",
            [body.username], pool
        )
        if (user.length === 0) return reply.send({ success: false, message: "Utente non trovato" })

        const newUserId = user[0].idUtente

        // controlla se è già nel gruppo
        const existing = await executeQuery(
            "SELECT * FROM partecipanti_chat WHERE chat_id = ? AND user_id = ?",
            [chatId, newUserId], pool
        )
        if (existing.length > 0) return reply.send({ success: false, message: "Utente già nel gruppo" })

        await executeQuery(
            "INSERT INTO partecipanti_chat (chat_id, user_id, ruolo) VALUES (?, ?, 'membro')",
            [chatId, newUserId], pool
        )

        return reply.send({ success: true, message: "Membro aggiunto" })
    })


    // DELETE /chat/:chatId/members/:userId  (solo gruppi)
    // Rimuovi un membro dal gruppo
    app.delete("/chat/:chatId/members/:userId", async (req, reply) => {
        const sessionId = req.cookies?.sessionId
        if (!sessionId) return reply.status(401).send({ message: "Non autorizzato" })
        const myId = await getUserId(sessionId)
        if (!myId) return reply.status(401).send({ message: "Non autorizzato" })

        const { chatId, userId } = req.params as { chatId: string, userId: string }

        const ruolo = await executeQuery(
            "SELECT ruolo FROM partecipanti_chat WHERE chat_id = ? AND user_id = ?",
            [chatId, myId], pool
        )

        const isAdmin = ruolo.length > 0 && ruolo[0].ruolo === "amministratore"
        const isSelf = Number(userId) === myId

        if (!isAdmin && !isSelf) {
            return reply.status(403).send({ message: "Non hai i permessi" })
        }

        const chat = await executeQuery(
            "SELECT is_group FROM chat WHERE idChat = ?",
            [chatId],
            pool
        )

        if (chat.length === 0) {
            return reply.status(404).send({ message: "Chat non trovata" })
        }

        // Se è una chat privata, la elimino per entrambi.
        if (!chat[0].is_group) {
            const altriPartecipanti = await executeQuery(
                "SELECT user_id FROM partecipanti_chat WHERE chat_id = ? AND user_id != ?",
                [chatId, myId],
                pool
            )

            await executeQuery(
                "DELETE FROM statoMsg WHERE message_id IN (SELECT idMsg FROM msg WHERE chat_id = ?)",
                [chatId],
                pool
            )

            await executeQuery(
                "DELETE FROM msg WHERE chat_id = ?",
                [chatId],
                pool
            )

            await executeQuery(
                "DELETE FROM partecipanti_chat WHERE chat_id = ?",
                [chatId],
                pool
            )

            await executeQuery(
                "DELETE FROM chat WHERE idChat = ?",
                [chatId],
                pool
            )

            for (const p of altriPartecipanti) {
                const sseSession = context.sessions.get(String(p.user_id))

                if (sseSession) {
                    try {
                        await sseSession.push(
                            {
                                chatId: Number(chatId),
                                message: "Chat eliminata"
                            },
                            "chat-eliminata"
                        )
                    } catch (e) {
                        context.sessions.delete(String(p.user_id))
                    }
                    sseSession.push(
                        {
                            chatId: Number(chatId),
                            message: "Chat eliminata"
                        },
                        "chat-eliminata"
                    )
                }
            }

            return reply.send({
                success: true,
                message: "Chat eliminata"
            })
        }

        // rimuovi il membro
        await executeQuery(
            "DELETE FROM partecipanti_chat WHERE chat_id = ? AND user_id = ?",
            [chatId, userId], pool
        )



        // controlla quanti rimangono
        const rimasti = await executeQuery(
            "SELECT user_id, ruolo FROM partecipanti_chat WHERE chat_id = ?",
            [chatId], pool
        )

        // se non rimane nessuno → elimina tutto
        if (rimasti.length === 0) {
            await executeQuery("DELETE FROM statoMsg WHERE message_id IN (SELECT idMsg FROM msg WHERE chat_id = ?)", [chatId], pool)
            await executeQuery("DELETE FROM msg WHERE chat_id = ?", [chatId], pool)
            await executeQuery("DELETE FROM chat WHERE idChat = ?", [chatId], pool)
            return reply.send({ success: true, message: "Chat eliminata" })
        }


        const sseKicked = context.sessions.get(String(userId))
        if (sseKicked) {
            const chatNome = await executeQuery("SELECT nomeChat FROM chat WHERE idChat = ?", [chatId], pool)
           
           try {
                await sseKicked.push(
                    {
                        chatId: Number(chatId),
                        nomeChat: chatNome[0]?.nomeChat,
                        message: isSelf ? "Hai abbandonato il gruppo" : "Sei stato rimosso dal gruppo"
                    },
                    isSelf ? "chat-abbandonata" : "removed-from-chat"
                )
            } catch (e) {
                context.sessions.delete(String(userId))
            }
        }

        // se chi è uscito era l'admin → passa l'admin al primo membro rimasto
        if (isAdmin && isSelf) {
            const nuovoAdmin = rimasti[0]
            await executeQuery(
                "UPDATE partecipanti_chat SET ruolo = 'amministratore' WHERE chat_id = ? AND user_id = ?",
                [chatId, nuovoAdmin.user_id], pool
            )

            // notifica il nuovo admin via SSE
            const sseSession = context.sessions.get(String(nuovoAdmin.user_id))
            if (sseSession) {
                try {
                    await sseSession.push(
                        { chatId, message: "Sei il nuovo amministratore del gruppo" },
                        "nuovo-admin"
                    )
                } catch (e) {
                    context.sessions.delete(String(nuovoAdmin.user_id))
                }
            }
        }

        return reply.send({ success: true, message: isSelf ? "Hai abbandonato il gruppo" : "Membro rimosso" })
    })
}