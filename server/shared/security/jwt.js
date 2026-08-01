export function sign(payload) {
  if (payload == null) {
    throw new Error('JWT placeholder sign requires payload')
  }
  return 'token-placeholder'
}

export function verify(token) {
  if (token == null) {
    throw new Error('JWT placeholder verify requires token')
  }
  return null
}
