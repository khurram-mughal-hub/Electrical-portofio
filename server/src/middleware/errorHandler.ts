import type { ErrorRequestHandler } from 'express'
import type { Logger } from 'pino'

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, _request, response, _next) => {
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? Number(error.status)
      : 500
    const safeStatus = status >= 400 && status < 500 ? status : 500
    logger.error({ status: safeStatus }, 'Request failed')
    response.status(safeStatus).json({
      ok: false,
      error: safeStatus === 500 ? 'The request could not be completed. Please try again later.' : 'Invalid request.',
    })
  }
}
