import { wikidokToUtc } from '../date-converter'
import * as Module from './history-page-parser'

test('extractRevDataMap', () => {
  expect(Module.extractRevDataMap('')).toStrictEqual({})

  const raw = `<a href=\"/wp-d/5794bd61e70c5cb308fc17e5@118/View\" class=\"pjax-link\">118 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\"><a href=\"/wp-d/5794bd61e70c5cb308fc17e5@118/View\" class=\"pjax-link\">2020.07.09 16:19</a></td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\">33473 (-96)</td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m text-left\">&#xb808;&#xc9c4;&#xcf54;&#xbbf9;&#xc2a4; &#xbd88;&#xacf5;&#xc815;&#xd589;&#xc704; &#xc0ac;&#xd0dc; &#xcd94;&#xac00;.</td>`
  expect(Module.extractRevDataMap(raw)).toStrictEqual({
    '118': {
      timestamp: wikidokToUtc('2020.07.09 16:19'),
      contributor: 'asdf',
      comment: '레진코믹스 불공정행위 사태 추가.',
    },
  })
})
