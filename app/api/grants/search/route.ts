import { NextRequest, NextResponse } from 'next/server'

const GRANTS_API = 'https://api.grants.gov/v1/api/search2'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const payload: Record<string, unknown> = {
      rows: 25,
      oppStatuses: 'posted',
    }

    if (body.keyword && typeof body.keyword === 'string' && body.keyword.trim()) {
      payload.keyword = body.keyword.trim()
    }
    if (body.eligibility && typeof body.eligibility === 'string') {
      payload.eligibilities = body.eligibility
    }
    if (body.fundingCategory && typeof body.fundingCategory === 'string') {
      payload.fundingCategories = body.fundingCategory
    }
    if (typeof body.startRecordNum === 'number') {
      payload.startRecordNum = body.startRecordNum
    }

    const res = await fetch(GRANTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'grants.gov API error' }, { status: 502 })
    }

    const json = await res.json()
    const data = json?.data ?? {}

    return NextResponse.json({
      hitCount: data.hitCount ?? 0,
      startRecord: data.startRecord ?? 0,
      hits: (data.oppHits ?? []).map((hit: Record<string, unknown>) => ({
        id: hit.id,
        number: hit.number,
        title: hit.title,
        agency: hit.agency,
        agencyCode: hit.agencyCode,
        openDate: hit.openDate,
        closeDate: hit.closeDate,
        oppStatus: hit.oppStatus,
        docType: hit.docType,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to search grants' }, { status: 500 })
  }
}
