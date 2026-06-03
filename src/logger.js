const logs = []

export const logger = {
  error(message, meta = {}) {
    logs.push({
      level: 'error',
      message,
      meta,
      timestamp: new Date().toISOString(),
    })
  },

  info(message, meta = {}) {
    logs.push({
      level: 'info',
      message,
      meta,
      timestamp: new Date().toISOString(),
    })
  },

  getLogs() {
    return [...logs]
  },
}
