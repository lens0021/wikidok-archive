import * as Module from 'libs/revision-sanitizer.ts'
import { MwRevision } from 'types/mw-revision.ts'

const dummySiteInfo = {
  sitename: 'Dummy Wiki',
  dbname: 'dummy',
  base: '',
}

test('reversedIter', () => {
  function newRevisionId(title: string | number) {
    title = String(title)
    return { wikiTitle: title }
  }
  expect(
    Module.reversedIter({
      '1': newRevisionId(1),
      '2': newRevisionId(2),
      '3': newRevisionId(3),
      '4': newRevisionId(4),
      '5': newRevisionId(5),
    }),
  ).toStrictEqual(['5', '4', '3', '2', '1'])
})

test('fillMissingValuesInRevisions', () => {
  const titleText = 'dummy'
  expect(
    Module.fillMissingValuesInRevisions(
      {
        '5': { wikiTitle: titleText, timestamp: '2009-05-28T07:47:01Z' },
        '4': { wikiTitle: titleText },
        '3': { wikiTitle: titleText },
        '2': { wikiTitle: titleText },
        '1': { wikiTitle: titleText },
      },
      dummySiteInfo,
    ),
  ).toStrictEqual({
    '5': {
      wikiTitle: titleText,
      contributor: 'Dummy Wiki의 기여자',
      text: '(데이터 없음)',
      timestamp: '2009-05-28T07:47:01Z',
    },
    '4': {
      wikiTitle: titleText,
      contributor: 'Dummy Wiki의 기여자',
      text: '(데이터 없음)',
      timestamp: '2009-05-28T07:47:00Z',
    },
    '3': {
      wikiTitle: titleText,
      contributor: 'Dummy Wiki의 기여자',
      text: '(데이터 없음)',
      timestamp: '2009-05-28T07:46:59Z',
    },
    '2': {
      wikiTitle: titleText,
      contributor: 'Dummy Wiki의 기여자',
      text: '(데이터 없음)',
      timestamp: '2009-05-28T07:46:58Z',
    },
    '1': {
      wikiTitle: titleText,
      contributor: 'Dummy Wiki의 기여자',
      text: '(데이터 없음)',
      timestamp: '2009-05-28T07:46:57Z',
    },
  })
})

test('fillMissingValuesInRevisions', () => {
  const titleText = 'dummy'
  const revs = Module.fillMissingValuesInRevisions(
    {
      '3': { wikiTitle: titleText },
      '2': { wikiTitle: titleText },
      '1': { wikiTitle: titleText },
    },
    dummySiteInfo,
  )
  for (const k of ['1', '2', '3']) {
    expect(revs[k]).toBeDefined()
    expect(revs[k]!.timestamp).toBeDefined()
  }
})

test('fillMissingRevisions', () => {
  const titleText = 'dummy'
  const revs = Module.fillMissingRevisions(
    {
      '3': { wikiTitle: titleText, timestamp: '2009-05-28T07:46:58Z' },
    },
    dummySiteInfo,
  )
  expect(revs).toStrictEqual({
    '3': {
      wikiTitle: titleText,
      timestamp: '2009-05-28T07:46:58Z',
    },
    '2': {},
    '1': {},
  })
})

describe('findLatestRevisionCount', () => {
  const rev: MwRevision = { wikiTitle: 'Dummy' }
  it.each`
    rev                       | expected
    ${{ '4': rev }}           | ${4}
    ${{ '2': rev, '1': rev }} | ${2}
  `('$rev', ({ rev, expected }) => {
    expect(Module.findLatestRevisionCount(rev)).toBe(expected)
  })
})
