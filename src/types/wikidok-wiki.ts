import { SiteInfo } from './site-info'

export type Wiki =
  | 'areumdri'
  | 'veganism'
  | 'notice'
  | 'overwatch'
  | 'womwiki0308'

export function siteInfoFor(wiki: Wiki): SiteInfo {
  const base = `http://ko.${wiki}.wikidok.net/Wiki`
  return {
    areumdri: {
      sitename: '아름드리 위키',
      dbname: wiki,
      base,
    },
    veganism: {
      sitename: '비건편의점 WiKi',
      dbname: wiki,
      base,
    },
    notice: {
      sitename: '위키독 캠프',
      dbname: wiki,
      base,
    },
    overwatch: {
      sitename: '오버워치(OVERWATCH) 위키',
      dbname: wiki,
      base,
    },
    womwiki0308: {
      sitename: 'WOMWIKI',
      dbname: wiki,
      base,
    },
  }[wiki]
}
