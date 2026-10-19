import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

const router = express.Router()

const makeToken = userId =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' })

// REGISTER
router.post('/register', async (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' })
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) return res.status(409).json({ error: 'Username already taken' })

  const user = await prisma.user.create({
    data: { username, password: bcrypt.hashSync(password, 10) },
  })

  res.status(201).json({ token: makeToken(user.id) })
})

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' })
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  res.json({ token: makeToken(user.id) })
})

export default router