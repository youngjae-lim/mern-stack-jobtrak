import { StatusCodes } from 'http-status-codes'

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err)
  const defaultError = {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    msg: 'Something went wrong, try again later',
  }
  // TODO: change err to defaultError.msg
  res.status(defaultError.statusCode).json({ msg: err })
}

export default errorHandlerMiddleware
