export function pageId(url: string) {
  const m = url.match(
    /http:\/\/ko\..+\.wikidok\.net\/wp-[cd]\/([^@\/]+)/,
  )
  if (m && m[1]) {
    return m[1]
  }
  return null
}
export function revisionId(url: string): number | null {
  const m = url.match(/@(\d+)\//)
  if (m && m[1]) {
    return parseInt(m[1])
  }
  return null
}

export function isHistoryPage(url: string): boolean {
  return /http:\/\/ko\..+\.wikidok\.net\/wp-[cd]\/[^@]+\/History/.test(
    url,
  )
}
