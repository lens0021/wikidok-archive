import { oneSecondAgo } from 'libs/date-converter.ts'
import { MwRevision, MwRevisionMap } from 'types/mw-revision.ts'
import { MwSiteInfo } from 'types/mw-site-info.ts'

export function sanitizeRevisionMap(
  revisionMap: MwRevisionMap,
  siteInfo: MwSiteInfo,
): MwRevisionMap {
  revisionMap = fillMissingValuesInRevisionMap(revisionMap, siteInfo)
  revisionMap = escapeSpecialCharactersInRevisionMap(revisionMap)
  revisionMap = removeHtmlTagsInRevisionMap(revisionMap)
  return revisionMap
}

export function fillMissingValuesInRevisionMap(
  revisionMap: MwRevisionMap,
  siteInfo: MwSiteInfo,
): MwRevisionMap {
  let latestTimestamp: string | null = null
  for (const revId of reversedIter(revisionMap)) {
    if (revisionMap[revId]!.contributor === undefined) {
      revisionMap[revId]!.contributor = siteInfo.sitename + '의 기여자'
    }
    if (revisionMap[revId]!.text === undefined) {
      revisionMap[revId]!.text = '(데이터 없음)'
    }

    if (latestTimestamp === null) {
      if (revisionMap[revId]!.timestamp !== undefined) {
        latestTimestamp = revisionMap[revId]!.timestamp!
      } else {
        latestTimestamp = new Date().toISOString()
        revisionMap[revId]!.timestamp = latestTimestamp
        revisionMap[revId]! = appendComment(
          '(이 판의 편집 시간은 정확한 것이 아니며 상대적인 값입니다)',
          revisionMap[revId]!,
        )
      }
      continue
    }
    if (revisionMap[revId]!.timestamp === undefined) {
      const ago = oneSecondAgo(latestTimestamp)
      revisionMap[revId]!.timestamp = ago
      latestTimestamp = ago
      revisionMap[revId]! = appendComment(
        '(이 판의 편집 시간은 정확한 것이 아니며 상대적인 값입니다)',
        revisionMap[revId]!,
      )
    }
  }
  return revisionMap
}

export function appendComment(
  comment: string | undefined,
  revision: MwRevision,
): MwRevision {
  if (revision.comment === undefined) {
    revision.comment = '(편집 요약 데이터 없음)'
  }
  revision.comment += comment
  return revision
}

export function reversedIter(revisions: MwRevisionMap): string[] {
  const numericKeys = Object.keys(revisions).map((el) => parseInt(el))
  numericKeys.sort()
  const reversedNumericKeys = numericKeys.reverse().map((el) => String(el))
  return reversedNumericKeys
}

export function fillMissingRevisions(
  revisions: MwRevisionMap,
  _siteInfo: MwSiteInfo,
): MwRevisionMap {
  const latestIndex = findLatestRevisionCount(revisions)
  for (let i = 1; i < latestIndex; i++) {
    if (revisions[i] === undefined) {
      revisions[i] = {}
    }
  }
  return revisions
}

export function findLatestRevisionCount(revs: MwRevisionMap): number {
  const indexes = Object.keys(revs).map((k) => parseInt(k))
  return Math.max(...indexes)
}
export function escapeSpecialCharactersInRevisionMap(
  revisionMap: MwRevisionMap,
): MwRevisionMap {
  for (const revId in revisionMap) {
    if (revisionMap[revId]!.wikiTitle === undefined) {
      continue
    }
    revisionMap[revId]!.wikiTitle = escapeSpecialCharacters(
      revisionMap[revId]!.wikiTitle!,
    )
  }
  return revisionMap
}

export function escapeSpecialCharacters(str: string): string {
  const replaceMap: { [key: string]: string } = {
    '[': '［',
    ']': '］',
  }

  for (const replace in replaceMap) {
    str = str.replaceAll(replace, replaceMap[replace]!)
  }
  return str
}

export function removeHtmlTagsInRevisionMap(
  revisionMap: MwRevisionMap,
): MwRevisionMap {
  for (const revId in revisionMap) {
    if (revisionMap[revId]!.text === undefined) {
      continue
    }
    revisionMap[revId]!.text = replaceHtmlTags(revisionMap[revId]!.text!)
  }
  return revisionMap
}

/**
 *
 * @todo Replace internal links
 */
export function replaceHtmlTags(html: string): string {
  const replaceMap: { [key: string]: string } = {
    '</?tbody>': '',

    // classes
    ' class="[^"]+"': '',

    // data-mce
    ' data-mce-style="[^"]+"': '',
    ' data-mce-src="[^"]+"': '',
    ' data-mce-href="[^"]+"': '',

    // img
    ' style="display: block; margin-left: auto; margin-right: auto;"': '',
    'width="d+" height="d+"': '',

    // external links
    '<a href="(https?:[^"]+)" wk-external="true">(?:<span>)?([^<]+)(?:</span>)?</a>':
      '[$1 $2]',
  }

  for (const replace in replaceMap) {
    html = html.replaceAll(new RegExp(replace, 'g'), replaceMap[replace]!)
  }

  const refs = [
    ...html.matchAll(
      new RegExp('<button.+data-content="([^"]+)">\\d+</button>', 'g'),
    ),
  ]
  for (const ref of refs) {
    if (ref[1] === undefined) {
      continue
    }
    const refText = decodeURIComponent(ref[1])
    html = html.replaceAll(ref[0], `<ref>${refText}</ref>`)
  }

  return html
}
