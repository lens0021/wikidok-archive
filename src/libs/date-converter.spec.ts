import * as Module from 'libs/date-converter.ts'

describe('wikidokToUtc', () => {
  it.each`
    ts                    | expected
    ${'2017.07.05 13:52'} | ${'2017-07-05T04:52:00Z'}
  `('$ts: $expected', ({ ts, expected }) => {
    expect(Module.wikidokToUtc(ts)).toBe(expected)
  })
})

describe('oneSecondAgo', () => {
  it.each`
    ts                        | expected
    ${'2017-07-05T04:52:00Z'} | ${'2017-07-05T04:51:59Z'}
    ${'2017-07-05T04:52:01Z'} | ${'2017-07-05T04:52:00Z'}
  `('$ts: $expected', ({ ts, expected }) => {
    expect(Module.oneSecondAgo(ts)).toBe(expected)
  })
})

describe('omitUnderSecond', () => {
  it.each`
    ts                            | expected
    ${'2017-07-05T04:52:00.000Z'} | ${'2017-07-05T04:52:00Z'}
    ${'2017-07-05T04:52:12.345Z'} | ${'2017-07-05T04:52:12Z'}
  `('$ts: $expected', ({ ts, expected }) => {
    expect(Module.omitUnderSecond(ts)).toBe(expected)
  })
})
