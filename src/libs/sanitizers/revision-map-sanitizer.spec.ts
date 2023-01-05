import * as replaceHtmlTags from 'libs/sanitizers/html-tag-replacer.ts'
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
        '5': {
          wikiTitle: titleText,
          timestamp: '2009-05-28T07:47:01Z',
        },
        '4': { wikiTitle: titleText, comment: '' },
        '3': { wikiTitle: titleText, comment: '' },
        '2': { wikiTitle: titleText, comment: '' },
        '1': { wikiTitle: titleText, comment: '' },
      },
      {
        originalId: 'loremipsum',
        revisions: {},
      },
      dummySiteInfo,
    ),
  ).toStrictEqual({
    '5': {
      wikiTitle: titleText,
      contributor: 'Dummy Wiki의 기여자',
      text: '(데이터 없음, 원본: [http://ko.dummy.net/wp-d/loremipsum@5/View http://ko.dummy.net/wp-d/loremipsum@5/View])',
      timestamp: '2009-05-28T07:47:01Z',
    },
    '4': {
      wikiTitle: titleText,
      contributor: 'Dummy Wiki의 기여자',
      comment: '(이 판의 편집 시간은 정확한 것이 아니며 상대적인 값입니다)',
      text: '(데이터 없음, 원본: [http://ko.dummy.net/wp-d/loremipsum@4/View http://ko.dummy.net/wp-d/loremipsum@4/View])',
      timestamp: '2009-05-28T07:47:00Z',
    },
    '3': {
      wikiTitle: titleText,
      contributor: 'Dummy Wiki의 기여자',
      comment: '(이 판의 편집 시간은 정확한 것이 아니며 상대적인 값입니다)',
      text: '(데이터 없음, 원본: [http://ko.dummy.net/wp-d/loremipsum@3/View http://ko.dummy.net/wp-d/loremipsum@3/View])',
      timestamp: '2009-05-28T07:46:59Z',
    },
    '2': {
      wikiTitle: titleText,
      contributor: 'Dummy Wiki의 기여자',
      comment: '(이 판의 편집 시간은 정확한 것이 아니며 상대적인 값입니다)',
      text: '(데이터 없음, 원본: [http://ko.dummy.net/wp-d/loremipsum@2/View http://ko.dummy.net/wp-d/loremipsum@2/View])',
      timestamp: '2009-05-28T07:46:58Z',
    },
    '1': {
      wikiTitle: titleText,
      contributor: 'Dummy Wiki의 기여자',
      comment: '(이 판의 편집 시간은 정확한 것이 아니며 상대적인 값입니다)',
      text: '(데이터 없음, 원본: [http://ko.dummy.net/wp-d/loremipsum@1/View http://ko.dummy.net/wp-d/loremipsum@1/View])',
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
      {
        originalId: 'loremipsum',
        revisions: {},
      },
      dummySiteInfo,
    ),
  ).toStrictEqual({
    '2': {
      wikiTitle: titleText,
      contributor: 'Foo',
      text: '(데이터 없음, 원본: [http://ko.dummy.net/wp-d/loremipsum@2/View http://ko.dummy.net/wp-d/loremipsum@2/View])',
      timestamp: '2009-05-28T07:47:01Z',
    },
    '1': {
      wikiTitle: titleText,
      contributor: 'Foo',
      text: '(데이터 없음, 원본: [http://ko.dummy.net/wp-d/loremipsum@1/View http://ko.dummy.net/wp-d/loremipsum@1/View])',
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
    {
      originalId: 'loremipsum',
      revisions: {},
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

it.each([
  {
    html: 'tbody<tbody></tbody>',
    expected: 'tbody',
  },
  {
    html: '<a href="https://twitter.com/areumdriwiki">트위터 계정</a>',
    expected: '[https://twitter.com/areumdriwiki 트위터 계정]',
  },
  {
    html: '<button data-container=".wiki-fnote" data-placement="auto bottom" data-content="%EC%86%8C%EA%B3%B5%EB%8F%99%2C%20%EC%84%9C%EC%86%8C%EB%AC%B8%EB%A1%9C%2C%20%ED%95%9C%EA%B0%95%EC%A7%84%EC%97%ADR%2C%20%EC%9A%A9%EC%82%B0%EC%97%AD%EC%8D%A8%EB%B0%8BR%2C%20%ED%95%9C%EB%82%A8%EB%8F%99%2C%20%ED%8C%8C%EB%AF%B8%EC%97%90%ED%8C%8C%ED%81%ACR%2C%20%EC%B2%AD%EB%8B%B4%EC%82%AC%EA%B1%B0%EB%A6%AC%2C%20%EC%97%AD%EC%82%BC%EC%97%AD%EC%A0%90.%20%EC%9E%90%EC%84%B8%ED%95%9C%20%EC%84%A4%EB%AA%85%EC%9D%80%20%EC%8A%A4%ED%83%80%EB%B2%85%EC%8A%A4%20%ED%94%84%EB%A6%AC%EB%AF%B8%EC%96%B4%20%ED%91%B8%EB%93%9C%20%EC%84%9C%EB%B9%84%EC%8A%A4%20%EC%8A%A4%ED%86%A0%EC%96%B4%20%EC%9B%B9%ED%8E%98%EC%9D%B4%EC%A7%80(http%3A%2F%2Fwww.istarbucks.co.kr%2Fstore%2Fstore_food.do)%20%EC%B0%B8%EA%B3%A0">3</button>',
    expected:
      '<ref>소공동, 서소문로, 한강진역R, 용산역써밋R, 한남동, 파미에파크R, 청담사거리, 역삼역점. 자세한 설명은 스타벅스 프리미어 푸드 서비스 스토어 웹페이지(http://www.istarbucks.co.kr/store/store_food.do) 참고</ref>',
  },
])('$expected', ({ html, expected }) => {
  expect(replaceHtmlTags.replaceHtmlTags(html)).toBe(expected)
})
