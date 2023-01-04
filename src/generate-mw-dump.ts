import { default as Args } from 'args'
import { readdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { createTitleDump } from 'libs/dump-converter'
import { sanitizeTitleMap } from 'libs/sanitizers/title-map-sanitizer.ts'
import { groupTitle } from 'libs/title-map-grouper.ts'
import { CrawledObject } from 'types/crawled-object.ts'
import { MwSiteInfo } from 'types/mw-site-info.ts'
import { MwTitleMap } from 'types/mw-title.ts'
import { siteInfoFor as siteInfoOf, WdSite } from 'types/wd-site.ts'
import xmlbuilder from 'xmlbuilder'

async function main() {
  Args.option('wiki', 'The wiki to process', 'veganism')
  Args.option('group', 'export as multiple files', false)
  Args.option('sanitize', '', true)
  const args = Args.parse(process.argv)

  const wiki = args['wiki'] as WdSite
  console.log('Generate MediaWiki dump for ' + wiki)
  const doGroup = args['wiki'] as boolean
  const sanitize = args['sanitize'] as boolean

  const siteInfo = siteInfoOf(wiki)

  const wdDump = await readCrawled(wiki)
  const mwTitleDump = createTitleDump(wdDump)
  const mwTitleDumpGroups = doGroup
    ? groupTitle(mwTitleDump, 3000)
    : [mwTitleDump]
  for (const i of mwTitleDumpGroups.keys()) {
    let titleMap: MwTitleMap = mwTitleDumpGroups[i]!
    if (sanitize) {
      titleMap = sanitizeTitleMap(titleMap, siteInfo)
    }
    const mwDumpObj = generateMwDump(titleMap, siteInfo)
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

function generateMwDump(titleMap: MwTitleMap, siteInfo: MwSiteInfo) {
  const page = []

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
      if (titleMap[title]!.latestRevision !== undefined) {
        throw Error('latestRevision should be null')
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
          // TODO: Remove redundant numberings in the header
          // TODO: Parse <a> tags
          // TODO: Replace <img> tags
          // TODO: Remove <tbody> tags
          '#text': titleMap[title]!.revisions[rev]?.text,
        },
      })
    }
    if (titleMap[title]!.latestWikiTitle === undefined) {
      throw Error('latestWikiTitle should be defined: ' + title)
    }
    page.push([
      {
        title:
          `Project:위키독/${siteInfo.sitename}/` +
          titleMap[title]!.latestWikiTitle!,
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
