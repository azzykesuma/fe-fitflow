const PASSWORD_ALG = "RSA-OAEP-SHA256" as const;

function pemToArrayBuffer(pem: string) {
  const normalizedPem = pem.replace(/\\n/g, "\n").trim();
  const base64 = normalizedPem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/^"|"$/g, "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function arrayBufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getPasswordPublicKeyFingerprint() {
  const publicKeyPem = process.env.NEXT_PUBLIC_AUTH_PASSWORD_PUBLIC_KEY;

  if (!publicKeyPem) {
    return "missing-public-key";
  }

  const keyBytes = pemToArrayBuffer(publicKeyPem);
  const digest = await crypto.subtle.digest("SHA-256", keyBytes);

  return arrayBufferToHex(digest).slice(0, 16);
}

export async function encryptPassword(password: string) {
  const publicKeyPem = process.env.NEXT_PUBLIC_AUTH_PASSWORD_PUBLIC_KEY;

  if (!publicKeyPem) {
    throw new Error("Password encryption public key is not configured");
  }

  const publicKey = await crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(publicKeyPem),
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    new TextEncoder().encode(password),
  );

  return {
    password_encrypted: arrayBufferToBase64(encrypted),
    password_alg: PASSWORD_ALG,
  };
}
