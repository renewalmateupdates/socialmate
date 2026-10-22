// When a Studio Stax listing is public, in one place.
//
//   'active' / 'live'  paid and confirmed. The Stripe webhook writes the literal
//                      'live' on a completed checkout.
//   'approved'         public only when no checkout is pending: a free-year
//                      listing or a founder (Garrison) listing. "Send payment
//                      link" also sets 'approved', along with a checkout_token
//                      that the webhook clears on payment, so an applicant who
//                      was sent a link and never paid used to appear in the
//                      directory anyway.
//   'expired'          the paid year ran out (app/api/cron/studio-stax-renewals).
//
// Callers select status and checkout_token, query with
// .in('status', LISTING_QUERY_STATUSES), then filter with isPublicListing.

export const LISTING_QUERY_STATUSES = ['approved', 'active', 'live'] as const

export function isPublicListing(listing: { status: string | null; checkout_token?: string | null }): boolean {
  if (listing.status === 'active' || listing.status === 'live') return true
  return listing.status === 'approved' && !listing.checkout_token
}
