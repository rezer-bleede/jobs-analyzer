import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

const contentScript = readFileSync(resolve(process.cwd(), 'extension/content.js'), 'utf8')

describe('Greenhouse content script', () => {
  it('fills matching empty fields and preserves existing answers by default', () => {
    document.body.innerHTML = `
      <label>First Name<input name="first_name"></label>
      <label>Last Name<input name="last_name" value="Existing"></label>
      <label>Email<input name="email" type="email"></label>
      <label>Why do you want this job?<input name="motivation"></label>
    `
    let onMessage
    runInNewContext(contentScript, {
      chrome: { runtime: { onMessage: { addListener: (listener) => { onMessage = listener } } } },
      document,
      Event,
      Uint8Array,
      atob,
    })

    let response
    onMessage({
      type: 'FILL_GREENHOUSE_APPLICATION',
      profile: { firstName: 'Remis', lastName: 'Haroon', email: 'remisharoon@gmail.com' },
    }, {}, (value) => { response = value })

    expect(document.querySelector('[name="first_name"]').value).toBe('Remis')
    expect(document.querySelector('[name="last_name"]').value).toBe('Existing')
    expect(document.querySelector('[name="email"]').value).toBe('remisharoon@gmail.com')
    expect(document.querySelector('[name="motivation"]').value).toBe('')
    expect(response.filled).toBe(2)
  })

  it('does not submit while a required field is invalid', () => {
    document.body.innerHTML = `
      <form>
        <label>First Name<input name="first_name"></label>
        <label>Email<input name="email" type="email"></label>
        <label>Work authorization<input name="authorization" required></label>
        <button type="submit">Submit Application</button>
      </form>
    `
    const submit = document.querySelector('button')
    submit.click = vi.fn()
    let onMessage
    runInNewContext(contentScript, {
      chrome: { runtime: { onMessage: { addListener: (listener) => { onMessage = listener } } } },
      document,
      Event,
      Uint8Array,
      atob,
      window,
    })

    let response
    onMessage({
      type: 'FILL_GREENHOUSE_APPLICATION',
      profile: { firstName: 'Remis', email: 'remisharoon@gmail.com' },
      submit: true,
    }, {}, (value) => { response = value })

    expect(response.blocked).toBe(true)
    expect(response.reason).toMatch(/required or invalid field/i)
    expect(submit.click).not.toHaveBeenCalled()
  })

  it('clicks the identified submit button only when explicitly requested and valid', () => {
    document.body.innerHTML = `
      <form>
        <label>First Name<input name="first_name" required></label>
        <label>Email<input name="email" type="email" required></label>
        <button type="submit">Submit Application</button>
      </form>
    `
    const submit = document.querySelector('button')
    submit.click = vi.fn()
    let onMessage
    runInNewContext(contentScript, {
      chrome: { runtime: { onMessage: { addListener: (listener) => { onMessage = listener } } } },
      document,
      Event,
      Uint8Array,
      atob,
      window,
    })

    let response
    onMessage({
      type: 'FILL_GREENHOUSE_APPLICATION',
      profile: { firstName: 'Remis', email: 'remisharoon@gmail.com' },
      submit: true,
    }, {}, (value) => { response = value })

    expect(submit.click).toHaveBeenCalledOnce()
    expect(response.submitted).toBe(true)
  })
})
