import * as Module from './title-map-sanitizer'

const dummySiteInfo = {
  sitename: 'Dummy Wiki',
  dbname: 'dummy',
  base: '',
}

test('fillMissingValuesInTitleMap', () => {
  const titleText = 'dummy'
  expect(
    Module.fillMissingValuesInTitleMap(
      {
        titleText: {
          originalRevisionCount: 3,
          revisions: {
            '3': { wikiTitle: titleText, timestamp: '2009-05-28T07:47:00Z' },
            '2': { wikiTitle: titleText },
            '1': { wikiTitle: titleText },
          },
        },
      },
      dummySiteInfo,
    ),
  ).toStrictEqual({
    titleText: {
      originalRevisionCount: 3,
      latestRevision: {
        wikiTitle: titleText,
        text: '(데이터 없음)',
        contributor: 'Dummy Wiki의 기여자',
        timestamp: '2009-05-28T07:47:00Z',
      },
      revisions: {
        '3': {
          wikiTitle: titleText,
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:47:00Z',
        },
        '2': {
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:46:59Z',
        },
        '1': {
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:46:58Z',
        },
      },
    },
  })
})

describe('adjustLatestRevisionInTitle', () => {
  it.each([
    {
      msg: 'nothing happens',
      title: {
        originalRevisionCount: 0,
        revisions: {},
      },
      expected: {
        originalRevisionCount: 0,
        revisions: {},
      },
    },
    {
      msg: 'latest to revs',
      title: {
        originalRevisionCount: 1,
        revisions: {},
        latestRevision: { text: '1' },
      },
      expected: {
        originalRevisionCount: 1,
        revisions: { '1': { text: '1' } },
        latestRevision: { text: '1' },
      },
    },
    {
      msg: 'revs to latest',
      title: {
        originalRevisionCount: 1,
        revisions: { '1': { text: '1' } },
      },
      expected: {
        originalRevisionCount: 1,
        revisions: { '1': { text: '1' } },
        latestRevision: { text: '1' },
      },
    },
    {
      msg: 'contributor',
      title: {
        originalRevisionCount: 1,
        revisions: { '1': { timestamp: '11:10', contributor: 'asdf' } },
        latestRevision: { text: '1' },
      },
      expected: {
        originalRevisionCount: 1,
        revisions: {
          '1': { timestamp: '11:10', contributor: 'asdf', text: '1' },
        },
        latestRevision: { timestamp: '11:10', contributor: 'asdf', text: '1' },
      },
    },
  ])('$msg', ({ msg, title, expected }) => {
    const actual = Module.adjustLatestRevisionInTitle(title)
    expect(actual).toStrictEqual(expected)
    msg
  })
})
