import * as Module from './revision-sanitizer'

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

test('fillMissingValuesInTitleMap', () => {
  const titleText = 'dummy'
  expect(
    Module.fillMissingValuesInTitles(
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
      revisions: {
        '5': { wikiTitle: titleText, timestamp: '2009-05-28T07:47:01Z' },
        '4': { wikiTitle: titleText, timestamp: '2009-05-28T07:47:00Z' },
        '3': { wikiTitle: titleText, timestamp: '2009-05-28T07:46:59Z' },
        '2': { wikiTitle: titleText, timestamp: '2009-05-28T07:46:58Z' },
        '1': { wikiTitle: titleText, timestamp: '2009-05-28T07:46:57Z' },
      },
    },
  })
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
    '5': { wikiTitle: titleText, timestamp: '2009-05-28T07:47:01Z' },
    '4': { wikiTitle: titleText, timestamp: '2009-05-28T07:47:00Z' },
    '3': { wikiTitle: titleText, timestamp: '2009-05-28T07:46:59Z' },
    '2': { wikiTitle: titleText, timestamp: '2009-05-28T07:46:58Z' },
    '1': { wikiTitle: titleText, timestamp: '2009-05-28T07:46:57Z' },
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
