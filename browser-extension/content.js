// SocialMate — Save to Drafts
// content.js — injected into every page, responds to popup messages

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'getPageInfo') {
    sendResponse({
      selectedText: window.getSelection().toString(),
      pageTitle:    document.title,
      pageUrl:      window.location.href,
    })
  }
  // Must return true if you want to send response asynchronously,
  // but here we respond synchronously so no need.
})
