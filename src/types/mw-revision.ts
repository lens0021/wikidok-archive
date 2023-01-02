export interface MwRevision {
  wikiTitle: string
  text?: string
  timestamp?: string
  contributor?: string
  comment?: string
}

export type MwRevisionMap = { [key: string]: MwRevision }
