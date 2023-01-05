import { decode } from 'html-entities'
import { wikidokToUtc } from 'libs/date-converter.ts'
import { CrawledObject } from 'types/crawled-object.ts'
import { MwRevisionMap } from 'types/mw-revision.ts'

export function extractRevisionMap(
  html: string,
  crawled?: CrawledObject,
): MwRevisionMap {
  const rexRow = new RegExp(
    `<a href=\\"\\/wp-d\\/(?<id>[^@]+)@(?<revId>\\d+)\\/View\\" class=\\"pjax-link\\">(?<ts>\\d{4}\\.\\d{2}\\.\\d{2} \\d+:\\d+)<\\/a><\\/td>` +
      `<td class=\\"td-m\\"><a href=\\"\\/wt\\/EditList\\/(?<contributor>[^"]+)\\" class=\\"pjax-link\\">[^<]+<\\/a><\\/td>` +
      `<td class=\\"td-m\\">\\d+ \\(-?\\d+\\)<\\/td>` +
      `<td class=\\"td-m text-left\\">(?<comment>[^<]*)<\\/td>`,
    'g',
  )
  html = html.replaceAll(/[\r\n\t]/g, '')
  const matches = html.matchAll(rexRow)
  const map: MwRevisionMap = {}
  for (const match of matches) {
    if (match === undefined) continue

    const g = match!.groups!
    const revId = g['revId']!,
      ts = g['ts']!,
      contributor = g['contributor']!
    map[revId] = {
      timestamp: wikidokToUtc(ts),
      contributor,
    }
    map[revId]!.comment =
      g['comment'] !== '' ? decode(g['comment']!) : ''
    const pageTitle = crawled?.wikiTitle
    if (pageTitle !== undefined) {
      map[revId]!.wikiTitle = pageTitle
    }
  }
  return map
}

export function extractLatestRevId(crawled: CrawledObject) {
  if (
    crawled.tblHistory !== undefined &&
    (crawled.url.endsWith('/History') ||
      crawled.url.endsWith('/History?page=1'))
  ) {
    const match = crawled.tblHistory.match(
      /wp-d\/[^@]+@(\d+)\//,
    )
    if (match && match[1] !== undefined) {
      return parseInt(match[1]!)
    }
  }
  return null
}
