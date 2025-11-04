import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  
  // Redirect www to non-www with 301 permanent redirect
  if (host?.startsWith('www.')) {
    const newHost = host.replace('www.', '');
    const newUrl = new URL(request.url);
    newUrl.host = newHost;
    
    return NextResponse.redirect(newUrl, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
