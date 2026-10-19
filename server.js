import express from 'express'
import authRoutes from './routes/authRoutes.js'
import todoRoutes from './routes/todoRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'

const app = express()
const PORT = process.env.PORT || 7806

app.use(express.json())

app.use('/auth', authRoutes)                    // public
app.use('/todos', authMiddleware, todoRoutes)   // protected

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})