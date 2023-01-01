import * as Module from './wikidok-url-parser'

describe('revisionId', () => {
  it.each`
    url                                                                      | expected
    ${'http://ko.veganism.wikidok.net/wp-d/595c707db8bc3d817f0bc04f@2/View'} | ${2}
    ${'http://ko.veganism.wikidok.net/wp-d/595c707db8bc3d817f0bc04f'}        | ${null}
  `('%s: %s', ({ url, expected }) => {
    expect(Module.revisionId(url)).toBe(expected)
  })
})

describe('history', () => {
  it.each`
    url                                                                       | expected
    ${'http://ko.veganism.wikidok.net/wp-d/595c707db8bc3d817f0bc04f@2/View'}  | ${false}
    ${'http://ko.veganism.wikidok.net/wp-d/595c707db8bc3d817f0bc04f'}         | ${false}
    ${'http://ko.veganism.wikidok.net/wp-d/5a6c679cf71bd11b477d6ede/History'} | ${true}
  `('%s: %s', ({ url, expected }) => {
    expect(Module.isHistoryPage(url)).toBe(expected)
  })
})
