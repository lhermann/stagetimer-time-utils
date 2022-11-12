import parseISO from 'date-fns/parseISO/index.js'
import addDays from 'date-fns/addDays/index.js'

export function millisecondsToHms (ms = 0) {
  return {
    hours: Math.floor(ms / 3600000) || 0,
    minutes: Math.floor((ms % 3600000) / 60000) || 0,
    seconds: Math.floor((ms % 60000) / 1000) || 0,
    decimals: Math.floor((ms % 1000) / 100) || 0,
  }
}

export function millisecondsToDhms (ms = 0, { ceil = true } = {}) {
  const negative = ms < 0 ? 1 : 0
  const decimalMs = Math.abs(Math.floor(ms % 1000)) || 0
  const round = ceil ? Math.ceil : Math.floor
  const roundedMs = Math.abs(round(ms/1000)) * 1000

  return {
    negative,
    days: Math.floor(roundedMs / 86400000) || 0,
    hours: Math.floor((roundedMs % 86400000) / 3600000) || 0,
    minutes: Math.floor((roundedMs % 3600000) / 60000) || 0,
    seconds: Math.floor((roundedMs % 60000) / 1000) || 0,
    decimals: Math.floor(decimalMs / 100),
  }
}

export function hmsToMilliseconds ({ hours = 0, minutes = 0, seconds = 0 } = {}) {
  return (hours * 3600000) + (minutes * 60000) + (seconds * 1000)
}

export function dhmsToMilliseconds ({
  negative = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  decimals = 0,
  ceil = true,
}) {
  let ms = (days * 86400000) + (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + (decimals * 100)
  if (ceil && !negative && decimals > 0) ms -= 1000
  if (!ceil && negative && decimals > 0) ms -= 1000
  const prefix = negative ? -1 : 1
  return prefix * ms
}

export function isValidDate (date) {
  return date instanceof Date && !isNaN(date)
}

export function parseDate (date) {
  if ([null, undefined].includes(date)) return null
  if (isValidDate(date)) return date
  const parsedNative = new Date(date)
  if (isValidDate(parsedNative)) return parsedNative
  const parsedISO = parseISO(date)
  if (isValidDate(parsedISO)) return parsedISO
  return null
}

/**
 * Apply year-month-day to a JS date
 * @param  {Date|string} rawDateTime
 * @param  {Date|string} rawReferenceDate
 * @return {Date}
 */
export function applyDate (rawDateTime, rawReferenceDate) {
  const parsedDateTime = parseDate(rawDateTime)
  const parsedReferenceDate = parseDate(rawReferenceDate)
  if (!isValidDate(parsedDateTime)) return null
  if (!isValidDate(parsedReferenceDate)) return parsedDateTime
  const str = parsedReferenceDate.toISOString().split('T')[0] + 'T' + parsedDateTime.toISOString().split('T')[1]
  return new Date(str)
}

/**
 * [parseDateAsToday description]
 * @param  {Date,String} inputDate           The timestamp to parse
 * @param  {Date,String} options.reference   Used instead of 'Today'
 * @param  {Number}      options.tollerance  If the date is so long in the past, it's considered as tomorrow
 * @return {Date}
 */
export function parseDateAsToday (inputDate, {
  reference = null,
  tollerance = 3 * 60 * 60 * 1000, // 3 hours
} = {}) {
  if (typeof inputDate === 'boolean') return null
  const parsedInput = parseDate(inputDate)
  if (!isValidDate(parsedInput)) return null
  const parsedRef = parseDate(reference) || new Date()
  let output = applyDate(parsedInput, parsedRef)

  // If the date is too long in the past from now (e.g. 10am, but now is 5pm)
  // Then consider it as tomorrow
  if ((parsedRef - output) > tollerance) {
    return addDays(output, 1)
  }

  // If there is a day change and the hour difference is <3h (e.g. 11pm -> 1am)
  // Then consider it as yesterday
  const tolleranceInHours = tollerance / (60 * 60 * 1000)
  const differenceInterDay = 24 - (parsedInput.getUTCHours() - parsedRef.getUTCHours())
  if (differenceInterDay <= tolleranceInHours) {
    return addDays(output, -1)
  }

  return output
}

export function timerToStartDate (timer) {
  if (!timer) return null
  let start = parseDateAsToday(timer.startTime)
  if (timer.startDate) {
    start = applyDate(start, timer.startDate)
  }
  return start
}

export function timerToFinishDate (timer) {
  if (!timer) return null
  const start = timerToStartDate(timer)
  let finish = null
  if (start) {
    finish = parseDateAsToday(timer.finishTime, { reference: start, tollerance: 0 })
  } else {
    finish = parseDateAsToday(timer.finishTime)
  }
  if (timer.finishDate) {
    finish = applyDate(finish, timer.finishDate)
  }
  return finish
}

export default {
  millisecondsToHms,
  hmsToMilliseconds,
  isValidDate,
  parseDate,
  parseDateAsToday,
  applyDate,
  timerToStartDate,
  timerToFinishDate,
}
