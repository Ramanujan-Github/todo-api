import jwt from 'jsonwebtoken'

export default function authMiddleware(req, res, next) {
  const header = req.headers.authorization          // "Bearer eyJhbGci..."
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.id      // hand the user id to the route
    next()                       // pass control to the route handler
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}