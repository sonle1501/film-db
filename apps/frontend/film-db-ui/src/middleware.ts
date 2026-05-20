import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add auth protection logic here
  // const token = request.cookies.get('token')
  // if (!token && request.nextUrl.pathname.startsWith('/profile')) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/profile/:path*', '/lists/:path*'],
}
