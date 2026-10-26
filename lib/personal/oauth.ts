import { trustedPublicOrigin, publicCookieSecure } from '@/lib/calendar/public-origin';
import { NextRequest, NextResponse } from 'next/server';
import { FLOW_COOKIE, cookieOptions } from '@/lib/calendar/google-oauth';
import { connectionId, personalConfig, removeRecord, saveRecord, serialized, validId, PERSONAL_COOKIE } from './store';
import { newRecord, readCalendars } from './service';
export async function finishPersonalOAuth(request:NextRequest,token:{access_token:unknown;expires_in:unknown;refresh_token?:unknown},previous?:string){
 const origin=trustedPublicOrigin(request);if(!origin)return new NextResponse('Invalid host',{status:403});
 const config=personalConfig();const result=(error?:string)=>{const r=NextResponse.redirect(new URL(error?`/personal?error=${error}`:'/personal?connected=1',origin));r.cookies.set(FLOW_COOKIE,'',{...cookieOptions(publicCookieSecure(request)),maxAge:0});r.headers.set('Cache-Control','no-store');return r;};
 if(!config||config.test||typeof token.refresh_token!=='string'||!token.refresh_token)return result('offline-permission');
 if(typeof token.access_token!=='string'||typeof token.expires_in!=='number')return result('authorization');
 let createdId:string|undefined;
 try{const id=connectionId(),record=newRecord(token.access_token,token.refresh_token,Date.now()+token.expires_in*1000);await readCalendars(record,config);record.selected=record.calendars.find(c=>c.primary)?[record.calendars.find(c=>c.primary)!.id]:[];await saveRecord(id,record,config);createdId=id;if(validId(previous))await serialized(previous,config,()=>removeRecord(previous,config));
 const response=result();response.cookies.set(PERSONAL_COOKIE,id,{httpOnly:true,sameSite:'lax',secure:publicCookieSecure(request),path:'/api/personal',maxAge:30*24*60*60});return response;
 }catch{if(createdId)await serialized(createdId,config,()=>removeRecord(createdId!,config)).catch(()=>undefined);return result('connection');}
}
