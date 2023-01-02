import { MwRevision, MwRevisionMap } from './mw-revision.js'


/**
 * "Title" is a term used in the MediaWiki environment.
 */
export interface MwTitle {
  originalRevisionCount: number
  revisions: MwRevisionMap
  latestRevision?: MwRevision
}

export type MwTitleMap = { [key: string]: MwTitle }

export type MwTitleMapGroup = MwTitleMap[]
