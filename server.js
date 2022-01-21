import express from 'express'

// middlewares
import notFoundMiddleware from './middleware/not-found.js'
import errorHandlerMiddleware from './middleware/error-handler.js'
import authenticateUser from './middleware/auth.js'

import 'express-async-errors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import connectDB from './db/connect.js'

// routers
import authRouter from './routes/authRoutes.js'
import jobsRouter from './routes/jobsRoutes.js'

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

// packages for security
import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'

dotenv.config()
const app = express()

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

const __dirname = dirname(fileURLToPath(import.meta.url))

// only when ready to deploy -- the location of static assests in the production
// app.use(express.static(path.resolve(__dirname, './client/build')))

app.use(express.json())
app.use(helmet()) // secure express apps by setting various HTTP headers
app.use(xss()) // sanitize user input coming from POST body, GET queries, and url params
app.use(mongoSanitize()) // sanitize user-supplied data to prevent MongoDB operator injection

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)

// only when ready to deploy
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
// })

// middleware
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
