import { html } from 'choo'

export function process (state, relay) {
  relay.b('change', function (a1, a2) {
    if (!state[a1]) state[a1] = a2
  })
}

export function load (state, relay) {
  const loads = {}
  Object.assign(state, loads)
  relay('change', 'arg1', 'arg2')
}

export function route (state, relay) {
  return html`<div id='xo'>${html`water`}</div>`
}