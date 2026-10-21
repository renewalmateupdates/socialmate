/**
 * Which product in the Gilgamesh Enterprise shop each free guide points at.
 * The guides are where the people who'd buy these are already reading, and
 * the shop has no other way in yet.
 *
 * Names and prices mirror the live listings at shop.gilgameshenterprise.com.
 * Shopify is the source of truth: change a price there first, then here.
 *
 * Links carry UTM tags so Shopify's own reports attribute each sale to the
 * guide it came from. Most guide readers are signed out, so the click event
 * only reaches GA4, never /admin/funnel.
 *
 * Pure, no imports.
 */

export interface ShopProduct {
  key: string
  name: string
  price: string
  pitch: string
  handle: string
  /** Cover thumbnail in /public/shop. */
  image: string
}

export interface GuideShopPick {
  product: ShopProduct
  /** Why this product fits this guide, in one line. */
  note: string
  /** Also point at the Complete Edition, unless it is already the pick. */
  bundle: ShopProduct | null
}

const SHOP = 'https://shop.gilgameshenterprise.com'

export const PRODUCTS = {
  complete: {
    key: 'complete',
    name: "Gilgamesh's Guides: The Complete Edition",
    price: '$19',
    pitch: 'All 14 guides in one 192-page PDF, corrected for late 2026, plus 10 printable worksheets.',
    handle: 'gilgameshs-guides-the-complete-edition',
    image: '/shop/complete-edition.webp',
  },
  worksheets: {
    key: 'worksheets',
    name: 'The Gilgamesh Worksheet Pack',
    price: '$7',
    pitch: 'Ten printable worksheets that turn these guides into a plan you fill in by hand.',
    handle: 'the-gilgamesh-worksheet-pack',
    image: '/shop/worksheet-pack.webp',
  },
  planner: {
    key: 'planner',
    name: 'The 2027 Creator Content Planner',
    price: '$9',
    pitch: 'Monthly calendars with 26 posting dates already marked, plus post plans, quarterly goals and reviews.',
    handle: 'the-2027-creator-content-planner',
    image: '/shop/creator-planner-2027.webp',
  },
  aiKit: {
    key: 'ai-kit',
    name: 'The Solo Founder AI Build Kit',
    price: '$19',
    pitch: 'The instructions file template, 56 prompts and 12 rules behind a live product built with an AI assistant.',
    handle: 'the-solo-founder-ai-build-kit',
    image: '/shop/ai-build-kit.webp',
  },
  websiteKit: {
    key: 'website-kit',
    name: 'The Local Business Website Kit',
    price: '$29',
    pitch: 'A client intake form, a pricing worksheet with real ranges, outreach scripts and a handoff checklist.',
    handle: 'the-local-business-website-kit',
    image: '/shop/website-kit.webp',
  },
} satisfies Record<string, ShopProduct>

const ALL_GUIDES = 'This guide and the other 13, offline in one PDF, with 10 printable worksheets.'

/** Keyed by the guide's folder under app/guides. */
const PICKS: Record<string, { product: ShopProduct; note: string }> = {
  'starting-a-business': { product: PRODUCTS.worksheets, note: 'Includes the Idea Validation Scorecard and Business Launch Checklist for this guide.' },
  'marketing-zero-budget': { product: PRODUCTS.worksheets, note: 'Includes the Zero-Budget Marketing Plan worksheet for this guide.' },
  'business-credit-legal': { product: PRODUCTS.worksheets, note: 'Includes the Business Launch Checklist and Business Credit Tracker for this guide.' },
  'vibe-coding-with-ai': { product: PRODUCTS.aiKit, note: 'The working system behind this guide, as templates you can use on your own project.' },
  'creator-monetization': { product: PRODUCTS.worksheets, note: 'Includes the Monetization Stack Planner for this guide.' },
  'first-30-days-social-media': { product: PRODUCTS.planner, note: 'Plan every month of 2027 with the big posting dates already marked.' },
  'build-your-brand-from-zero': { product: PRODUCTS.worksheets, note: 'Includes the Brand Foundation Worksheet for this guide.' },
  'side-hustle-to-full-time-creator': { product: PRODUCTS.worksheets, note: 'Includes the Runway and Leap Calculator for this guide.' },
  'content-creator-business': { product: PRODUCTS.planner, note: 'Run your content like a business: monthly plans, quarterly goals and reviews for 2027.' },
  'ai-tools-for-creators-2026': { product: PRODUCTS.complete, note: ALL_GUIDES },
  'local-business-website': { product: PRODUCTS.websiteKit, note: 'The forms, pricing worksheet and scripts that go with this guide.' },
  'email-list-building': { product: PRODUCTS.worksheets, note: 'Includes the Email List Launch Checklist for this guide.' },
  'seo-for-beginners': { product: PRODUCTS.worksheets, note: 'Includes the Local SEO and Google Business Profile Checklist for this guide.' },
  'reddit-marketing': { product: PRODUCTS.complete, note: ALL_GUIDES },
}

export function shopPickFor(guide: string): GuideShopPick | null {
  const pick = PICKS[guide]
  if (!pick) return null
  return { ...pick, bundle: pick.product === PRODUCTS.complete ? null : PRODUCTS.complete }
}

export function shopUrl(product: ShopProduct, guide: string): string {
  const q = new URLSearchParams({ utm_source: 'socialmate', utm_medium: 'guide', utm_campaign: guide })
  return `${SHOP}/products/${product.handle}?${q}`
}
