import './style.css'
import viteSvgPath from './vite.svg'
import MyWorker from './worker?worker'

async function run() {
  await import('./custom0.js')
  await import('./custom1.js')
  await import('./custom2.js')
  const { fn } = await import('./async.js')
  fn()
}

run()

let isLegacy

// make sure that branching works despite esbuild's constant folding (#1999)
if (import.meta.env.LEGACY) {
  if (import.meta.env.LEGACY === true) isLegacy = true
} else {
  if (import.meta.env.LEGACY === false) isLegacy = false
}

text('#env', `is legacy: ${isLegacy}`)

// Iterators
text('#iterators', [...new Set(['hello'])].join(''))

// structuredClone is supported core.js v3.20.0+
text(
  '#features-after-corejs-3',
  JSON.stringify(structuredClone({ foo: 'foo' })),
)

// babel-helpers
// Using `String.raw` to inject `@babel/plugin-transform-template-literals`
// helpers.
text(
  '#babel-helpers',
  String.raw`exposed babel helpers: ${window._templateObject != null}`,
)

// dynamic chunk names
import('./immutable-chunk.js')
  .then(({ fn }) => fn())
  .then((assets) => {
    text('#assets', assets.join('\n'))
  })

// dynamic css
document
  .querySelector('#dynamic-css-button')
  .addEventListener('click', async () => {
    await import('./dynamic.css')
    text('#dynamic-css', 'dynamic import css')
  })

text('#asset-path', viteSvgPath)

function text(el, text) {
  document.querySelector(el).textContent = text
}

const worker = new MyWorker()
worker.postMessage('ping')
worker.addEventListener('message', (ev) => {
  text('.worker-message', JSON.stringify(ev.data))
})
