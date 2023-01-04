import { fillMissingValuesInTitles } from './title-sanitizer'

const dummySiteInfo = {
  sitename: 'Dummy Wiki',
  dbname: 'dummy',
  base: '',
}

test('fillMissingValuesInTitleMap', () => {
  const titleText = 'dummy'
  expect(
    fillMissingValuesInTitles.fillMissingValuesInTitles(
      {
        titleText: {
          originalRevisionCount: 5,
          revisions: {
            '5': { wikiTitle: titleText, timestamp: '2009-05-28T07:47:01Z' },
            '4': { wikiTitle: titleText },
            '3': { wikiTitle: titleText },
            '2': { wikiTitle: titleText },
            '1': { wikiTitle: titleText },
          },
        },
      },
      dummySiteInfo,
    ),
  ).toStrictEqual({
    titleText: {
      originalRevisionCount: 5,
      latestRevision: {
        wikiTitle: titleText,
        text: '(데이터 없음)',
        contributor: 'Dummy Wiki의 기여자',
        timestamp: '2009-05-28T07:47:01Z',
      },
      revisions: {
        '5': {
          wikiTitle: titleText,
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:47:01Z',
        },
        '4': {
          wikiTitle: titleText,
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:47:00Z',
        },
        '3': {
          wikiTitle: titleText,
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:46:59Z',
        },
        '2': {
          wikiTitle: titleText,
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:46:58Z',
        },
        '1': {
          wikiTitle: titleText,
          text: '(데이터 없음)',
          contributor: 'Dummy Wiki의 기여자',
          timestamp: '2009-05-28T07:46:57Z',
        },
      },
    },
  })
})
