import { MwSiteInfo } from 'types/mw-site-info.ts'
import { MwTitleMap } from 'types/mw-title.ts'
import { escapeSpecialCharacters } from './revision-map-sanitizer'

export function replaceHtmlTags(html: string): string {
  const replaceMap: { [key: string]: string } = {
    '</?tbody>': '',

    // classes
    ' class="[^"]+"': '',

    // data-mce
    ' data-mce-style="[^"]+"': '',
    ' data-mce-src="[^"]+"': '',
    ' data-mce-href="[^"]+"': '',

    // img
    ' style="display: block; margin-left: auto; margin-right: auto;"': '',
    'width="d+" height="d+"': '',

    // external links
    '<a href="(https?:[^"]+)"(?: wk-external="true")?>(?:<span>)?([^<]+)(?:</span>)?</a>':
      '[$1 $2]',
  }

  for (const replace in replaceMap) {
    html = html.replaceAll(new RegExp(replace, 'g'), replaceMap[replace]!)
  }

  const refs = [
    ...html.matchAll(
      new RegExp('<button.+data-content="([^"]+)">\\d+</button>', 'g'),
    ),
  ]
  for (const ref of refs) {
    if (ref[1] === undefined) {
      continue
    }
    let refText
    try {
      refText= decodeURIComponent(ref[1])
    }
    catch {
      refText = ref[1]
    }
    html = html.replaceAll(ref[0], `<ref>${refText}</ref>`)
  }

  return html
}

/**
 *
 * @todo
 */
export function replaceInternalLinks(
  html: string,
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo,
): string {
  const regex = new RegExp(
    '<a href="/wp-d/(?<pageId>[^/]+)/View"[^>]*>(?:<span>)?(?<text>[^<]+)(?:</span>)?</a>',
    'g',
  )
  const matches = [...html.matchAll(regex)]
  for (const match of matches) {
    const pageId = match.groups!['pageId']!
    if (titleMap[pageId]?.latestRevision?.wikiTitle !== undefined) {
      const subTitle = escapeSpecialCharacters(
        titleMap[pageId]!.latestRevision!.wikiTitle!,
      )
      const title = `Project:위키독/${siteInfo.sitename}/${subTitle}`
      html = html.replaceAll(match[0], `[[${title}|${match.groups!['text']}]]`)
    }
  }

  return html
}
