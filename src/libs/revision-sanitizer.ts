import { omitUnderSecond, oneSecondAgo } from 'libs/date-converter.ts'
import { MwRevisionMap } from 'types/mw-revision.ts'
import { MwSiteInfo } from 'types/mw-site-info.ts'

export function fillMissingValuesInRevisions(
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
        latestTimestamp = omitUnderSecond(new Date().toISOString())
        revisionMap[revId]!.timestamp = latestTimestamp
        if (revisionMap[revId]!.comment === undefined) {
          revisionMap[revId]!.comment = ''
        }
        revisionMap[revId]!.comment =
          revisionMap[revId]!.comment +
          '(이 판의 편집 시간은 정확한 것이 아니며 상대적인 값입니다)'
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
  const latestIndex = findLatestRevisionCount(revisions)
  for (let i = 1; i < latestIndex; i++) {
    revisions[i] = {}
  }
  return revisions
}

export function findLatestRevisionCount(revs: MwRevisionMap): number {
  const indexes = Object.keys(revs).map((k) => parseInt(k))
  return Math.max(...indexes)
}
