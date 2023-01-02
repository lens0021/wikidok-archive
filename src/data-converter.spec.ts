import * as Module from './date-converter'

describe('wikidokToUtc', () => {
  it.each`
    wikidoc               | expected
    ${'2017.07.05 13:52'} | ${'2017-07-05T04:52:00Z'}
  `('$wikidoc: $expected', ({ wikidoc, expected }) => {
    expect(Module.wikidokToUtc(wikidoc)).toBe(expected)
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
  `('$ts: $expected', ({ ts, expected }) => {
    expect(Module.omitUnderSecond(ts)).toBe(expected)
  })
})
