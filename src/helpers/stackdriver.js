import os from 'node:os'

const levelToSeverity = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL'
}

const levels = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
}

const stackdriver
  = ({ level = 'info', defaultLevel = 'info' } = {}) =>
    (info) => {
      const currentLevel = info?.level ?? level ?? defaultLevel ?? 'info'

      return {
        ...info,
        severity: levelToSeverity[currentLevel] || levelToSeverity[defaultLevel ?? 'info'] || levelToSeverity.info,
        level: levels[currentLevel] || levels[defaultLevel ?? 'info'] || levels.info,
        time: Date.now(),
        pid: process.pid,
        hostname: os.hostname()
      }
    }

export default stackdriver
