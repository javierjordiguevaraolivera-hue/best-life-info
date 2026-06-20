import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ageRejectedCookieName = 'bf_age_rejected_iul_v6'

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname === '/iul-v6' &&
    request.cookies.get(ageRejectedCookieName)?.value === 'true'
  ) {
    return NextResponse.redirect(new URL('/iul-v6/rechazo', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/iul-v6'],
}
