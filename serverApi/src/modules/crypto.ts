import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex") // 32 byte

export function encryptMessage(text: string): string {
    const iv = crypto.randomBytes(12) // 12 byte per GCM
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)

    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final()
    ])
    const authTag = cipher.getAuthTag() // tag di autenticità (anti-manomissione)

    // Salviamo tutto insieme: iv:authTag:encrypted (in base64)
    return [
        iv.toString("base64"),
        authTag.toString("base64"),
        encrypted.toString("base64")
    ].join(":")
}

export function decryptMessage(encrypted: string): string {
    const [ivB64, authTagB64, dataB64] = encrypted.split(":")

    const iv = Buffer.from(ivB64, "base64")
    const authTag = Buffer.from(authTagB64, "base64")
    const data = Buffer.from(dataB64, "base64")

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
    decipher.setAuthTag(authTag)

    return Buffer.concat([
        decipher.update(data),
        decipher.final()
    ]).toString("utf8")
}