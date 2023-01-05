import { MwRevision, MwRevisionMap } from 'types/mw-revision.ts'

/**
 * "Title" is a term used in the MediaWiki environment.
 */
export interface MwTitle {
  originalId?: string
  originalRevisionCount?: number
  revisions: MwRevisionMap
  latestRevision?: MwRevision
  latestWikiTitle?: string
}

export type MwTitleMap = { [key: string]: MwTitle }

export type MwTitleMapGroup = MwTitleMap[]
