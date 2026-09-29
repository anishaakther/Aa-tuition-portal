import crypto from 'node:crypto'
import { verifyStudentSession } from '../server/student-session.js'

const MAX_FILE = 25 * 1024 * 1024
const ALLOWED = new Set([
  'application/pdf','image/jpeg','image/png','image/heic','image/heif',
  'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'
])
const jsonHeaders = (key, extra={}) => ({ apikey:key, 'Content-Type':'application/json', ...extra })
const restUrl = (base,path,params={}) => { const u=new URL(`/rest/v1/${path}`,base); Object.entries(params).forEach(([k,v])=>v!=null&&u.searchParams.set(k,String(v))); return u }
async function rows(base,key,table,params){const r=await fetch(restUrl(base,table,params),{headers:jsonHeaders(key)});if(!r.ok)throw new Error(`${table}:${r.status}:${await r.text()}`);return r.json()}
async function write(base,key,table,method,body,params={},prefer='return=representation'){const opts={method,headers:jsonHeaders(key,{Prefer:prefer})};if(body!==undefined)opts.body=JSON.stringify(body);const r=await fetch(restUrl(base,table,params),opts);if(!r.ok)throw new Error(`${table}:${r.status}:${await r.text()}`);if(prefer==='return=minimal'||r.status===204)return null;return r.json()}
const safeName = name => String(name||'file').replace(/[^a-zA-Z0-9._-]+/g,'-').slice(-100)
async function signedUpload(base,key,path){const encoded=path.split('/').map(encodeURIComponent).join('/');const r=await fetch(new URL(`/storage/v1/object/upload/sign/homework-files/${encoded}`,base),{method:'POST',headers:jsonHeaders(key),body:'{}'});if(!r.ok)throw new Error(`signed-upload:${r.status}:${await r.text()}`);const d=await r.json();const relative=d.url||d.signedURL||d.signedUrl;if(!relative)throw new Error('signed-upload-empty');const full=relative.startsWith('http')?relative:new URL(relative.startsWith('/storage/v1/')?relative:`/storage/v1${relative.startsWith('/')?'':'/'}${relative}`,base).toString();const token=new URL(full).searchParams.get('token');if(!token)throw new Error('signed-upload-token');return {path,token}}
async function deleteStoredFile(base,key,path){const encoded=String(path).split('/').map(encodeURIComponent).join('/');const r=await fetch(new URL(`/storage/v1/object/homework-files/${encoded}`,base),{method:'DELETE',headers:{apikey:key,Authorization:`Bearer ${key}`}});if(!r.ok&&r.status!==404)throw new Error(`storage-delete:${r.status}:${await r.text()}`)}
async function signedDownload(base,key,path){const encoded=String(path).split('/').map(encodeURIComponent).join('/');const r=await fetch(new URL(`/storage/v1/object/sign/homework-files/${encoded}`,base),{method:'POST',headers:jsonHeaders(key),body:JSON.stringify({expiresIn:900})});if(!r.ok)throw new Error(`signed-download:${r.status}:${await r.text()}`);const d=await r.json();const relative=d.signedURL||d.signedUrl;if(!relative)throw new Error('signed-download-empty');if(relative.startsWith('http'))return relative;if(relative.startsWith('/storage/v1/'))return new URL(relative,base).toString();if(relative.startsWith('/object/'))return new URL(`/storage/v1${relative}`,base).toString();return new URL(`/storage/v1/${relative.replace(/^\/+/, '')}`,base).toString()}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'})
  const base=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!base||!key)return res.status(500).json({error:'Student submissions are not configured yet.'})
  let body=req.body;if(typeof body==='string'){try{body=JSON.parse(body)}catch{body={}}}
  const session=verifyStudentSession(body?.token,key)
  if(!session)return res.status(401).json({error:'Your student portal session has expired. Please sign in again.'})
  try{
    const assignmentId=String(body?.assignmentId||'')
    const assignment=(await rows(base,key,'assignments',{select:'id,student_id,title',id:`eq.${assignmentId}`,student_id:`eq.${session.sid}`,limit:'1'}))[0]
    if(!assignment)return res.status(404).json({error:'That assignment was not found.'})
    const existing=(await rows(base,key,'assignment_submissions',{select:'id,status,submitted_at',assignment_id:`eq.${assignmentId}`,student_id:`eq.${session.sid}`,limit:'1'}))[0]

    if(body.action==='unsubmit'){
      if(!existing||existing.status!=='submitted')return res.status(409).json({error:'Only submitted homework can be unsubmitted.'})
      await write(base,key,'assignment_submissions','PATCH',{status:'draft',reviewed_at:null},{id:`eq.${existing.id}`},'return=minimal')
      return res.status(200).json({submission:{...existing,status:'draft'}})
    }

    if(body.action==='removeFile'){
      if(!existing||!['draft','resubmit'].includes(existing.status))return res.status(409).json({error:'Unsubmit the homework before removing files.'})
      const fileId=String(body?.fileId||'')
      const file=(await rows(base,key,'assignment_submission_files',{select:'id,file_path,original_name',id:`eq.${fileId}`,submission_id:`eq.${existing.id}`,limit:'1'}))[0]
      if(!file)return res.status(404).json({error:'That file was not found.'})
      await deleteStoredFile(base,key,file.file_path)
      await write(base,key,'assignment_submission_files','DELETE',undefined,{id:`eq.${file.id}`},'return=minimal')
      return res.status(200).json({removed:file.id})
    }

    if(body.action==='prepare'){
      if(existing&&['submitted','completed'].includes(existing.status))return res.status(409).json({error:existing.status==='completed'?'This homework has already been completed.':'Unsubmit your homework before changing the files.'})
      const files=Array.isArray(body.files)?body.files:[]
      if(!files.length||files.length>12)return res.status(400).json({error:'Choose between 1 and 12 files.'})
      const prepared=[]
      for(const f of files){
        const size=Number(f.size||0),type=String(f.type||'')
        if(size<=0||size>MAX_FILE)return res.status(400).json({error:'Each file must be 25 MB or smaller.'})
        if(!ALLOWED.has(type)&&!type.startsWith('image/'))return res.status(400).json({error:'Upload photos, PDFs or Word documents.'})
        const path=`${session.sid}/${assignmentId}/${Date.now()}-${crypto.randomUUID()}-${safeName(f.name)}`
        prepared.push({...await signedUpload(base,key,path),name:String(f.name||'file'),type,size})
      }
      return res.status(200).json({uploads:prepared})
    }

    if(body.action==='complete'){
      if(existing&&['submitted','completed'].includes(existing.status))return res.status(409).json({error:existing.status==='completed'?'This homework has already been completed.':'This homework is already submitted.'})
      const files=Array.isArray(body.files)?body.files:[]
      if(files.some(f=>!String(f.path||'').startsWith(`${session.sid}/${assignmentId}/`)))return res.status(400).json({error:'Invalid submission files.'})
      let submissionId=existing?.id
      let existingFiles=[]
      if(existing)existingFiles=await rows(base,key,'assignment_submission_files',{select:'id',submission_id:`eq.${existing.id}`})
      if(!files.length&&!existingFiles.length)return res.status(400).json({error:'Add at least one file before submitting homework.'})
      const submittedAt=new Date().toISOString()
      if(existing){await write(base,key,'assignment_submissions','PATCH',{status:'submitted',tutor_feedback:null,submitted_at:submittedAt,reviewed_at:null},{id:`eq.${submissionId}`},'return=minimal')}
      else {const made=await write(base,key,'assignment_submissions','POST',{assignment_id:assignmentId,student_id:session.sid,status:'submitted',submitted_at:submittedAt});submissionId=made[0].id}
      if(files.length)await write(base,key,'assignment_submission_files','POST',files.map(f=>({submission_id:submissionId,file_path:f.path,original_name:String(f.name||'file'),mime_type:String(f.type||''),file_size:Number(f.size||0)})),{},'return=minimal')
      const currentFiles=await rows(base,key,'assignment_submission_files',{select:'id,submission_id,original_name,mime_type,file_size,file_path,uploaded_at',submission_id:`eq.${submissionId}`,order:'uploaded_at.asc'})
      const safeFiles=[]
      for(const file of currentFiles){const file_url=await signedDownload(base,key,file.file_path);const {file_path,...safe}=file;safeFiles.push({...safe,file_url})}
      return res.status(200).json({submission:{id:submissionId,status:'submitted',submitted_at:submittedAt},files:safeFiles})
    }
    return res.status(400).json({error:'Unknown submission action.'})
  }catch(e){console.error('student-submit failed',e?.message||e);return res.status(500).json({error:'Unable to update homework right now.'})}
}
