import User from '../models/User.js'
import { StatusCodes } from 'http-status-codes'

const register = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    throw new Error('please provide all values')
  }

  const user = await User.create({ name, email, password })

  res.status(StatusCodes.CREATED).json({ user })
}

const login = async (req, res) => {
  return res.send('login')
}

const updateUser = async (req, res) => {
  return res.send('updateUser')
}

export { register, login, updateUser }
