import { wikidokToUtc } from 'libs/date-converter.ts'
import * as Module from 'libs/parsers/history-page-parser.ts'

test('empty string', () => {
  expect(Module.extractRevDataMap('')).toStrictEqual({})
})

test('extractRevDataMap', () => {
  const raw =
    `<a href=\"/wp-d/5794bd61e70c5cb308fc17e5@118/View\" class=\"pjax-link\">118 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/5794bd61e70c5cb308fc17e5@118/View\" class=\"pjax-link\">2020.07.09 16:19</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\">33473 (-96)</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m text-left\">&#xb808;&#xc9c4;&#xcf54;&#xbbf9;&#xc2a4; &#xbd88;&#xacf5;&#xc815;&#xd589;&#xc704; &#xc0ac;&#xd0dc; &#xcd94;&#xac00;.</td>`
  expect(Module.extractRevDataMap(raw)).toStrictEqual({
    '118': {
      timestamp: wikidokToUtc('2020.07.09 16:19'),
      contributor: 'asdf',
      comment: '레진코믹스 불공정행위 사태 추가.',
    },
  })
})

describe('rows', () => {
  it.each([
    {
      msg: '@6',
      raw:
        `<tr>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group btn-group-xs margin-0\">\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"6\" save=\"DLeft\" class=\"margin-0 btn wiki-btn-lversion chkDiffLeft\">L</button>\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"6\" save=\"DRight\" class=\"margin-0 btn wiki-btn-rversion chkDiffRight\">R</button>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@6/View\" class=\"pjax-link\">6 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@6/View\" class=\"pjax-link\">2018.03.31 00:15</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\">1860 (28)</td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m text-left\">&#xb85c;&#xace0; &#xd56d;&#xbaa9; &#xcd94;&#xac00; &#xc11c;&#xc220;</td>\r\n\t\t\t\t\t\t\t\t` +
        `</tr>\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t`,
      expected: {
        '6': {
          timestamp: '2018-03-30T15:15:00Z',
          contributor: 'asdf',
          comment: '로고 항목 추가 서술',
        },
      },
    },
    {
      msg: '@5',
      raw:
        `<tr>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group btn-group-xs margin-0\">\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"5\" save=\"DLeft\" class=\"margin-0 btn wiki-btn-lversion chkDiffLeft\">L</button>\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"5\" save=\"DRight\" class=\"margin-0 btn wiki-btn-rversion chkDiffRight\">R</button>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@5/View\" class=\"pjax-link\">5 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@5/View\" class=\"pjax-link\">2018.03.30 23:07</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\">1832 (512)</td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m text-left\">&#xb85c;&#xace0; &#xc774;&#xbbf8;&#xc9c0; &#xc5c5;&#xb370;&#xc774;&#xd2b8;, &#xd300;&#xc6d0; &#xd56d;&#xbaa9; &#xcd94;&#xac00; &#xc11c;&#xc220;</td>\r\n\t\t\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t` +
        `<tr>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group btn-group-xs margin-0\">\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"4\" save=\"DLeft\" class=\"margin-0 btn wiki-btn-lversion chkDiffLeft\">L</button>\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"4\" save=\"DRight\" class=\"margin-0 btn wiki-btn-rversion chkDiffRight\">R</button>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@4/View\" class=\"pjax-link\">4 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@4/View\" class=\"pjax-link\">2017.12.11 15:39</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m\">1320 (97)</td>\r\n\t\t\t\t\t\t\t\t\t` +
        `<td class=\"td-m text-left\"></td>\r\n\t\t\t\t\t\t\t\t` +
        `</tr>\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t`,
      expected: {
        '4': {
          timestamp: '2017-12-11T06:39:00Z',
          contributor: 'asdf',
          comment: '(데이터 없음)',
        },
        '5': {
          timestamp: '2018-03-30T14:07:00Z',
          contributor: 'asdf',
          comment: '로고 이미지 업데이트, 팀원 항목 추가 서술',
        },
      },
    },
  ])('$msg', ({ msg, raw, expected }) => {
    msg
    expect(Module.extractRevDataMap(raw)).toStrictEqual(expected)
  })
})

