import * as Module from './title-map-sanitizer'

const dummySiteInfo = {
  sitename: 'Dummy Wiki',
  dbname: 'dummy',
  base: '',
}

describe('fillMissingValuesInTitleMap', () => {
  it.each([
    {
      msg: 'happy path',
      title: {
        titleText: {
          originalRevisionCount: 3,
          revisions: {
            '3': {
              wikiTitle: 'dummy',
              timestamp: '2009-05-28T07:47:00Z',
            },
            '2': { wikiTitle: 'dummy', comment: '' },
            '1': { wikiTitle: 'dummy', comment: '' },
          },
        },
      },
      expected: {
        titleText: {
          originalRevisionCount: 3,
          latestRevision: {
            wikiTitle: 'dummy',
            text: '(데이터 없음)',
            contributor: 'Dummy Wiki의 기여자',
            timestamp: '2009-05-28T07:47:00Z',
          },
          revisions: {
            '3': {
              wikiTitle: 'dummy',
              text: '(데이터 없음)',
              contributor: 'Dummy Wiki의 기여자',
              timestamp: '2009-05-28T07:47:00Z',
            },
            '2': {
              wikiTitle: 'dummy',
              text: '(데이터 없음)',
              comment:
                '(이 판의 편집 시간은 정확한 것이 아니며 상대적인 값입니다)',
              contributor: 'Dummy Wiki의 기여자',
              timestamp: '2009-05-28T07:46:59Z',
            },
            '1': {
              wikiTitle: 'dummy',
              text: '(데이터 없음)',
              comment:
                '(이 판의 편집 시간은 정확한 것이 아니며 상대적인 값입니다)',
              contributor: 'Dummy Wiki의 기여자',
              timestamp: '2009-05-28T07:46:58Z',
            },
          },
        },
      },
    },
    {
      msg: 'Do not overwrite original',
      title: {
        titleText: {
          originalRevisionCount: 1,
          latestRevision: {
            wikiTitle: 'dummy',
            text: '== Title ==',
          },
          revisions: {
            '1': {
              timestamp: '2009-05-28T07:47:00Z',
              contributor: 'foo',
            },
          },
        },
      },
      expected: {
        titleText: {
          originalRevisionCount: 1,
          latestRevision: {
            wikiTitle: 'dummy',
            text: '== Title ==',
          },
          revisions: {
            '1': {
              wikiTitle: 'dummy',
              text: '== Title ==',
              contributor: 'foo',
              timestamp: '2009-05-28T07:47:00Z',
            },
          },
        },
      },
    },
  ])('$msg', ({ msg, title, expected }) => {
    expect(
      Module.fillMissingValuesInTitleMap(
        title,
        dummySiteInfo,
      ),
    ).toStrictEqual(expected)
    msg
  })
})

describe('adjustLatestRevisionInTitle', () => {
  it.each([
    {
      msg: 'nothing happens',
      title: {
        originalRevisionCount: 1,
        revisions: { '1': {} },
      },
      expected: {
        originalRevisionCount: 1,
        revisions: { '1': {} },
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
      },
    },
    {
      msg: 'contributor',
      title: {
        originalRevisionCount: 1,
        revisions: {
          '1': { timestamp: '11:10', contributor: 'asdf' },
        },
        latestRevision: { text: '1' },
      },
      expected: {
        originalRevisionCount: 1,
        revisions: {
          '1': {
            timestamp: '11:10',
            contributor: 'asdf',
            text: '1',
          },
        },
      },
    },
  ])('$msg', ({ msg, title, expected }) => {
    const actual = Module.adjustLatestRevisionInTitle(title)
    expect(actual).toStrictEqual(expected)
    msg
  })
})
