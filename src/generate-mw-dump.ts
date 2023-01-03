import { extractRevDataMap } from './parsers/history-page-parser'
import { fillMissingValuesInTitles } from './revision-sanitizer'
import { groupTitle } from './title-map-grouper'
import { CrawledObject } from './types/crawled-object'
import { MwRevision } from './types/mw-revision'
import { MwSiteInfo } from './types/mw-site-info'
import { MwTitleMap } from './types/mw-title'
import { siteInfoFor as siteInfoOf, WdSite } from './types/wd-site'
import * as WikidokUrlParser from './wikidok-url-parser'
import { default as Args } from 'args'
import { readdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import xmlbuilder from 'xmlbuilder'

;(async () => {
  await main()
})()

async function main() {
  Args.option('wiki', 'The wiki to process', 'veganism')
  const args = Args.parse(process.argv)

  const wiki = args['wiki'] as WdSite
  console.log('Generate MediaWiki dump for ' + wiki)

  const wikidokDump = await readCrawled(wiki)

  const titleDump = createTitleDump(wikidokDump)

  const titleGroups = groupTitle(titleDump, 3000)
  for (const i of titleGroups.keys()) {
    const group = titleGroups[i] as MwTitleMap
    const mwDumpObj = generateMwDump(group, siteInfoOf(wiki))
    const xml = xmlbuilder.create(mwDumpObj).end({ pretty: true })
    await saveToFile(xml, wiki, i)
  }
}

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
    const id = WikidokUrlParser.id(crawled.url)
    if (id === null) {
      console.warn('Failed to extract id from url:' + crawled.url)
      continue
    }
    const isHistory = WikidokUrlParser.isHistoryPage(crawled.url)
    if (isHistory) {
      titles = applyCrawledHistory(crawled, id, titles)
      continue
    }
    const revId = WikidokUrlParser.revisionId(crawled.url),
      isRevision = revId !== null
    if (isRevision) {
      titles = applyCrawledRevision(crawled, id, revId, titles)
    }
  }
  return titles
}

function applyCrawledHistory(
  crawled: CrawledObject,
  id: string,
  titles: MwTitleMap,
) {
  if (crawled.tblHistory === undefined || id === null) {
    return titles
  }

  const revDataMap = extractRevDataMap(crawled.tblHistory)
  for (const strRevId in revDataMap) {
    const revId = parseInt(strRevId)

    if (titles[id] === undefined) {
      titles[id] = {
        originalRevisionCount: 0,
        revisions: {},
      }
    }
    const originRevCnt = titles[id]!.originalRevisionCount
    if (originRevCnt !== undefined && originRevCnt < revId) {
      titles[id]!.originalRevisionCount = revId
    }
    if (revDataMap[revId]) {
      const timestamp = revDataMap[revId]?.timestamp
      if (timestamp && titles[id]!.revisions[revId]) {
        titles[id]!.revisions[revId]!.timestamp = timestamp
      }

      const contributor = revDataMap[revId]?.contributor
      if (contributor && titles[id]!.revisions[revId]) {
        titles[id]!.revisions[revId]!.contributor = contributor
      }

      const comment = revDataMap[revId]?.comment
      if (comment && titles[id]!.revisions[revId]) {
        titles[id]!.revisions[revId]!.comment = comment
      }
    }
  }

  return titles
}

function applyCrawledRevision(
  crawled: CrawledObject,
  id: string,
  revId: number,
  titles: MwTitleMap,
) {
  const rev: MwRevision = {
    wikiTitle: crawled.wikiTitle!,
  }
  if (crawled.postContents) {
    rev.text = crawled.postContents
  }

  const titleIsShipped = titles[id] !== undefined
  if (titleIsShipped) {
    const revisionIsShipped = titles[id]!.revisions[revId] !== undefined
    if (revisionIsShipped) {
      console.log(`Duplicated: ${id}@${revId}`)
      return titles
    }
    titles[id]!.revisions[revId.toString()] = rev
    if (titles[id]!.originalRevisionCount < revId) {
      titles[id]!.originalRevisionCount = revId
    }
  } else {
    titles[id] = {
      originalRevisionCount: 1,
      revisions: {},
    }
    if (revId !== null) {
      if (titles[id] !== undefined) {
        titles[id]!.revisions[revId.toString()] = rev
      }
    } else {
      titles[id]!.latestRevision = rev
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
  titleMap = fillMissingValuesInTitles(titleMap, siteInfo)
  for (const title in titleMap) {
    const revisions = []
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
          // TODO: Set prefer comment
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
          '#text': titleMap[title]!.revisions[rev]?.text,
        },
      })
    }
    page.push([
      {
        // \[\] 같은 특수문자 처리, 하위문서 처리
        title: titleMap[title]!.latestRevision?.wikiTitle,
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
