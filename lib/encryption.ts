import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function encryptionKey(): Buffer {
  const encoded = process.env.FIELD_ENCRYPTION_KEY;
  if (!encoded)
    throw new Error(
      "FIELD_ENCRYPTION_KEY must be configured before encrypting private fields.",
    );
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32)
    throw new Error(
      "FIELD_ENCRYPTION_KEY must be a 32-byte base64-encoded key.",
    );
  return key;
}

export function encryptField(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return `v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptField(payload: string): string {
  const [version, ivPart, tagPart, encryptedPart] = payload.split(":");
  if (version !== "v1" || !ivPart || !tagPart || !encryptedPart)
    throw new Error("Encrypted field format is invalid.");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
