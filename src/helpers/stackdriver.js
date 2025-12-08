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
  = ({ level, defaultLevel }) =>
    (info) => ({
      ...info,
      severity: levelToSeverity[level] || levelToSeverity[defaultLevel],
      level: levels[level] || levels[defaultLevel],
      time: Date.now(),
      pid: process.pid,
      hostname: os.hostname()
    })

export default stackdriver
