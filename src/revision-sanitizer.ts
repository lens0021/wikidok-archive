import { omitUnderSecond, oneSecondAgo } from './date-converter'
import { MwRevisionMap } from './types/mw-revision'
import { MwSiteInfo } from './types/mw-site-info'
import { MwTitleMap } from './types/mw-title'

export function fillMissingValuesInTitles(
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo,
): MwTitleMap {
  for (const title in titleMap) {
    titleMap[title]!.revisions = fillMissingValuesInRevisions(
      titleMap[title]!.revisions,
      siteInfo,
    )
  }

  return titleMap
}

export function fillMissingValuesInRevisions(
  revisionMap: MwRevisionMap,
  siteInfo: MwSiteInfo,
): MwRevisionMap {
  let latestTimestamp: string | null = null
  for (const revId of reversedIter(revisionMap)) {
    if (latestTimestamp === null) {
      if (revisionMap[revId]!.timestamp !== undefined) {
        latestTimestamp = revisionMap[revId]!.timestamp!
      } else {
        latestTimestamp = omitUnderSecond(new Date().toISOString())
      }
      continue
    }
    if (revisionMap[revId]!.timestamp === undefined) {
      const ago = oneSecondAgo(latestTimestamp)
      revisionMap[revId]!.timestamp = ago
      latestTimestamp = ago
    }

    if (revisionMap[revId]!.contributor === undefined) {
      revisionMap[revId]!.contributor = siteInfo.sitename + '의 기여자'
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
