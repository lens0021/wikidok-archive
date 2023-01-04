import { decode } from 'html-entities'
import { extractRevisionMap } from 'libs/wikidok-extractors/history-page-extractor.ts'
import * as WikidokUrlParser from 'libs/wikidok-url-parser.ts'
import { CrawledObject } from 'types/crawled-object.ts'
import { MwRevision } from 'types/mw-revision.ts'
import { MwTitleMap } from 'types/mw-title.ts'

export function createTitleDump(crawledObjs: CrawledObject[]): MwTitleMap {
  let titles: MwTitleMap = {}
  for (const crawled of crawledObjs) {
    if (!crawled.wikiTitle) {
      console.warn('There is no wikiTitle: ' + crawled.wikiTitle)
      continue
    }
    titles = applyCrawledPage(crawled, titles)
  }

  return titles
}

export function applyCrawledPage(crawled: CrawledObject, titleMap: MwTitleMap) {
  titleMap = applyCrawledHistory(crawled, titleMap)
  titleMap = applyCrawledRevision(crawled, titleMap)
  return titleMap
}

export function applyCrawledHistory(
  crawled: CrawledObject,
  titleMap: MwTitleMap,
) {
  if (
    !WikidokUrlParser.isHistoryPage(crawled.url) ||
    crawled.tblHistory === undefined
  ) {
    return titleMap
  }
  const pageId = WikidokUrlParser.pageId(crawled.url)

  if (pageId === null) {
    return titleMap
  }

  const revisionMap = extractRevisionMap(crawled.tblHistory, crawled)
  for (const strRevId in revisionMap) {
    const numRevId = parseInt(strRevId)

    if (titleMap[pageId] === undefined) {
      titleMap[pageId] = {
        // TODO: There is the exact number on the history page
        originalRevisionCount: Object.keys(revisionMap).length,
        revisions: revisionMap,
      }
    }
    const originRevCnt = titleMap[pageId]!.originalRevisionCount
    if (originRevCnt !== undefined && originRevCnt < numRevId) {
      titleMap[pageId]!.originalRevisionCount = numRevId
    }

    titleMap[pageId]!.revisions[strRevId]! = mergeRevisions(
      titleMap[pageId]!.revisions[strRevId]!,
      revisionMap[strRevId]!,
    )
  }

  return titleMap
}

export function applyCrawledRevision(
  crawled: CrawledObject,
  titles: MwTitleMap,
) {
  const pageId = WikidokUrlParser.pageId(crawled.url),
    revId = WikidokUrlParser.revisionId(crawled.url)
  if (pageId === null) {
    console.warn('Failed to extract data from url:' + crawled.url)
    return titles
  }

  const rev: MwRevision = {
    wikiTitle: crawled.wikiTitle!,
  }
  if (crawled.postContents) {
    rev.text = decode(crawled.postContents)
  }

  const titleIsShipped = titles[pageId] !== undefined
  if (titleIsShipped) {
    const revisionIsShipped =
      revId !== null && titles[pageId]!.revisions[revId] !== undefined
    if (revisionIsShipped) {
      titles[pageId]!.revisions[revId]! = mergeRevisions(
        titles[pageId]!.revisions[revId]!,
        rev,
      )
    }
  } else {
    titles[pageId] = {
      originalRevisionCount: 1,
      revisions: {},
    }
    if (revId !== null) {
      if (titles[pageId] !== undefined) {
        titles[pageId]!.revisions[revId.toString()] = rev
      }
    } else {
      titles[pageId]!.latestRevision = rev
    }
  }

  return titles
}

export function mergeRevisions(
  a: MwRevision | undefined,
  b: MwRevision | undefined,
): MwRevision {
  if (a === undefined && b === undefined) {
    return {}
  }
  if (a === undefined) {
    return b!
  }
  if (b === undefined) {
    return a!
  }

  return { ...a, ...b }
}
