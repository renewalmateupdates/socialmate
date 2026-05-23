// SocialMate — Save to Drafts
// background.js — Manifest V3 service worker

chrome.runtime.onInstalled.addListener((details) => {
  console.log('SocialMate extension installed', details.reason)
})
