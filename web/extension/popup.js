const fields = ['firstName', 'lastName', 'email', 'phone', 'linkedin', 'github', 'website', 'location']
const emptyProfile = Object.fromEntries(fields.map((field) => [field, '']))
const supportedHosts = new Set([
  'boards.greenhouse.io',
  'job-boards.greenhouse.io',
  'boards.eu.greenhouse.io',
  'job-boards.eu.greenhouse.io',
])
const form = document.querySelector('#profile-form')
const status = document.querySelector('#status')
const resumeInput = document.querySelector('#resume')
const resumeName = document.querySelector('#resume-name')
const profileImport = document.querySelector('#profile-import')
const fillButton = document.querySelector('#fill')
const submitButton = document.querySelector('#submit')
const submitConfirmation = document.querySelector('#submit-confirmation')
let savedResume = null

const cleanProfile = (value) => Object.fromEntries(fields.map((field) => [
  field,
  typeof value?.[field] === 'string' ? value[field].trim().slice(0, 500) : '',
]))

const readForm = () => cleanProfile(Object.fromEntries(new FormData(form)))

const showStatus = (message) => {
  status.textContent = message
}

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('Could not read the PDF.'))
  reader.readAsDataURL(file)
})

const activeGreenhouseTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id || !tab.url) return null
  try {
    return supportedHosts.has(new URL(tab.url).hostname) ? tab : null
  } catch {
    return null
  }
}

const setForm = (profile) => {
  for (const field of fields) form.elements.namedItem(field).value = profile[field] ?? ''
}

const saveProfile = async () => {
  const file = resumeInput.files[0]
  if (file && (!file.name.toLowerCase().endsWith('.pdf') || file.size > 5 * 1024 * 1024)) {
    showStatus('Choose a PDF under 5 MB.')
    return false
  }

  const update = { profile: readForm() }
  if (file) {
    update.resume = { name: file.name, dataUrl: await fileToDataUrl(file) }
  }
  await chrome.storage.local.set(update)
  if (update.resume) savedResume = update.resume
  resumeInput.value = ''
  resumeName.textContent = savedResume ? `Saved: ${savedResume.name}` : 'No resume saved'
  return true
}

const initialise = async () => {
  const stored = await chrome.storage.local.get(['profile', 'resume'])
  savedResume = stored.resume ?? null
  setForm(cleanProfile(stored.profile ?? emptyProfile))
  resumeName.textContent = savedResume ? `Saved: ${savedResume.name}` : 'No resume saved'
  fillButton.disabled = submitButton.disabled = !(await activeGreenhouseTab())
}

document.querySelector('#save').addEventListener('click', async () => {
  try {
    if (await saveProfile()) showStatus('Profile saved on this browser.')
  } catch (error) {
    showStatus(error instanceof Error ? error.message : 'Could not save profile.')
  }
})

const runAutofill = async (submit) => {
  try {
    const tab = await activeGreenhouseTab()
    if (!tab?.id) {
      showStatus('Open a supported Greenhouse application first.')
      return
    }
    if (!(await saveProfile())) return
    const { profile, resume } = await chrome.storage.local.get(['profile', 'resume'])
    let result
    try {
      result = await chrome.tabs.sendMessage(tab.id, {
        type: 'FILL_GREENHOUSE_APPLICATION',
        profile,
        resume,
        overwrite: document.querySelector('#overwrite').checked,
        submit,
      })
    } catch (error) {
      if (submit) {
        showStatus('Submission may have been sent. Check Greenhouse for its confirmation before retrying.')
        return
      }
      throw error
    }
    const resumeStatus = result.resumeAttached ? ' Resume attached.' : result.resumeMessage ? ` ${result.resumeMessage}` : ''
    if (result.submitted) {
      showStatus(`Submit action sent. ${result.filled} field(s) filled.${resumeStatus} Check Greenhouse for its confirmation before retrying.`)
    } else if (submit && result.blocked) {
      showStatus(`Not submitted: ${result.reason} ${result.filled} field(s) filled.${resumeStatus}`)
    } else {
      showStatus(`${result.filled} field(s) filled.${resumeStatus} Review everything before submitting.`)
    }
  } catch (error) {
    showStatus(error instanceof Error ? error.message : 'Could not fill this page. Refresh it and try again.')
  }
}

fillButton.addEventListener('click', () => void runAutofill(false))
submitButton.addEventListener('click', async () => {
  const tab = await activeGreenhouseTab()
  if (!tab?.url) {
    showStatus('Open a supported Greenhouse application first.')
    return
  }
  const hostname = new URL(tab.url).hostname
  document.querySelector('#submit-target').textContent = `Submit ${tab.title || 'this application'} (${hostname}) now?`
  submitConfirmation.hidden = false
})
document.querySelector('#confirm-submit').addEventListener('click', () => {
  submitConfirmation.hidden = true
  void runAutofill(true)
})
document.querySelector('#cancel-submit').addEventListener('click', () => {
  submitConfirmation.hidden = true
  showStatus('Submission cancelled.')
})

document.querySelector('#clear').addEventListener('click', async () => {
  if (!confirm('Delete the saved profile and resume from this browser?')) return
  await chrome.storage.local.clear()
  savedResume = null
  setForm(emptyProfile)
  resumeName.textContent = 'No resume saved'
  showStatus('Saved profile and resume deleted.')
})

profileImport.addEventListener('change', async () => {
  const file = profileImport.files[0]
  if (!file) return
  try {
    setForm(cleanProfile(JSON.parse(await file.text())))
    showStatus('Profile loaded. Save it to keep it in this browser.')
  } catch {
    showStatus('Could not read that profile JSON.')
  }
  profileImport.value = ''
})

void initialise().catch((error) => showStatus(error instanceof Error ? error.message : 'Could not load profile.'))
