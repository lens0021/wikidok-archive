import { wikidokToUtc } from 'libs/date-converter.ts'
import { decode } from 'html-entities'

export interface RevDataMap {
  [key: string]: {
    timestamp: string
    contributor: string
    comment: string | null
  }
}

// <a href=\"/wp-d/5794bd61e70c5cb308fc17e5@118/View\" class=\"pjax-link\">118 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\"><a href=\"/wp-d/5794bd61e70c5cb308fc17e5@118/View\" class=\"pjax-link\">2020.07.09 16:19</a></td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\"><a href=\"/wt/EditList/yeokbo\" class=\"pjax-link\">yeokbo</a></td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\">33473 (-96)</td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m text-left\">&#xb808;&#xc9c4;&#xcf54;&#xbbf9;&#xc2a4; &#xbd88;&#xacf5;&#xc815;&#xd589;&#xc704; &#xc0ac;&#xd0dc; &#xcd94;&#xac00;.</td>
export function extractRevDataMap(html: string): RevDataMap {
  html = html.replaceAll(/[\n\t\r]/g, '')
  const rexRow = new RegExp(
    `<a href=\\"\\/wp-d\\/(?<id>[^@]+)@(?<revId>\\d+)\\/View\\" class=\\"pjax-link\\">(?<ts>\\d{4}\\.\\d{2}\\.\\d{2} \\d+:\\d+)<\\/a><\\/td>` +
      `<td class=\\"td-m\\"><a href=\\"\\/wt\\/EditList\\/(?<contributor>[^"]+)\\" class=\\"pjax-link\\">[^<]+<\\/a><\\/td>` +
      `<td class=\\"td-m\\">\\d+ \\(-?\\d+\\)<\\/td>` +
      `<td class=\\"td-m text-left\\">(?<comment>[^<]*)<\\/td>`,
    'g',
  )
  const matches = html.matchAll(rexRow)
  const map: RevDataMap = {}
  for (const match of matches) {
    if (match === undefined) continue

    const g = match!.groups!
    const revId = g['revId']!,
      ts = g['ts']!,
      contributor = g['contributor']!
    const comment =
      g['comment'] !== '' ? decode(g['comment']!) : '(데이터 없음)'
    map[revId] = {
      timestamp: wikidokToUtc(ts),
      contributor,
      comment,
    }
  }
  return map
}
