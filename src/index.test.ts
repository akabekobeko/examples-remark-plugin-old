import unified from 'unified'
import markdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import raw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import unistInspect from 'unist-util-inspect'
import { mdast, handler } from './index'

describe('ruby', () => {
  const processor = unified()
    .use([[markdown, { gfm: true, commonmark: true }], mdast])
    .data('settings', { position: false })
    .use([
      [
        remark2rehype,
        {
          allowDangerousHtml: true,
          handlers: {
            ruby: handler
          }
        }
      ],
      raw
    ] as unified.PluggableList<unified.Settings>)
    .use(rehypeStringify)
    .freeze()

  it('simple ruby', () => {
    const md = '{a|b}'
    const html = '<p><ruby>a<rt>b</rt></ruby></p>'
    const mdast = `
root[1]
└─0 paragraph[1]
    └─0 ruby[1]
        │ data: {"hName":"ruby","rubyText":"b"}
        └─0 text "a"
`.trim()

    expect(String(processor.processSync(md))).toBe(html)
    expect(unistInspect.noColor(processor.parse(md))).toBe(mdast)
  })

  it('enables escape in ruby body', () => {
    const md = '{a\\|b|c}'
    const html = '<p><ruby>a\\<rt>b|c</rt></ruby></p>'
    const mdast = `
root[1]
└─0 paragraph[1]
    └─0 ruby[1]
        │ data: {"hName":"ruby","rubyText":"b|c"}
        └─0 text "a\\\\"
`.trim()

    expect(String(processor.processSync(md))).toBe(html)
    expect(unistInspect.noColor(processor.parse(md))).toBe(mdast)
  })

  it('disables any inline rule in <rt>', () => {
    const md = '{a|*b*}'
    const html = '<p><ruby>a<rt>*b*</rt></ruby></p>'
    const mdast = `
root[1]
└─0 paragraph[1]
    └─0 ruby[1]
        │ data: {"hName":"ruby","rubyText":"*b*"}
        └─0 text "a"
`.trim()

    expect(String(processor.processSync(md))).toBe(html)
    expect(unistInspect.noColor(processor.parse(md))).toBe(mdast)
  })

  it('nested ruby', () => {
    const md = '{{a|b}|c}'
    const html = '<p><ruby>{a<rt>b</rt></ruby>|c}</p>'
    const mdast = `
root[1]
└─0 paragraph[2]
    ├─0 ruby[1]
    │   │ data: {"hName":"ruby","rubyText":"b"}
    │   └─0 text "{a"
    └─1 text "|c}"
`.trim()

    expect(String(processor.processSync(md))).toBe(html)
    expect(unistInspect.noColor(processor.parse(md))).toBe(mdast)
  })

  // Excluded as this is combined with another VFM syntax
  /*
  it('ruby with newline', () => {
    const md = '{a\nb|c}'
    const html = '<p>{a<br>\nb|c}</p>'
    const mdast = `
 root[1]
 └─0 paragraph[3]
     ├─0 text "{a"
     ├─1 break
     └─2 text "b|c}"
`.trim()

    expect(String(processor.processSync(md))).toBe(html)
    expect(unistInspect.noColor(processor.parse(md))).toBe(mdast)
  })
  */
})
