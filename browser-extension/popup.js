// SocialMate — Save to Drafts
// popup.js — handles popup UI logic

const API_BASE = 'https://socialmate.studio'

// ── DOM refs ─────────────────────────────────────────────────────────────────
const contentEl  = document.getElementById('content')
const sourceEl   = document.getElementById('sourceUrl')
const charEl     = document.getElementById('charCount')
const saveBtn    = document.getElementById('saveBtn')
const statusEl   = document.getElementById('status')

// ── Platform checkbox styling ─────────────────────────────────────────────────
function updatePlatformItemStyle(item) {
  const checkbox = item.querySelector('input[type="checkbox"]')
  if (checkbox.checked) {
    item.classList.add('checked')
  } else {
    item.classList.remove('checked')
  }
}

document.querySelectorAll('.platform-item').forEach(item => {
  const checkbox = item.querySelector('input[type="checkbox"]')

  // Toggle on row click (not just checkbox click)
  item.addEventListener('click', (e) => {
    // Prevent double-toggle when clicking directly on checkbox
    if (e.target === checkbox) return
    checkbox.checked = !checkbox.checked
    updatePlatformItemStyle(item)
  })

  checkbox.addEventListener('change', () => {
    updatePlatformItemStyle(item)
  })
})

// ── Char counter ──────────────────────────────────────────────────────────────
contentEl.addEventListener('input', () => {
  charEl.textContent = contentEl.value.length
})

// ── Load page info from content script ───────────────────────────────────────
async function loadPageInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) {
      sourceEl.textContent = 'No active tab'
      return
    }

    // Show tab URL immediately
    const rawUrl = tab.url || ''
    sourceEl.textContent = rawUrl
    sourceEl.title = rawUrl

    // Try to get selected text from content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' })
      if (response) {
        const { selectedText, pageTitle, pageUrl } = response

        // Show the actual page URL
        const displayUrl = pageUrl || rawUrl
        sourceEl.textContent = displayUrl
        sourceEl.title = displayUrl

        // Pre-fill with selected text or page title
        const prefill = selectedText?.trim() || pageTitle?.trim() || ''
        if (prefill) {
          contentEl.value = prefill
          charEl.textContent = prefill.length
        }

        // Store URL for the API call
        saveBtn.dataset.sourceUrl = displayUrl
      }
    } catch (msgErr) {
      // Content script may not be injected on chrome:// pages etc.
      // Fall back to just using the tab URL
      saveBtn.dataset.sourceUrl = rawUrl
      console.warn('[SocialMate] Could not reach content script:', msgErr)
    }
  } catch (err) {
    sourceEl.textContent = 'Could not read page info'
    console.error('[SocialMate] loadPageInfo error:', err)
  }
}

loadPageInfo()

// ── Status helpers ────────────────────────────────────────────────────────────
function showSuccess(msg) {
  statusEl.className = 'success'
  statusEl.textContent = msg
}

function showError(msg) {
  statusEl.className = 'error'
  statusEl.textContent = msg
}

function clearStatus() {
  statusEl.className = ''
  statusEl.textContent = ''
}

// ── Save to Drafts ────────────────────────────────────────────────────────────
saveBtn.addEventListener('click', async () => {
  clearStatus()

  const content = contentEl.value.trim()
  if (!content) {
    showError('Please add some content first.')
    return
  }

  // Collect selected platforms
  const platforms = []
  document.querySelectorAll('input[name="platforms"]:checked').forEach(cb => {
    platforms.push(cb.value)
  })

  if (platforms.length === 0) {
    showError('Select at least one platform.')
    return
  }

  const sourceUrl = saveBtn.dataset.sourceUrl || ''

  saveBtn.disabled = true
  saveBtn.textContent = 'Saving...'

  try {
    const res = await fetch(`${API_BASE}/api/posts/create-draft`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        sourceUrl: sourceUrl || undefined,
        platforms,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      if (res.status === 401) {
        showError('Sign in to SocialMate first — then try again.')
      } else {
        showError(data?.error || `Error ${res.status}. Please try again.`)
      }
      return
    }

    showSuccess('✓ Saved to drafts! Open SocialMate to schedule it.')
    saveBtn.textContent = '✓ Saved'
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      showError('Could not reach SocialMate. Check your connection.')
    } else {
      showError('Something went wrong. Please try again.')
    }
    console.error('[SocialMate] Save error:', err)
  } finally {
    if (saveBtn.textContent !== '✓ Saved') {
      saveBtn.disabled = false
      saveBtn.textContent = 'Save to Drafts'
    }
  }
})
