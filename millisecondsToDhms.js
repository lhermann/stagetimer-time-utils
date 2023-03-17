export default function millisecondsToDhms (ms = 0, { ceil = true } = {}) {
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
