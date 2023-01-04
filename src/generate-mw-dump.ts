import { default as Args } from 'args'
import { readdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { groupTitle } from 'libs/title-map-grouper.ts'
import { fillMissingValuesInTitleMap } from 'libs/title-sanitizer.ts'
import { extractRevisionMap } from 'libs/wikidok-extractors/history-page-extractor.ts'
import * as WikidokUrlParser from 'libs/wikidok-url-parser.ts'
import { CrawledObject } from 'types/crawled-object.ts'
import { MwRevision } from 'types/mw-revision.ts'
import { MwSiteInfo } from 'types/mw-site-info.ts'
import { MwTitleMap } from 'types/mw-title.ts'
import { siteInfoFor as siteInfoOf, WdSite } from 'types/wd-site.ts'
import { PageId, RevisionId } from 'types/wikidok.ts'
import xmlbuilder from 'xmlbuilder'

async function main() {
  Args.option('wiki', 'The wiki to process', 'veganism')
  Args.option('group', 'export as multiple files', false)
  const args = Args.parse(process.argv)

  const wiki = args['wiki'] as WdSite
  console.log('Generate MediaWiki dump for ' + wiki)
  const GROUP = args['wiki'] as boolean

  const wikidokDump = await readCrawled(wiki)
  const titleDump = createTitleDump(wikidokDump)
  const titleGroups = GROUP ? groupTitle(titleDump, 3000) : [titleDump]
  for (const i of titleGroups.keys()) {
    const group = titleGroups[i] as MwTitleMap
    const mwDumpObj = generateMwDump(group, siteInfoOf(wiki))
    const xml = xmlbuilder.create(mwDumpObj).end({ pretty: true })
    await saveToFile(xml, wiki, i)
  }
  console.log('Done')
}
;(async () => {
  await main()
})()

async function readCrawled(
  wiki: string | null = null,
): Promise<CrawledObject[]> {
  // TODO: Use relative path
  const paths = await readdirSync(`storage/datasets/${wiki}`)
  const crawledObjs = []
  for (const path of paths) {
    // TODO: Use relative path
    const file = await readFile(`storage/datasets/${wiki}/${path}`, 'utf8')
    const crawledObj = JSON.parse(file) as CrawledObject
    crawledObj.filename = path
    crawledObjs.push(crawledObj)
  }
  return crawledObjs
}

function createTitleDump(crawledObjs: CrawledObject[]): MwTitleMap {
  let titles: MwTitleMap = {}
  for (const crawled of crawledObjs) {
    if (!crawled.wikiTitle) {
      console.warn('There is no wikiTitle: ' + crawled.wikiTitle)
      continue
    }
    const pageId = WikidokUrlParser.pageId(crawled.url)
    if (pageId === null) {
      console.warn('Failed to extract id from url:' + crawled.url)
      continue
    }
    const isHistory = WikidokUrlParser.isHistoryPage(crawled.url)
    if (isHistory) {
      titles = applyCrawledHistory(crawled, pageId, titles)
      continue
    }
    const revId = WikidokUrlParser.revisionId(crawled.url),
      isRevision = revId !== null
    if (isRevision) {
      titles = applyCrawledRevision(crawled, pageId, revId, titles)
    }
  }

  return titles
}

function applyCrawledHistory(
  crawled: CrawledObject,
  pageId: PageId,
  titleMap: MwTitleMap,
) {
  if (crawled.tblHistory === undefined || pageId === null) {
    return titleMap
  }

  const revisionMap = extractRevisionMap(crawled.tblHistory, crawled)
  for (const strRevId in revisionMap) {
    const revId = parseInt(strRevId)

    if (titleMap[pageId] === undefined) {
      titleMap[pageId] = {
        originalRevisionCount: Object.keys(revisionMap).length,
        revisions: revisionMap,
      }
    }
    const originRevCnt = titleMap[pageId]!.originalRevisionCount
    if (originRevCnt !== undefined && originRevCnt < revId) {
      titleMap[pageId]!.originalRevisionCount = revId
    }
    if (revisionMap[revId]) {
      const timestamp = revisionMap[revId]?.timestamp
      if (timestamp && titleMap[pageId]!.revisions[revId]) {
        titleMap[pageId]!.revisions[revId]!.timestamp = timestamp
      }

      const contributor = revisionMap[revId]?.contributor
      if (contributor && titleMap[pageId]!.revisions[revId]) {
        titleMap[pageId]!.revisions[revId]!.contributor = contributor
      }

      const comment = revisionMap[revId]?.comment
      if (comment && titleMap[pageId]!.revisions[revId]) {
        titleMap[pageId]!.revisions[revId]!.comment = comment
      }
    }
  }

  return titleMap
}

function applyCrawledRevision(
  crawled: CrawledObject,
  pageId: PageId,
  revId: RevisionId,
  titles: MwTitleMap,
) {
  const rev: MwRevision = {
    wikiTitle: crawled.wikiTitle!,
  }
  if (crawled.postContents) {
    rev.text = crawled.postContents
  }

  const titleIsShipped = titles[pageId] !== undefined
  if (titleIsShipped) {
    const revisionIsShipped = titles[pageId]!.revisions[revId] !== undefined
    if (revisionIsShipped) {
      console.log(`Duplicated: ${pageId}@${revId}`)
      return titles
    }
    titles[pageId]!.revisions[revId.toString()] = rev
    if (titles[pageId]!.originalRevisionCount < revId) {
      titles[pageId]!.originalRevisionCount = revId
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

function generateMwDump(titleMap: MwTitleMap, siteInfo: MwSiteInfo) {
  const duplications = checkDuplications(titleMap)
  if (duplications.length > 0) {
    console.log('Duplicated Titles are ignored:')
    console.log(duplications)
  }
  const page = []
  titleMap = fillMissingValuesInTitleMap(titleMap, siteInfo)
  for (const title in titleMap) {
    const revisions = []
    for (const rev in titleMap[title]!.revisions) {
      if (titleMap[title]!.revisions[rev]!.timestamp === undefined) {
        throw Error('timestamp is null for ' + title)
      }
      if (titleMap[title]!.revisions[rev]!.contributor === undefined) {
        throw Error(
          'contributor is null for ' +
            titleMap[title]!.latestRevision?.wikiTitle,
        )
      }
      revisions.push({
        timestamp: {
          '#text': titleMap[title]!.revisions[rev]?.timestamp!,
        },
        contributor: {
          username: {
            '#text': titleMap[title]!.revisions[rev]?.contributor,
          },
        },
        comment: {
          '#text': titleMap[title]!.revisions[rev]?.comment,
        },
        model: {
          '#text': 'wikitext',
        },
        format: {
          '#text': 'text/x-wiki',
        },
        text: {
          '@xml:space': 'preserve',
          // TODO: Parse <a> tags
          // TODO: Replace <img> tags
          // TODO: Replace <tbody> tags
          '#text': titleMap[title]!.revisions[rev]?.text,
        },
      })
    }
    if (
      revisions.length === 0 ||
      titleMap[title]!.latestRevision?.wikiTitle === undefined
    ) {
      debugger
      continue
    }
    page.push([
      {
        // TODO: \[\] 같은 특수문자 처리
        // TODO: 하위문서 처리
        title:
          `Project:위키독/${siteInfo.sitename}/` +
          titleMap[title]!.latestRevision?.wikiTitle,
        revision: revisions,
      },
    ])
  }
  const xmlObjDump = {
    mediawiki: {
      '@xmlns': 'http://www.mediawiki.org/xml/export-0.10/',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@xsi:schemaLocation':
        'http://www.mediawiki.org/xml/export-0.10/ http://www.mediawiki.org/xml/export-0.10.xsd',
      '@version': '0.10',
      '@xml:lang': 'ko',

      siteinfo: {
        sitename: {
          '#text': siteInfo.sitename,
        },
        dbname: {
          '#text': siteInfo.dbname,
        },
        base: {
          '#text': `http://ko.${siteInfo.dbname}.wikidok.net`,
        },
        generator: {
          '#text': 'https://gitlab.com/lens0021/wikidok-archive',
        },
      },

      page,
    },
  }
  return xmlObjDump
}

async function saveToFile(xml: string, wiki: WdSite, step: number) {
  const file = `./mw-dump/${wiki}-${step}.xml`
  await writeFile(file, xml)
}

function checkDuplications(_dumps: MwTitleMap): string[] {
  // TODO
  return []
}
