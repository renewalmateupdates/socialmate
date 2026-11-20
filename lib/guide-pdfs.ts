/**
 * The free PDF editions of the guides, and the kits that go with them
 * (Nov 20, 2026).
 *
 * Until Nov 20 these were sold in the Gilgamesh shop on Shopify, $7 to $49.
 * Joshua's call: the guides are free on this site, so charging for the same
 * guides there isn't right. The shop is merch only now, and the PDFs download
 * from public/downloads, free, with no sign-up and no email.
 *
 * Each guide page ends with the PDF that fits it (components/GuidePdfCard.tsx);
 * /guides lists all of them. scripts/test-guide-pdfs.mjs fails when a file is
 * missing, a size label no longer matches its file, or a guide page has no pick.
 *
 * Pure, no imports.
 */

export interface GuidePdf {
  key: string
  name: string
  pitch: string
  /** Path under /public. */
  file: string
  /** On the button, so someone on a phone knows what they are about to download. */
  size: string
  /** Cover thumbnail in /public/shop, 320x415. */
  image: string
}

export interface GuidePdfPick {
  pdf: GuidePdf
  /** Why this PDF fits this guide, in one line. */
  note: string
  /** Also offer the Complete Edition, unless it is already the pick. */
  bundle: GuidePdf | null
}

export const PDFS = {
  complete: {
    key: 'complete',
    name: "Gilgamesh's Guides: The Complete Edition",
    pitch: 'All 14 guides in one 192-page PDF, corrected for late 2026, plus 10 printable worksheets.',
    file: '/downloads/gilgameshs-guides-complete-edition.pdf',
    size: '3.1 MB',
    image: '/shop/complete-edition.webp',
  },
  worksheets: {
    key: 'worksheets',
    name: 'The Gilgamesh Worksheet Pack',
    pitch: 'Ten printable worksheets that turn these guides into a plan you fill in by hand.',
    file: '/downloads/gilgamesh-worksheet-pack.pdf',
    size: '0.7 MB',
    image: '/shop/worksheet-pack.webp',
  },
  planner: {
    key: 'planner',
    name: 'The 2027 Creator Content Planner',
    pitch: 'Monthly calendars with 26 posting dates already marked, plus post plans, quarterly goals and reviews.',
    file: '/downloads/2027-creator-content-planner.pdf',
    size: '1.5 MB',
    image: '/shop/creator-planner-2027.webp',
  },
  aiKit: {
    key: 'ai-kit',
    name: 'The Solo Founder AI Build Kit',
    pitch: 'The instructions file template, 56 prompts and 12 rules behind a live product built with an AI assistant.',
    file: '/downloads/solo-founder-ai-build-kit.pdf',
    size: '1.2 MB',
    image: '/shop/ai-build-kit.webp',
  },
  websiteKit: {
    key: 'website-kit',
    name: 'The Local Business Website Kit',
    pitch: 'A client intake form, a pricing worksheet with real ranges, outreach scripts and a handoff checklist.',
    file: '/downloads/local-business-website-kit.pdf',
    size: '1.5 MB',
    image: '/shop/website-kit.webp',
  },
  streamKit: {
    key: 'stream-kit',
    name: 'The Stream Launch Kit',
    pitch: 'A go-live checklist, 38 post templates, a Discord server setup and 4 worksheets for growing a stream.',
    file: '/downloads/stream-launch-kit.pdf',
    size: '1.3 MB',
    image: '/shop/stream-launch-kit.webp',
  },
  clipKit: {
    key: 'clip-kit',
    name: 'The Clipping Starter Kit',
    pitch: "How paid clipping works and what you're allowed to clip, with 40 hooks, 10 caption templates and 3 worksheets.",
    file: '/downloads/clipping-starter-kit.pdf',
    size: '1.1 MB',
    image: '/shop/clipping-starter-kit.webp',
  },
} satisfies Record<string, GuidePdf>

/** Every PDF, the Complete Edition first. */
export const ALL_PDFS: GuidePdf[] = Object.values(PDFS)

const ALL_GUIDES = 'This guide and the other 13 in one PDF, with 10 printable worksheets.'

/** Keyed by the guide's folder under app/guides. */
const PICKS: Record<string, { pdf: GuidePdf; note: string }> = {
  'starting-a-business': { pdf: PDFS.worksheets, note: 'Includes the Idea Validation Scorecard and Business Launch Checklist for this guide.' },
  'marketing-zero-budget': { pdf: PDFS.worksheets, note: 'Includes the Zero-Budget Marketing Plan worksheet for this guide.' },
  'business-credit-legal': { pdf: PDFS.worksheets, note: 'Includes the Business Launch Checklist and Business Credit Tracker for this guide.' },
  'vibe-coding-with-ai': { pdf: PDFS.aiKit, note: 'The working system behind this guide, as templates you can use on your own project.' },
  'creator-monetization': { pdf: PDFS.worksheets, note: 'Includes the Monetization Stack Planner for this guide.' },
  'first-30-days-social-media': { pdf: PDFS.planner, note: 'Plan every month of 2027 with the big posting dates already marked.' },
  'build-your-brand-from-zero': { pdf: PDFS.worksheets, note: 'Includes the Brand Foundation Worksheet for this guide.' },
  'side-hustle-to-full-time-creator': { pdf: PDFS.worksheets, note: 'Includes the Runway and Leap Calculator for this guide.' },
  'content-creator-business': { pdf: PDFS.planner, note: 'Run your content like a business: monthly plans, quarterly goals and reviews for 2027.' },
  'ai-tools-for-creators-2026': { pdf: PDFS.complete, note: ALL_GUIDES },
  'local-business-website': { pdf: PDFS.websiteKit, note: 'The forms, pricing worksheet and scripts that go with this guide.' },
  'email-list-building': { pdf: PDFS.worksheets, note: 'Includes the Email List Launch Checklist for this guide.' },
  'seo-for-beginners': { pdf: PDFS.worksheets, note: 'Includes the Local SEO and Google Business Profile Checklist for this guide.' },
  'reddit-marketing': { pdf: PDFS.complete, note: ALL_GUIDES },
}

export function pdfPickFor(guide: string): GuidePdfPick | null {
  const pick = PICKS[guide]
  if (!pick) return null
  return { ...pick, bundle: pick.pdf === PDFS.complete ? null : PDFS.complete }
}
