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

/**
 * @note Wikidok did not give the second, so timestamps are always ends with 00.000Z
 */
export function omitUnderSecond(ts: string) {
  ts = ts.replace('.000Z', 'Z')
  return ts
}
