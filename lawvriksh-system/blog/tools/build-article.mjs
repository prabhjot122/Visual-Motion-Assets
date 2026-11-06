// Article page template (HTML/CSS) with an offline Markdown renderer.
import {write, page, schema, P, S, esc, html, MARK} from './lib.mjs';

export const SAMPLE_MD = `## Why the check matters

A citation can read well and still not be the citation you need. A draft may name a case that does not exist, or one that does not say what the sentence says. The routine below takes about a minute per citation.[^1]

::: note
This is placeholder text for the layout. Replace every [bracketed] item with the real matter, court and date.
:::

## Five checks, in order

::: figure
../previews/graphics/process-steps-04-vertical-thread-720-{theme}.png | The five checks as a numbered sequence | Figure 1. The order matters: source first, judgment last.
:::

1. **Find it** in an authorised source, not in the draft.
2. **Read the paragraph** your point rests on.
3. **Match** the court, date and parties.
4. **Note** what you checked, one line per citation.
5. **Decide** whether it helps your client.

### Read the paragraph, not the headnote

::: term Headnote
A short summary written for readers. It is not the court's own words.
:::

Your sentence should say no more than the paragraph does. Compare the two before you rely on it:

::: source
[Court] | [date] | [Party] v [Party] | para [para]
:::

| Not this | This |
|---|---|
| Cite the headnote | Cite the paragraph |
| Trust the tool's citation | Find it in an authorised source |
| Assume the date | Match the date on the page |

::: pull
A citation that reads well is not yet a citation you have checked.
:::

::: caution Before you file
If any one of court, date or parties does not match, stop and recheck before the citation goes into the filing.
:::

::: settle
A matching citation shows that it exists and says what you wrote. Whether it is still good law, and whether it fits your facts, stays your judgment.
:::

## A short checklist

::: checklist
- Found in an authorised source
- Paragraph read and noted [1]
- Court, date and parties match
- Written down, one line each
:::

---

[^1]: [Source], [date]. Placeholder source line: replace with the real source.
`;

const props = {
  kicker: P.kicker, title_html: S({maxLength: 100, pattern: '^(?!.*<(?!/?b>|br ?/?>)).*$', description: 'Article title. Emphasis with <b>…</b>.'}),
  dek: S({maxLength: 200}), author: S({maxLength: 40}), date: S({maxLength: 24}), reading_time: S({maxLength: 20}),
  contents: {type: 'array', minItems: 1, maxItems: 8, items: S({maxLength: 60}), description: 'Optional. When omitted the contents list is built from the H2 headings.'},
  body_md: S({description: 'The article body as Markdown. Raw HTML is never passed through. Components: ::: note | caution | settle | term | pull | steps | checklist | cta | figure | source (see README).'}),
  cta_title_html: P.title_html, cta_body_html: P.body_html, cta_button: S({maxLength: 30}), cta_note: S({maxLength: 90}), cta_link: S({maxLength: 80, description: 'Tracked link; shown as link text and used as href.'})
};
const ex = {theme: 'paper', kicker: 'Practice note', title_html: 'How to check an <b>AI-assisted citation</b> before you file', dek: 'A short routine for individual advocates: find it, read it, match it, note it.',
  author: 'LawVriksh', date: '[date]', reading_time: '[n] min read', body_md: SAMPLE_MD,
  cta_title_html: 'One practice note, <b>every week</b>', cta_body_html: 'Short, checkable habits for individual advocates.', cta_button: 'Follow LawVriksh', cta_note: 'Save this for your next filing.', cta_link: 'lawvriksh.com/[tracked-path]'};

const body = `
<header class="art-mast">
  <div class="art-bar"><span class="mark"><img src="${MARK}" alt="LawVriksh"></span><span class="wordmark">Law<span>Vriksh</span></span><span class="art-tag">Blog</span></div>
  <div class="art-hero">
    <p class="art-kicker" data-slot="kicker">${esc(ex.kicker)}</p>
    <h1 class="art-title" data-slot-html="title_html">${html(ex.title_html)}</h1>
    <p class="art-dek" data-slot="dek" data-optional>${esc(ex.dek)}</p>
    <p class="art-by"><span class="who" data-slot="author">${esc(ex.author)}</span><span class="sep" aria-hidden="true"></span><span data-slot="date">${esc(ex.date)}</span><span class="sep" aria-hidden="true"></span><span data-slot="reading_time">${esc(ex.reading_time)}</span></p>
  </div>
</header>
<div class="art-wrap">
  <nav class="art-toc" data-toc aria-label="Contents"><p class="art-toc-k">Contents</p><ol data-slot-list="contents"><template><li><span data-field="text"></span></li></template></ol></nav>
  <article class="art-body" data-slot-md="body_md"><script type="text/markdown">
${SAMPLE_MD.replace(/<\/script/gi, '<\\/script')}
</script></article>
  <section class="lv-cta art-cta">
    <div class="lv-cta-t"><p class="lv-cta-h" data-slot-html="cta_title_html">${html(ex.cta_title_html)}</p><p data-slot-html="cta_body_html" data-optional>${html(ex.cta_body_html)}</p></div>
    <a class="lv-btn" href="#" data-slot="cta_button">${esc(ex.cta_button)}</a>
    <p class="lv-cta-note" data-slot="cta_note" data-optional>${esc(ex.cta_note)}</p>
    <a class="lv-link" href="#" data-slot="cta_link" data-slot-href="cta_link" data-optional>${esc(ex.cta_link)}</a>
  </section>
</div>`;

export function build(){
  write('article/article.schema.json', schema('article/article', 'Article page', props, ['title_html', 'body_md']));
  write('article/article.example.json', ex);
  write('article/sample.md', SAMPLE_MD);
  write('article/article.html', page({title: 'LawVriksh blog — article page', id: 'blog/article/article', size: '1280x900', format: 'article', css: ['article.css'], body, meta: {role: 'article page'}}));
  return [{family: 'article', kind: 'article', group: 'article', id: 'article', title: 'Article page', size: '1280x900', file: 'article/article.html', schema: 'article/article.schema.json', example: 'article/article.example.json', skipChecks: ['safeArea', 'minSize'], slots: Object.keys(props)}];
}
