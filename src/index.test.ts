import assert from 'assert'
import unified from 'unified'
import markdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import raw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import { mdast, handler } from './index'

it('simple ruby', () => {
  const html = [
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
  ] as unified.PluggableList<unified.Settings>

  const processor = unified()
    .use([[markdown, { gfm: true, commonmark: true }], mdast])
    .data('settings', { position: false })
    .use(html)
    .use(rehypeStringify)
    .freeze()

  const actual = String(processor.processSync('{a|b}'))
  const expected = '<p><ruby>a<rt>b</rt></ruby></p>'
  assert.strictEqual(actual, expected)
})
