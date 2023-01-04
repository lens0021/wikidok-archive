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
            '3': { wikiTitle: titleText, timestamp: '2009-05-28T07:47:01Z' },
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
        timestamp: '2009-05-28T07:47:01Z',
      },
      revisions: {
        '3': {
          wikiTitle: titleText,
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:47:01Z',
        },
        '2': {
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:47:00Z',
        },
        '1': {
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:46:59Z',
        },
      },
    },
  })
})
