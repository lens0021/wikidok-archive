import * as Module from 'libs/title-map-grouper.ts'

describe('groupTitle', () => {
  function newTitle(count: number) {
    return {
      originalRevisionCount: count,
      revisions: {},
    }
  }
  const titles1 = {
    a: newTitle(1),
    b: newTitle(2),
    c: newTitle(3),
    d: newTitle(4),
    e: newTitle(5),
    f: newTitle(6),
    g: newTitle(7),
  }

  test('three test', () => {
    expect(
      Module.groupTitle(
        {
          a: newTitle(1),
          b: newTitle(2),
          c: newTitle(3),
        },
        2,
      ),
    ).toStrictEqual([
      {
        a: newTitle(1),
        b: newTitle(2),
      },
      {
        c: newTitle(3),
      },
    ])
  })

  test('default window', () => {
    expect(Module.groupTitle(titles1)).toStrictEqual([titles1])
  })

  test('complex', () => {
    expect(Module.groupTitle(titles1, 2)).toStrictEqual([
      {
        a: newTitle(1),
        b: newTitle(2),
      },
      {
        c: newTitle(3),
        d: newTitle(4),
      },
      {
        e: newTitle(5),
        f: newTitle(6),
      },
      {
        g: newTitle(7),
      },
    ])
  })
})
