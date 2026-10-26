import { trustedPublicOrigin, publicCookieSecure } from '@/lib/calendar/public-origin';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeUrl, cookieOptions, FLOW_COOKIE, randomUrlToken, seal } from '@/lib/calendar/google-oauth';
import { PERSONAL_COOKIE, validId, personalConfig } from '@/lib/personal/store';
export async function GET(request:NextRequest){
 const origin=trustedPublicOrigin(request);if(!origin)return new Response('Invalid host',{status:403});
 let config;try{config=personalConfig()?.google;}catch{return NextResponse.json({error:'Unsafe personal configuration.'},{status:503});}if(!config)return NextResponse.redirect(new URL('/personal?error=configuration',origin));
 if(new URL(config.redirectUri).origin!==origin)return new Response('OAuth origin mismatch',{status:400});
 const state=randomUrlToken(),verifier=randomUrlToken(),url=new URL(authorizeUrl(config,state,verifier));url.searchParams.set('access_type','offline');url.searchParams.set('prompt','consent');
 const old=request.cookies.get(PERSONAL_COOKIE)?.value;
 const response=NextResponse.redirect(url);response.headers.set('Cache-Control','no-store');response.cookies.set(FLOW_COOKIE,seal({state,verifier,expiresAt:Date.now()+600000,purpose:'personal',...(validId(old)?{previousConnection:old}:{})},config.sessionSecret),{...cookieOptions(publicCookieSecure(request)),maxAge:600});return response;
}
