import User from '../models/User.js'

const register = async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json({ user })
  } catch (error) {
    next(error) // pass error to the next middleware
  }
}

const login = async (req, res) => {
  return res.send('login')
}

const updateUser = async (req, res) => {
  return res.send('updateUser')
}

export { register, login, updateUser }
