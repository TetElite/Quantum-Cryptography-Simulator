// One-time pad helpers: text <-> bits and XOR with the BB84 key.

export function textToBits(text) {
  const bits = []
  for (const byte of new TextEncoder().encode(text)) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1)
  }
  return bits
}

export function bitsToText(bits) {
  const bytes = new Uint8Array(Math.floor(bits.length / 8))
  for (let i = 0; i < bytes.length; i++) {
    let v = 0
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i * 8 + j]
    bytes[i] = v
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

export const xorBits = (bits, key) => bits.map((b, i) => b ^ key[i])

export const toBytes = (bits) => {
  const out = []
  for (let i = 0; i < bits.length; i += 8) out.push(bits.slice(i, i + 8))
  return out
}

export const byteHex = (byteBits) => parseInt(byteBits.join(''), 2).toString(16).toUpperCase().padStart(2, '0')

/** All the one-time-pad numbers for a message locked with Alice's key and unlocked with Bob's key. */
export function lockMessage(run, text) {
  const aliceKey = run?.alice_key ?? []
  const bobKey = run?.bob_key ?? []
  const bits = textToBits(text)
  const need = bits.length
  const capacity = Math.floor(aliceKey.length / 8)
  const fits = need > 0 && aliceKey.length >= need
  if (!fits) return { need, capacity, fits, keyBits: aliceKey.length }
  const ka = aliceKey.slice(0, need)
  const kb = bobKey.slice(0, need)
  const locked = xorBits(bits, ka)
  const unlocked = xorBits(locked, kb)
  const bobText = bitsToText(unlocked)
  return { need, capacity, fits, keyBits: aliceKey.length, bits, ka, kb, locked, unlocked, bobText, ok: bobText === text }
}
