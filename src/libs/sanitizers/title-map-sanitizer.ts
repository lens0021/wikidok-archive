import { MwSiteInfo } from 'types/mw-site-info.ts'
import { MwTitle, MwTitleMap } from 'types/mw-title.ts'
import {
  fillMissingRevisions,
  sanitizeRevisionMap,
} from './revision-map-sanitizer'

export function sanitizeTitleMap(
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo,
): MwTitleMap {
  titleMap = fillMissingValuesInTitleMap(titleMap, siteInfo)
  return titleMap
}

export function fillMissingValuesInTitleMap(
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo,
): MwTitleMap {
  for (const title in titleMap) {
    titleMap[title] = fillMissingValuesInTitle(titleMap[title]!, siteInfo)
  }

  return titleMap
}

export function fillMissingValuesInTitle(
  title: MwTitle,
  siteInfo: MwSiteInfo,
): MwTitle {
  if (title.latestRevision && title.originalRevisionCount) {
    const latest = title.latestRevision!
    const originRevCnt = title.originalRevisionCount!
    if (originRevCnt) {
      title.revisions[originRevCnt] = latest
    }
  }

  title.revisions = fillMissingRevisions(title.revisions, siteInfo)
  title.revisions = sanitizeRevisionMap(title.revisions, siteInfo)

  if (!title.latestRevision && title.originalRevisionCount) {
    title.latestRevision = title.revisions[String(title.originalRevisionCount)]!
  }

  return title
}
