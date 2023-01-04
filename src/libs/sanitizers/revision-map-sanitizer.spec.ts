import * as Module from 'libs/sanitizers/revision-map-sanitizer.ts'
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
    Module.fillMissingValuesInRevisionMap(
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
  expect(
    Module.fillMissingValuesInRevisionMap(
      {
        '2': {
          wikiTitle: titleText,
          timestamp: '2009-05-28T07:47:01Z',
          contributor: 'Foo',
        },
        '1': {
          wikiTitle: titleText,
          timestamp: '2009-05-28T07:47:01Z',
          contributor: 'Foo',
        },
      },
      dummySiteInfo,
    ),
  ).toStrictEqual({
    '2': {
      wikiTitle: titleText,
      contributor: 'Foo',
      text: '(데이터 없음)',
      timestamp: '2009-05-28T07:47:01Z',
    },
    '1': {
      wikiTitle: titleText,
      contributor: 'Foo',
      text: '(데이터 없음)',
      timestamp: '2009-05-28T07:47:01Z',
    },
  })
})

test('fillMissingValuesInRevisions', () => {
  const titleText = 'dummy'
  const revs = Module.fillMissingValuesInRevisionMap(
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

describe('fillMissingRevisions', () => {
  it.each([
    {
      msg: 'Fill missing revs',
      revs: {
        '3': { wikiTitle: 'dummy', timestamp: '2009-05-28T07:46:58Z' },
      },
      expected: {
        '3': {
          wikiTitle: 'dummy',
          timestamp: '2009-05-28T07:46:58Z',
        },
        '2': {},
        '1': {},
      },
    },
    {
      msg: 'Do not overwrite',
      revs: {
        '3': { wikiTitle: 'dummy', timestamp: '2009-05-28T07:46:58Z' },
        '2': { wikiTitle: 'dummy', timestamp: '2009-05-28T07:46:56Z' },
        '1': { wikiTitle: 'dummy', timestamp: '2009-05-28T07:46:54Z' },
      },
      expected: {
        '3': { wikiTitle: 'dummy', timestamp: '2009-05-28T07:46:58Z' },
        '2': { wikiTitle: 'dummy', timestamp: '2009-05-28T07:46:56Z' },
        '1': { wikiTitle: 'dummy', timestamp: '2009-05-28T07:46:54Z' },
      },
    },
  ])('$msg', ({ msg, revs, expected }) => {
    const actual = Module.fillMissingRevisions(revs, dummySiteInfo)
    expect(actual).toStrictEqual(expected)
    msg
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

describe('escapeSpecialCharacters', () => {
  it.each`
    title           | expected
    ${'[tag]title'} | ${'［tag］title'}
  `('$title', ({ title, expected }) => {
    expect(Module.escapeSpecialCharacters(title)).toBe(expected)
  })
})
