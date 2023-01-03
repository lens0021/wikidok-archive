import { omitUnderSecond, oneSecondAgo } from './date-converter'
import { MwRevisionMap } from './types/mw-revision'
import { MwSiteInfo } from './types/mw-site-info'
import { MwTitleMap } from './types/mw-title'

export function fillMissingValuesInTitles(
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo,
): MwTitleMap {
  for (const title in titleMap) {
    if (
      titleMap[title]!.latestRevision &&
      titleMap[title]!.originalRevisionCount
    ) {
      const latest = titleMap[title]!.latestRevision!
      const originRevCnt = titleMap[title]!.originalRevisionCount!
      if (originRevCnt) {
        titleMap[title]!.revisions[originRevCnt] = latest
      }
    }

    titleMap[title]!.revisions = fillMissingRevisions(
      titleMap[title]!.revisions,
      siteInfo,
    )
    titleMap[title]!.revisions = fillMissingValuesInRevisions(
      titleMap[title]!.revisions,
      siteInfo,
    )

    if (
      !titleMap[title]!.latestRevision &&
      titleMap[title]!.originalRevisionCount
    ) {
      titleMap[title]!.latestRevision =
        titleMap[title]!.revisions[
          String(titleMap[title]!.originalRevisionCount)
        ]!
    }
  }

  return titleMap
}

export function fillMissingValuesInRevisions(
  revisionMap: MwRevisionMap,
  siteInfo: MwSiteInfo,
): MwRevisionMap {
  let latestTimestamp: string | null = null
  for (const revId of reversedIter(revisionMap)) {
    if (revisionMap[revId]!.comment === undefined) {
      revisionMap[revId]!.comment = ''
    }
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
        latestTimestamp = omitUnderSecond(new Date().toISOString())
        revisionMap[revId]!.timestamp = latestTimestamp
        revisionMap[revId]!.comment =
          '(이 판의 편집 시간은 정확한 것이 아니며 상대적인 값임)'
      }
      continue
    }
    if (revisionMap[revId]!.timestamp === undefined) {
      const ago = oneSecondAgo(latestTimestamp)
      revisionMap[revId]!.timestamp = ago
      latestTimestamp = ago
    }
  }
  return revisionMap
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
  return revisions
}