test('비건편의점 위키를 열었습니다/History', () => {
  const raw =
    // tr
    `<tr>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group btn-group-xs margin-0\">\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"6\" save=\"DLeft\" class=\"margin-0 btn wiki-btn-lversion chkDiffLeft\">L</button>\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"6\" save=\"DRight\" class=\"margin-0 btn wiki-btn-rversion chkDiffRight\">R</button>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@6/View\" class=\"pjax-link\">6 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@6/View\" class=\"pjax-link\">2018.03.31 00:15</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\">1860 (28)</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m text-left\">&#xb85c;&#xace0; &#xd56d;&#xbaa9; &#xcd94;&#xac00; &#xc11c;&#xc220;</td>\r\n\t\t\t\t\t\t\t\t` +
    `</tr>\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t` +
    // tr
    `<tr>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group btn-group-xs margin-0\">\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"5\" save=\"DLeft\" class=\"margin-0 btn wiki-btn-lversion chkDiffLeft\">L</button>\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"5\" save=\"DRight\" class=\"margin-0 btn wiki-btn-rversion chkDiffRight\">R</button>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@5/View\" class=\"pjax-link\">5 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@5/View\" class=\"pjax-link\">2018.03.30 23:07</a></td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\">1832 (512)</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m text-left\">&#xb85c;&#xace0; &#xc774;&#xbbf8;&#xc9c0; &#xc5c5;&#xb370;&#xc774;&#xd2b8;, &#xd300;&#xc6d0; &#xd56d;&#xbaa9; &#xcd94;&#xac00; &#xc11c;&#xc220;</td>\r\n\t\t\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group btn-group-xs margin-0\">\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"4\" save=\"DLeft\" class=\"margin-0 btn wiki-btn-lversion chkDiffLeft\">L</button>\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"4\" save=\"DRight\" class=\"margin-0 btn wiki-btn-rversion chkDiffRight\">R</button>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@4/View\" class=\"pjax-link\">4 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@4/View\" class=\"pjax-link\">2017.12.11 15:39</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\">1320 (97)</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m text-left\"></td>\r\n\t\t\t\t\t\t\t\t` +
    `</tr>\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t` +
    // tr
    `<tr>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group btn-group-xs margin-0\">\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"3\" save=\"DLeft\" class=\"margin-0 btn wiki-btn-lversion chkDiffLeft\">L</button>\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"3\" save=\"DRight\" class=\"margin-0 btn wiki-btn-rversion chkDiffRight\">R</button>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@3/View\" class=\"pjax-link\">3 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@3/View\" class=\"pjax-link\">2017.07.05 14:26</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\">1223 (142)</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m text-left\"></td>\r\n\t\t\t\t\t\t\t\t` +
    `</tr>\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t` +
    // tr
    `<tr>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group btn-group-xs margin-0\">\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"2\" save=\"DLeft\" class=\"margin-0 btn wiki-btn-lversion chkDiffLeft\">L</button>\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"2\" save=\"DRight\" class=\"margin-0 btn wiki-btn-rversion chkDiffRight\">R</button>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@2/View\" class=\"pjax-link\">2 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@2/View\" class=\"pjax-link\">2017.07.05 14:03</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\">1081 (551)</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m text-left\"></td>\r\n\t\t\t\t\t\t\t\t` +
    `</tr>\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t` +
    // tr
    `<tr>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\">\r\n\t\t\t\t\t\t\t\t\t\t<div class=\"btn-group btn-group-xs margin-0\">\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"1\" save=\"DLeft\" class=\"margin-0 btn wiki-btn-lversion chkDiffLeft\">L</button>\r\n\t\t\t\t\t\t\t\t\t\t\t<button type=\"button\" rev=\"1\" save=\"DRight\" class=\"margin-0 btn wiki-btn-rversion chkDiffRight\">R</button>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@1/View\" class=\"pjax-link\">1 &#xd310;</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wp-d/595c707db8bc3d817f0bc04f@1/View\" class=\"pjax-link\">2017.07.05 13:52</a></td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m\"><a href=\"/wt/EditList/asdf\" class=\"pjax-link\">asdf</a></td>\r\n\t\t\t\t\t\t\t\t\t<td class=\"td-m\">530 (530)</td>\r\n\t\t\t\t\t\t\t\t\t` +
    `<td class=\"td-m text-left\"></td>\r\n\t\t\t\t\t\t\t\t` +
    `</tr>\r\n\t\t\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t`
  expect(Module.extractRevDataMap(raw)).toStrictEqual({
    '1': {
      comment: '(데이터 없음)',
      contributor: 'asdf',
      timestamp: '2017-07-05T04:52:00Z',
    },
    '2': {
      comment: '(데이터 없음)',
      contributor: 'asdf',
      timestamp: '2017-07-05T05:03:00Z',
    },
    '3': {
      comment: '(데이터 없음)',
      contributor: 'asdf',
      timestamp: '2017-07-05T05:26:00Z',
    },
    '4': {
      comment: '(데이터 없음)',
      contributor: 'asdf',
      timestamp: '2017-12-11T06:39:00Z',
    },
    '5': {
      comment: '로고 이미지 업데이트, 팀원 항목 추가 서술',
      contributor: 'asdf',
      timestamp: '2018-03-30T14:07:00Z',
    },
    '6': {
      comment: '로고 항목 추가 서술',
      contributor: 'asdf',
      timestamp: '2018-03-30T15:15:00Z',
    },
  })
})
