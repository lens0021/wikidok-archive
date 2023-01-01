import xmlbuilder from 'xmlbuilder'

async function main() {
  const dump = {
    mediawiki: {
      siteinfo: {
        sitename: {
          '#text': '아름드리위키',
        },
      },

      page: {},
    },
  }
  const xml = xmlbuilder.create(dump).end({ pretty: true })

  console.log(xml)
}

await main()
