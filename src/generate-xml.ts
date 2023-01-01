import xmlbuilder from 'xmlbuilder'

async function main() {
  const dump = {
    mediawiki: {
      '@xmlns': 'http://www.mediawiki.org/xml/export-0.10/',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@xsi:schemaLocation':
        'http://www.mediawiki.org/xml/export-0.10/ http://www.mediawiki.org/xml/export-0.10.xsd',
      '@version': '0.10',
      '@xml:lang': 'ko',

      siteinfo: {
        sitename: {
          '#text': '아름드리위키',
        },
        dbname: {
          '#text': 'areumdri',
        },
        base: {
          '#text': 'http://ko.areumdri.wikidok.net',
        },
        generator: {
          '#text': 'https://gitlab.com/lens0021/wikidok-archive',
        },
      },

      page: [
        {
          title: '위키를 개설하며',
          revision: [
            {
              timestamp: {
                '#text': '2023-01-01T04:56:44Z',
              },
              contributor: {
                username: {
                  '#text': 'anonymous',
                },
              },
              model: {
                '#text': 'wikitext',
              },
              format: {
                '#text': 'text/x-wiki',
              },
              text: {
                '@xml:space': 'preserve',
                '#text': '== Title ==',
              },
            },
          ],
        },
      ],
    },
  }
  const xml = xmlbuilder.create(dump).end({ pretty: true })

  console.log(xml)
}

await main()
