export interface WikidokDump {
  filename?: string

  url: string
  loadedUrl?: string
  title?: string

  wikiTitle?: string

  header?: (string | null)[]

  // View page
  postContents?: string
  footNoteLst?: string

  // History page
  tblHistory?: string
}
