export interface CrawledObject {
  filename?: string

  url: string
  loadedUrl?: string
  // document.title
  title?: string

  wikiTitle?: string

  header?: (string | null)[]

  // View page
  postContents?: string
  footNoteLst?: string

  // History page
  tblHistory?: string
}
