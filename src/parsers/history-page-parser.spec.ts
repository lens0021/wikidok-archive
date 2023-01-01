import * as Module from './history-page-parser'

describe('wikidokToUtc', () => {
  it.each`
    wikidoc               | expected
    ${'2017.07.05 13:52'} | ${'2017-07-05T04:52:00Z'}
  `('%s: %s', ({ wikidoc, expected }) => {
    expect(Module.wikidokToUtc(wikidoc)).toBe(expected)
  })
})
