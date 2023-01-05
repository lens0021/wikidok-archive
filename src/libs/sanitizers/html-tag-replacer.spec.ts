import * as Module from 'libs/sanitizers/html-tag-replacer.ts'

it.each([
  {
    html: 'tbody removed<tbody></tbody>',
    expected: 'tbody removed',
  },
  {
    html: '<a href="https://twitter.com/areumdriwiki">트위터 계정</a>',
    expected: '[https://twitter.com/areumdriwiki 트위터 계정]',
  },
  {
    // Internal links should not be replaced
    html: '<a href="/wp-d/5a19e16603785b6b64457f72/View">비건</a>',
    expected: '<a href="/wp-d/5a19e16603785b6b64457f72/View">비건</a>',
  },
  {
    html:
      '<button data-container=".wiki-fnote" data-placement="auto bottom" ' +
      'data-content="%EC%86%8C%EA%B3%B5%EB%8F%99%2C%20%EC%84%9C%EC%86%8C%EB%AC%B8%EB%A1%9C%2C%20%ED%95%9C%EA%B0%95%EC%A7%84%EC%97%ADR%2C%20%EC%9A%A9%EC%82%B0%EC%97%AD%EC%8D%A8%EB%B0%8BR%2C%20%ED%95%9C%EB%82%A8%EB%8F%99%2C%20%ED%8C%8C%EB%AF%B8%EC%97%90%ED%8C%8C%ED%81%ACR%2C%20%EC%B2%AD%EB%8B%B4%EC%82%AC%EA%B1%B0%EB%A6%AC%2C%20%EC%97%AD%EC%82%BC%EC%97%AD%EC%A0%90.%20%EC%9E%90%EC%84%B8%ED%95%9C%20%EC%84%A4%EB%AA%85%EC%9D%80%20%EC%8A%A4%ED%83%80%EB%B2%85%EC%8A%A4%20%ED%94%84%EB%A6%AC%EB%AF%B8%EC%96%B4%20%ED%91%B8%EB%93%9C%20%EC%84%9C%EB%B9%84%EC%8A%A4%20%EC%8A%A4%ED%86%A0%EC%96%B4%20%EC%9B%B9%ED%8E%98%EC%9D%B4%EC%A7%80(http%3A%2F%2Fwww.istarbucks.co.kr%2Fstore%2Fstore_food.do)%20%EC%B0%B8%EA%B3%A0">' +
      '3</button>',
    expected:
      '<ref>소공동, 서소문로, 한강진역R, 용산역써밋R, 한남동, 파미에파크R, 청담사거리, 역삼역점. 자세한 설명은 스타벅스 프리미어 푸드 서비스 스토어 웹페이지(http://www.istarbucks.co.kr/store/store_food.do) 참고</ref>',
  },
])('$expected', ({ html, expected }) => {
  expect(Module.replaceHtmlTags(html)).toBe(expected)
})

it.each([
  {
    // Should not touch
    html: '<a href="https://twitter.com/areumdriwiki">트위터 계정</a>',
    expected: '<a href="https://twitter.com/areumdriwiki">트위터 계정</a>',
  },
  {
    html: '<a href="/wp-d/5a19e16603785b6b64457f72/View">비건</a>',
    expected: '[[Project:위키독/Dummy/비건|비건]]',
  },
  {
    html: '<a href="/wp-d/5a3ce4fe1d6268267ab5020e/View" class="pjax-link" data-mce-href="/wp-d/5a3ce4fe1d6268267ab5020e/View">락틱애시드(젖산)</a>',
    expected: '[[Project:위키독/Dummy/락틱애시드(젖산)|락틱애시드(젖산)]]',
  },
])('$expected', ({ html, expected }) => {
  expect(
    Module.replaceInternalLinks(
      html,
      {
        '5a19e16603785b6b64457f72': {
          latestRevision: {
            wikiTitle: '비건',
          },
          revisions: {},
        },
        '5a3ce4fe1d6268267ab5020e': {
          latestRevision: {
            wikiTitle: '락틱애시드(젖산)',
          },
          revisions: {},
        },
      },
      {
        sitename: 'Dummy',
        dbname: 'dummy',
        base: '',
      },
    ),
  ).toBe(expected)
})
