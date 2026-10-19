import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

const toTodo = ({ userId, ...todo }) => todo   // hide userId from responses

// READ all
router.get('/', async (req, res) => {
  const todos = await prisma.todo.findMany({
    where: { userId: req.userId },
    orderBy: { id: 'asc' },
  })
  res.json(todos.map(toTodo))
})

// READ one
router.get('/:id', async (req, res) => {
  const todo = await prisma.todo.findFirst({
    where: { id: Number(req.params.id), userId: req.userId },
  })
  if (!todo) return res.status(404).json({ error: 'Todo not found' })
  res.json(toTodo(todo))
})

// CREATE
router.post('/', async (req, res) => {
  const task = req.body?.task
  if (!task) return res.status(400).json({ error: 'task is required' })

  const todo = await prisma.todo.create({ data: { task, userId: req.userId } })
  res.status(201).json(toTodo(todo))
})

// UPDATE
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.todo.findFirst({ where: { id, userId: req.userId } })
  if (!existing) return res.status(404).json({ error: 'Todo not found' })

  const data = {}
  if (req.body?.task !== undefined) data.task = req.body.task
  if (req.body?.done !== undefined) data.done = Boolean(req.body.done)

  const todo = await prisma.todo.update({ where: { id }, data })
  res.json(toTodo(todo))
})

// DELETE
router.delete('/:id', async (req, res) => {
  const result = await prisma.todo.deleteMany({
    where: { id: Number(req.params.id), userId: req.userId },
  })
  if (result.count === 0) return res.status(404).json({ error: 'Todo not found' })
  res.sendStatus(204)
})

export default router