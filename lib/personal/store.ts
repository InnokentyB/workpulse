import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getGoogleConfig, seal, unseal } from '@/lib/calendar/google-oauth';
import type { PersonalRecord } from './types';
export const PERSONAL_COOKIE='workpulse_personal';
export class PersonalError extends Error { constructor(public status:number,message:string){super(message);} }
export type PersonalConfig={secret:string;directory:string;test:boolean;google:ReturnType<typeof getGoogleConfig>};
export function personalConfig():PersonalConfig|null{
 const directory=process.env.WORKPULSE_PERSONAL_DATA_DIR||'/data/workpulse-personal';
 if(process.env.WORKPULSE_PERSONAL_TEST==='1'){
  if(process.env.GOOGLE_CALENDAR_CLIENT_ID||process.env.GOOGLE_CALENDAR_CLIENT_SECRET||!/(?:^|[/_-])(?:test|fixture)(?:[/_.-]|$)/i.test(directory)||!process.env.WORKPULSE_PERSONAL_TEST_SECRET||process.env.WORKPULSE_PERSONAL_TEST_SECRET.length<32)throw new PersonalError(503,'Unsafe fixture configuration.');
  return {secret:process.env.WORKPULSE_PERSONAL_TEST_SECRET,directory,test:true,google:null};
 }
 const google=getGoogleConfig();if(!google)return null;
 return {secret:google.sessionSecret,directory,test:false,google};
}
export const connectionId=()=>randomBytes(32).toString('base64url');
export function validId(id:string|undefined):id is string{return !!id&&/^[A-Za-z0-9_-]{43}$/.test(id);}
const location=(id:string,c:PersonalConfig)=>join(c.directory,createHash('sha256').update(id).digest('hex')+'.enc');
export async function readRecord(id:string,c:PersonalConfig):Promise<PersonalRecord|null>{
 try{const raw=await readFile(location(id,c),'utf8');const record=unseal<PersonalRecord>(raw,c.secret);if(!record||(record.version!==1&&record.version!==2)||typeof record.accessToken!=='string'||typeof record.refreshToken!=='string'||!Number.isFinite(record.expiresAt)||!Array.isArray(record.selected)||!Array.isArray(record.calendars)||!Array.isArray(record.history))throw new PersonalError(503,'Connection store is unreadable.');return record;}
 catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;if(e instanceof PersonalError)throw e;throw new PersonalError(503,'Connection store is unavailable.');}
}
export async function saveRecord(id:string,record:PersonalRecord,c:PersonalConfig){
 let temporary:string|undefined;
 try{await mkdir(c.directory,{recursive:true,mode:0o700});temporary=location(id,c)+'.'+randomBytes(6).toString('hex')+'.tmp';await writeFile(temporary,seal(record,c.secret),{mode:0o600,flag:'wx'});await rename(temporary,location(id,c));}
 catch{if(temporary)await unlink(temporary).catch(()=>undefined);throw new PersonalError(503,'Could not save connection.');}
}
export async function removeRecord(id:string,c:PersonalConfig){try{await unlink(location(id,c));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw new PersonalError(503,'Could not remove connection.');}}
// One Node writer; serialize the complete read/provider/mutate/save transaction.
const queues=new Map<string,Promise<unknown>>();
export async function serialized<T>(id:string,c:PersonalConfig,operation:()=>Promise<T>):Promise<T>{const key=c.directory+'/'+id;const previous=queues.get(key)??Promise.resolve();const running=previous.catch(()=>undefined).then(operation);queues.set(key,running);try{return await running;}finally{if(queues.get(key)===running)queues.delete(key);}}
