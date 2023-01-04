import { MwSiteInfo } from 'types/mw-site-info.ts';
import { MwTitleMap } from 'types/mw-title.ts';
import { fillMissingRevisions, fillMissingValuesInRevisions } from './revision-sanitizer';


export function fillMissingValuesInTitles(
  titleMap: MwTitleMap,
  siteInfo: MwSiteInfo
): MwTitleMap {
  for (const title in titleMap) {
    if (titleMap[title]!.latestRevision &&
      titleMap[title]!.originalRevisionCount) {
      const latest = titleMap[title]!.latestRevision!;
      const originRevCnt = titleMap[title]!.originalRevisionCount!;
      if (originRevCnt) {
        titleMap[title]!.revisions[originRevCnt] = latest;
      }
    }

    titleMap[title]!.revisions = fillMissingRevisions(
      titleMap[title]!.revisions,
      siteInfo
    );
    titleMap[title]!.revisions = fillMissingValuesInRevisions(
      titleMap[title]!.revisions,
      siteInfo
    );

    if (!titleMap[title]!.latestRevision &&
      titleMap[title]!.originalRevisionCount) {
      titleMap[title]!.latestRevision =
        titleMap[title]!.revisions[String(titleMap[title]!.originalRevisionCount)]!;
    }
  }

  return titleMap;
}
