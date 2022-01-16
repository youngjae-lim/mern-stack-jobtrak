import User from '../models/User.js'
import { StatusCodes } from 'http-status-codes'
import { BadRequestError, UnauthenticatedError } from '../errors/index.js'

const register = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    throw new BadRequestError('please provide all values')
  }

  const userAlreadyExists = await User.findOne({ email })
  if (userAlreadyExists) {
    throw new BadRequestError('email already in use')
  }

  // create a user in the mongodb
  const user = await User.create({ name, email, password })
  const token = user.createJWT()

  // send a response to client in json format
  res.status(StatusCodes.CREATED).json({
    user: {
      // hard-coded user object to exclude a hashed password manually
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
    },
    token,
    location: user.location,
  })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('please provide all values')
  }

  // find a user by email
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    throw new UnauthenticatedError('invalid credentials')
  }

  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('invalid credentials')
  }

  const token = user.createJWT()
  // set password to undefined so that we don't expose the hashed password
  user.password = undefined

  res.status(StatusCodes.OK).json({ user, token, location: user.location })
}

const updateUser = async (req, res) => {
  // TODO: clean up console.log later
  console.log(req.user)
  return res.send('updateUser')
}

export { register, login, updateUser }
