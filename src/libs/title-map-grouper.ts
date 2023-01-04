import { MwTitleMap } from 'types/mw-title.ts'

export function groupTitle(
  titles: MwTitleMap,
  windowNum: number = 100,
): MwTitleMap[] {
  const groups: MwTitleMap[] = []
  let group: MwTitleMap = {}
  for (const title in titles) {
    if (Object.keys(group).length == windowNum) {
      groups.push(group)
      group = {}
    }
    group[title] = titles[title]!
  }
  if (Object.keys(group).length > 0) {
    groups.push(group)
  }

  return groups
}
