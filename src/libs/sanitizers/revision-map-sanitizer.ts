import { oneSecondAgo } from 'libs/date-converter.ts'
import {
  MwRevision,
  MwRevisionMap,
} from 'types/mw-revision.ts'
import { MwSiteInfo } from 'types/mw-site-info.ts'
import { MwTitle, MwTitleMap } from 'types/mw-title.ts'
import {
  replaceHtmlTags,
  replaceInternalLinks,
} from './html-tag-replacer'

export function sanitizeRevisionMap(
  revisionMap: MwRevisionMap,
  title: MwTitle,
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo,
): MwRevisionMap {
  revisionMap = fillMissingValuesInRevisionMap(
    revisionMap,
    title,
    siteInfo,
  )
  revisionMap =
    escapeSpecialCharactersInRevisionMap(revisionMap)
  revisionMap = removeHtmlTagsInRevisionMap(
    revisionMap,
    titleMap,
    siteInfo,
  )
  return revisionMap
}

export function fillMissingValuesInRevisionMap(
  revisionMap: MwRevisionMap,
  title: MwTitle,
  siteInfo: MwSiteInfo,
): MwRevisionMap {
  let latestTimestamp: string | null = null
  for (const revId of reversedIter(revisionMap)) {
    if (revisionMap[revId]!.contributor === undefined) {
      revisionMap[revId]!.contributor =
        siteInfo.sitename + '의 기여자'
    } else if (
      revisionMap[revId]!.contributor! === 'admin'
    ) {
      // @todo this is not filling
      revisionMap[revId]!.contributor =
        siteInfo.sitename + '의 Admin'
    }
    if (revisionMap[revId]!.text === undefined) {
      if (title.originalId !== undefined) {
        const sourceUrl = `http://ko.${siteInfo.dbname}.net/wp-d/${title.originalId}@${revId}/View`
        const summary = `(데이터 없음, 원본: [${sourceUrl} ${sourceUrl}])`
        revisionMap[revId]!.text = summary
      } else {
        revisionMap[revId]!.text = '(데이터 없음)'
      }
    }

    if (
      latestTimestamp === null &&
      revisionMap[revId]!.timestamp === undefined
    ) {
      throw new Error(
        'Cannot assume the timestamp of ' +
          title.originalId +
          '@' +
          revId,
      )
    }

    if (latestTimestamp === null) {
      latestTimestamp = revisionMap[revId]!.timestamp!
    } else if (
      revisionMap[revId]!.timestamp === undefined
    ) {
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
  if (
    (revision.comment === undefined &&
      revision.contributor === undefined &&
      revision.text === undefined) ||
    comment === undefined
  ) {
    return revision
  }
  revision.comment = comment
  return revision
}

export function reversedIter(
  revisions: MwRevisionMap,
): string[] {
  const numericKeys = Object.keys(revisions).map((el) =>
    parseInt(el),
  )
  numericKeys.sort((a, b) => {
    return a - b
  })
  const reversedKeys = numericKeys
    .reverse()
    .map((el) => String(el))
  return reversedKeys
  //(24) ['9', '8', '7', '6', '5', '4', '3', '24', '23', '22', '21', '20', '2', '19', '18', '17', '16', '15', '14', '13', '12', '11', '10', '1']
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

export function findLatestRevisionCount(
  revs: MwRevisionMap,
): number {
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

export function escapeSpecialCharacters(
  str: string,
): string {
  const replaceMap: { [key: string]: string } = {
    '[': '［',
    ']': '］',
    '#': '＃',
  }

  for (const replace in replaceMap) {
    str = str.replaceAll(replace, replaceMap[replace]!)
  }
  return str
}

export function removeHtmlTagsInRevisionMap(
  revisionMap: MwRevisionMap,
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo,
): MwRevisionMap {
  for (const revId in revisionMap) {
    if (revisionMap[revId]!.text === undefined) {
      continue
    }
    revisionMap[revId]!.text = replaceInternalLinks(
      revisionMap[revId]!.text!,
      titleMap,
      siteInfo,
    )
    revisionMap[revId]!.text = replaceHtmlTags(
      revisionMap[revId]!.text!,
    )
  }
  return revisionMap
}
