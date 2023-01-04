export function wikidokToUtc(ts: string): string {
  const date = new Date(ts)
  ts = date.toISOString()
  ts = omitUnderSecond(ts)
  return ts
}

export function oneSecondAgo(ts: string): string {
  const date = new Date(ts)
  try {
    ts = new Date(date.valueOf() - 1000).toISOString()
    return omitUnderSecond(ts)
  } catch (e) {
    return ts
  }
}

export function omitUnderSecond(ts: string): string {
  ts = ts.replace(/\.\d\d\dZ/, 'Z')
  return ts
}
