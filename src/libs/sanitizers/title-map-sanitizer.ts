import { mergeRevisions } from 'libs/dump-converter.ts'
import { MwSiteInfo } from 'types/mw-site-info.ts'
import { MwTitle, MwTitleMap } from 'types/mw-title.ts'
import {
  fillMissingRevisions,
  findLatestRevisionCount,
  sanitizeRevisionMap,
} from './revision-map-sanitizer'

export function sanitizeTitleMap(
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo,
): MwTitleMap {
  titleMap = fillMissingValuesInTitleMap(titleMap, siteInfo)
  titleMap = adjustLatestRevisionInTitleMap(titleMap)
  return titleMap
}

export function fillMissingValuesInTitleMap(
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo,
): MwTitleMap {
  for (const title in titleMap) {
    titleMap[title] = fillMissingValuesInTitle(
      titleMap[title]!,
      titleMap,
      siteInfo,
    )
  }

  return titleMap
}

export function fillMissingValuesInTitle(
  title: MwTitle,
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo,
): MwTitle {
  if (title.latestRevision && title.originalRevisionCount) {
    const latest = title.latestRevision!
    const originRevCnt = title.originalRevisionCount!
    if (originRevCnt) {
      title.revisions[originRevCnt] =
        title.revisions[originRevCnt] === undefined
          ? latest
          : mergeRevisions(title.revisions[originRevCnt]!, latest)
    }
  }

  title.revisions = fillMissingRevisions(title.revisions, siteInfo)
  title.revisions = sanitizeRevisionMap(title.revisions, titleMap, siteInfo)

  if (!title.latestRevision && title.originalRevisionCount) {
    title.latestRevision = title.revisions[String(title.originalRevisionCount)]!
  }

  return title
}

export function adjustLatestRevisionInTitleMap(
  titleMap: MwTitleMap,
): MwTitleMap {
  for (const title in titleMap) {
    titleMap[title] = adjustLatestRevisionInTitle(titleMap[title]!)
  }
  return titleMap
}

export function adjustLatestRevisionInTitle(title: MwTitle): MwTitle {
  const latestRev = title.latestRevision
  if (title.originalRevisionCount !== undefined) {
    const latestIndex: number = Math.max(
      findLatestRevisionCount(title.revisions),
      title.originalRevisionCount,
    )
    const maybeLatestRev = title.revisions[latestIndex]
    const merged = mergeRevisions(latestRev, maybeLatestRev)
    title.revisions[String(latestIndex)] = merged
    title.latestRevision = merged
  }

  if (title.latestRevision!.wikiTitle) {
    title.latestWikiTitle = title.latestRevision!.wikiTitle
  }
  delete title.latestRevision

  return title
}
