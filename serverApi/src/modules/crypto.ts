import crypto from "crypto"

// Algoritmo di cifratura: AES-256-GCM per elevata sicurezza
const ALGORITHM = "aes-256-gcm"

// Recupera la chiave di cifratura dal file .env (in formato hex)
function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error("ENCRYPTION_KEY non trovata nel .env")
  return Buffer.from(key, "hex")
}

// Cifra un messaggio usando AES-256-GCM
// Ritorna una stringa base64 concatenata: iv:authTag:encrypted
export function encryptMessage(text: string): string {
  const KEY = getKey()
  const iv = crypto.randomBytes(12) // Vettore di inizializzazione casuale
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ])
  const authTag = cipher.getAuthTag() // Tag di autenticazione per integrità

  // Concatena iv, tag di autenticazione e dati cifrati
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64")
  ].join(":")
}

// Decifra un messaggio precedentemente cifrato
// Attende il formato: iv:authTag:encrypted (in base64)
// Verifica l'integrità del messaggio tramite authTag
export function decryptMessage(encrypted: string): string {
  const KEY = getKey()
  const [ivB64, authTagB64, dataB64] = encrypted.split(":")

  const iv = Buffer.from(ivB64, "base64")
  const authTag = Buffer.from(authTagB64, "base64")
  const data = Buffer.from(dataB64, "base64")

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag) // Verifica l'integrità del messaggio

  return Buffer.concat([
    decipher.update(data),
    decipher.final()
  ]).toString("utf8")
}