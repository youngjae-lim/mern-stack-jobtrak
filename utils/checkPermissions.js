import { UnauthenticatedError } from '../errors/index.js'

const checkPermissions = (requestUser, resouceUserId) => {
  // if (requestUser.role === 'admin') return

  if (requestUser.userId === resouceUserId.toString()) return

  throw new UnauthenticatedError('Not authorized to access this route')
}

export default checkPermissions
