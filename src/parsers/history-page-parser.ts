export interface RevTimestampMap {
  [key: string]: string
}

export function extractRevTimestampMap(html: string): RevTimestampMap {
  const matches = html.matchAll(
    /<a href=\"\/wp-d\/([^@]+)@(\d+)\/View\" class=\"pjax-link\">(\d{4}\.\d{2}\.\d{2} \d+:\d+)<\/a>/g,
  )
  const map: RevTimestampMap = {}
  for (const match of matches) {
    if (match && match[2] && match[3]) {
      map[match[2]] = wikidokToUtc(match[3])
    }
  }
  return map
}

export function wikidokToUtc(ts: string): string {
  const date = new Date(ts)
  ts = date.toISOString()
  ts = ts.replace('.000Z', 'Z')
  return ts
}
