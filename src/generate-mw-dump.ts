import { extractRevTimestampMap } from './parsers/history-page-parser.js'
import { SiteInfo } from './types/site-info.js'
import { WikidokDump } from './types/wikidok-dump.js'
import { siteInfoFor, Wiki } from './types/wikidok-wiki.js'
import * as WikidokUrlParser from './wikidok-url-parser.js'
import { default as args } from 'args'
import { readdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import xmlbuilder from 'xmlbuilder'

interface Revision {
  wikiTitle: string
  text?: string
  timestamp?: string
  contributor?: string
}

interface Title {
  originalRevisionCount: number
  revisions: { [key: string]: Revision }
  latestRevision?: Revision
}

args.option('wiki', 'The wiki to process', 'veganism')

await main(args.parse(process.argv)['wiki'] as Wiki)

async function main(wiki: Wiki) {
  console.log('Generate MediaWiki dump for ' + wiki)
  const wikidokDump = await readDumps(wiki)
  const WINDOW = 100
  for (let step = 0; (step + 1) * WINDOW < wikidokDump.length; step++) {
    const slicedDump = wikidokDump.slice(step * WINDOW, (step + 1) * WINDOW)
    const titleDump = createTitleDump(slicedDump)
    // TODO: step title instead of dump
    const mwDumpObj = preprocessDumps(titleDump, siteInfoFor(wiki))
    const xml = xmlbuilder.create(mwDumpObj).end({ pretty: true })
    await saveToFile(xml, wiki, step)
  }
}

async function readDumps(wiki: string | null = null): Promise<WikidokDump[]> {
  const paths = await readdirSync(`storage/datasets/${wiki}`)
  const jsonData = []
  for (const path of paths) {
    const file = await readFile(`storage/datasets/${wiki}/${path}`, 'utf8')
    const json = JSON.parse(file) as WikidokDump
    json.filename = path
    jsonData.push(json)
  }
  return jsonData
}

function createTitleDump(wikidokDump: WikidokDump[]): { [key: string]: Title } {
  const titles: { [key: string]: Title } = {}
  for (const json of wikidokDump) {
    if (!json.wikiTitle) {
      console.warn('There is no wikiTitle: ' + json.wikiTitle)
      continue
    }
    const id = WikidokUrlParser.id(json.url)
    if (id === null) {
      console.warn('Failed to extract id from url:' + json.url)
      continue
    }
    const isHistory = WikidokUrlParser.isHistoryPage(json.url)
    if (isHistory && json.tblHistory) {
      const revTimeMap = extractRevTimestampMap(json.tblHistory)
      for (const strRevId in revTimeMap) {
        const revId = parseInt(strRevId)

        if (titles[id] === undefined) {
          titles[id] = {
            originalRevisionCount: 0,
            revisions: {},
          }
        }
        const originRevCnt = (titles[id] as Title).originalRevisionCount
        if (originRevCnt !== undefined && originRevCnt < revId) {
          ;(titles[id] as Title).originalRevisionCount = revId
        }
        if (revTimeMap[revId]) {
          const timestamp = revTimeMap[revId] as string
          if ((titles[id] as Title).revisions[revId]) {
            ;((titles[id] as Title).revisions[revId] as Revision).timestamp =
              timestamp
          }
        }
      }
      continue
    }
    const revId = WikidokUrlParser.revisionId(json.url)

    const rev: Revision = {
      wikiTitle: json.wikiTitle,
    }
    if (json.postContents) {
      rev.text = json.postContents
    }

    const titleIsShipped = titles[id] !== undefined
    if (titleIsShipped) {
      if (revId !== null) {
        const revisionIsShipped =
          revId !== null && (titles[id] as Title).revisions[revId] !== undefined
        if (revisionIsShipped) {
          console.log(`Duplicated: ${id}@${revId}`)
          continue
        } else {
          ;(titles[id] as Title).revisions[revId.toString()] = rev
          if ((titles[id] as Title).originalRevisionCount < revId) {
            ;(titles[id] as Title).originalRevisionCount = revId
          }
        }
      }
      // TODO: Add revision if not yet exist
    } else {
      titles[id] = {
        originalRevisionCount: 1,
        revisions: {},
      }
      if (revId !== null) {
        if (titles[id] !== undefined) {
          ;(titles[id] as Title).revisions[revId.toString()] = rev
        }
      } else {
        ;(titles[id] as Title).latestRevision = rev
      }
    }
  }
  return titles
}

function preprocessDumps(
  titleMap: { [key: string]: Title },
  siteInfo: SiteInfo,
) {
  const duplications = checkDuplications(titleMap)
  if (duplications) {
    console.log('Duplicated Titles are ignored')
    console.log(duplications)
  }
  const page = []
  for (const title in titleMap) {
    if (titleMap[title] === undefined) {
      continue
    }
    const titleObj = titleMap[title] as Title

    const revisions = []
    if (
      titleMap[title] &&
      titleMap[title]?.latestRevision &&
      titleMap[title]?.originalRevisionCount
    ) {
      const latest = titleMap[title]?.latestRevision as Revision
      const originRevCnt = titleMap[title]?.originalRevisionCount
      if (originRevCnt) {
        titleObj.revisions[originRevCnt] = latest
      }
    }
    for (const rev in titleObj.revisions) {
      revisions.push({
        timestamp: {
          // TODO Use closest timestamp if not given
          '#text': titleMap[title]?.revisions[rev]?.timestamp,
        },
        contributor: {
          username: {
            '#text': titleMap[title]?.revisions[rev]?.contributor,
          },
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
          '#text': titleMap[title]?.revisions[rev]?.text,
        },
      })
    }
    page.push([
      {
        title: titleMap[title]?.latestRevision?.wikiTitle,
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

async function saveToFile(xml: string, wiki: Wiki, step: number) {
  const file = `./mw-dump/${wiki}-${step}.xml`
  await writeFile(file, xml)
}

function checkDuplications(_dumps: { [key: string]: Title }): string[] {
  // TODO
  return []
}
