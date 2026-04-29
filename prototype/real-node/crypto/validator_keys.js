const crypto = require("crypto");

function createValidatorKeypair() {
  return crypto.generateKeyPairSync("ed25519");
}

function exportPublicKey(publicKey) {
  return publicKey.export({ type: "spki", format: "pem" });
}

function signAttestation(privateKey, attestationPayload) {
  const payload = Buffer.from(JSON.stringify(attestationPayload));
  return crypto.sign(null, payload, privateKey).toString("hex");
}

function verifyAttestation(publicKeyPem, attestationPayload, signatureHex) {
  const publicKey = crypto.createPublicKey(publicKeyPem);
  const payload = Buffer.from(JSON.stringify(attestationPayload));
  return crypto.verify(null, payload, publicKey, Buffer.from(signatureHex, "hex"));
}

module.exports = {
  createValidatorKeypair,
  exportPublicKey,
  signAttestation,
  verifyAttestation,
};
