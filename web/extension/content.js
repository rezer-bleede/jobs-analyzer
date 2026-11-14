const profileFields = [
  ['email', /e[- ]?mail|email_address/i],
  ['phone', /phone|mobile|telephone/i],
  ['firstName', /first[_ -]?name|given[_ -]?name|\bfname\b/i],
  ['lastName', /last[_ -]?name|family[_ -]?name|surname|\blname\b/i],
  ['linkedin', /linkedin|linked[_ -]?in/i],
  ['github', /github/i],
  ['website', /portfolio|personal[_ -]?(site|website)|website/i],
  ['location', /current[_ -]?location|city|location/i],
]

const fieldLabel = (field) => [
  field.getAttribute('aria-label'),
  field.getAttribute('placeholder'),
  field.getAttribute('name'),
  field.id,
  ...(field.labels ? Array.from(field.labels, (label) => label.textContent) : []),
].filter(Boolean).join(' ').toLowerCase()

const setFieldValue = (field, value) => {
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), 'value')?.set
  if (setter) setter.call(field, value)
  else field.value = value
  field.dispatchEvent(new Event('input', { bubbles: true }))
  field.dispatchEvent(new Event('change', { bubbles: true }))
}

const attachResume = (resume) => {
  if (!resume?.dataUrl) return { attached: false, message: '' }
  const input = Array.from(document.querySelectorAll('input[type="file"]')).find((field) => {
    const label = `${fieldLabel(field)} ${field.closest('label')?.textContent ?? ''} ${field.parentElement?.textContent ?? ''}`
    return /resume|curriculum vitae|\bcv\b/i.test(label)
  })
  if (!input) return { attached: false, message: 'Resume field not detected; attach the PDF manually.' }
  if (input.files?.length) return { attached: false, message: 'Existing resume left unchanged.' }

  try {
    const base64 = resume.dataUrl.split(',')[1]
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
    const file = new File([bytes], resume.name, { type: 'application/pdf' })
    const transfer = new DataTransfer()
    transfer.items.add(file)
    input.files = transfer.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
    return { attached: true, message: '' }
  } catch {
    return { attached: false, message: 'Could not attach the PDF automatically; select it manually.' }
  }
}

const applicationForm = () => {
  const scores = new Map()
  for (const field of document.querySelectorAll('input, textarea')) {
    if (profileFields.some(([, pattern]) => pattern.test(fieldLabel(field))) && field.form) {
      scores.set(field.form, (scores.get(field.form) ?? 0) + 1)
    }
  }
  return [...scores].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

const isVisible = (element) => {
  if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

const visibleCaptcha = () => {
  const captcha = document.querySelector('.g-recaptcha, .h-captcha, iframe[src*="recaptcha/api2/bframe"], iframe[src*="hcaptcha.com/captcha"]')
  return Boolean(captcha && isVisible(captcha))
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'FILL_GREENHOUSE_APPLICATION') return

  let filled = 0
  for (const field of document.querySelectorAll('input, textarea')) {
    if (field.disabled || field.readOnly || field.hidden || field.getAttribute('aria-hidden') === 'true') continue
    const type = (field.getAttribute('type') ?? 'text').toLowerCase()
    if (!['text', 'email', 'tel', 'url', 'search'].includes(type)) continue
    const label = fieldLabel(field)
    const match = profileFields.find(([, pattern]) => pattern.test(label))
    if (!match) continue
    const [key] = match
    const value = message.profile?.[key]?.trim()
    if (!value || (!message.overwrite && field.value.trim())) continue
    setFieldValue(field, value)
    filled += 1
  }

  const resume = attachResume(message.resume)
  const result = { filled, resumeAttached: resume.attached, resumeMessage: resume.message, submitted: false }
  if (!message.submit) {
    sendResponse(result)
    return
  }

  const form = applicationForm()
  if (!form) {
    result.blocked = true
    result.reason = 'Could not identify the application form.'
  } else if (visibleCaptcha()) {
    result.blocked = true
    result.reason = 'Complete the CAPTCHA manually first.'
  } else {
    const invalid = Array.from(form.querySelectorAll('input, select, textarea')).find((field) => !field.disabled && !field.checkValidity())
    if (invalid) {
      invalid.focus()
      invalid.scrollIntoView?.({ block: 'center' })
      result.blocked = true
      result.reason = `A required or invalid field needs your attention${fieldLabel(invalid) ? `: ${fieldLabel(invalid)}` : ''}.`
    } else {
      const submitter = Array.from(form.querySelectorAll('button[type="submit"], input[type="submit"], button:not([type])'))
        .find((button) => isVisible(button) && /^(submit|submit application|send application)$/i.test((button.value || button.textContent || '').trim()))
      if (!submitter || submitter.disabled) {
        result.blocked = true
        result.reason = 'Could not identify an enabled Submit Application button.'
      } else {
        submitter.click()
        result.submitted = true
      }
    }
  }
  sendResponse(result)
})
