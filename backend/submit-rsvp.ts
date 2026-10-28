// Invitation-token authentication. No public read operation.
const allowedOrigins = new Set(['https://lokeyyron.github.io','http://127.0.0.1:4173','http://localhost:4173','http://localhost:3000']);
const colors = new Set(['cream','brown','black','navy','sage','rose','white']);
Deno.serve(async (req: Request) => {
 const origin=req.headers.get('origin');
 const headers:Record<string,string>={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Headers':'content-type, apikey','Access-Control-Allow-Methods':'POST, OPTIONS'};
 if(origin && allowedOrigins.has(origin))headers['Access-Control-Allow-Origin']=origin;
 const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
 if(origin && !allowedOrigins.has(origin))return reply(403,{error:'Origin not allowed'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
 try {
  if(Number(req.headers.get('content-length'))>2048)return reply(413,{error:'Request too large'});
  const raw=await req.text(); if(raw.length>2048)return reply(413,{error:'Request too large'});
  let data;try{data=JSON.parse(raw)}catch{return reply(400,{error:'Invalid JSON'})}
  const {invitation_token,response_id,chosen_date,jane_color,luke_color}=data||{};
  if(typeof invitation_token!=='string'||!/^[a-f0-9]{64}$/.test(invitation_token))return reply(403,{error:'Invalid invitation'});
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(invitation_token)))).map(n=>n.toString(16).padStart(2,'0')).join('');
  const url=Deno.env.get('SUPABASE_URL')!;
  const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const dbHeaders={'apikey':key,'Authorization':`Bearer ${key}`,'Content-Type':'application/json'};
  const lookup=await fetch(`${url}/rest/v1/date_invitations?token_hash=eq.${hash}&enabled=eq.true&select=expires_at`,{headers:dbHeaders});
  if(!lookup.ok)return reply(503,{error:'Storage unavailable'});
  const invites=await lookup.json();
  if(invites.length!==1||new Date(invites[0].expires_at)<=new Date())return reply(403,{error:'Invalid invitation'});
  if(typeof response_id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(response_id))return reply(400,{error:'Invalid response ID'});
  if(typeof chosen_date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(chosen_date)||!colors.has(jane_color)||!colors.has(luke_color))return reply(400,{error:'Invalid choices'});
  const date=new Date(chosen_date+'T00:00:00Z');
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=(t:string)=>parts.find(p=>p.type===t)!.value;
  const today=`${get('year')}-${get('month')}-${get('day')}`;
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==chosen_date||chosen_date<=today)return reply(400,{error:'Choose a future date'});
  const row={id:response_id,chosen_date,jane_color,luke_color,invitation_hash:hash};
  const saved=await fetch(`${url}/rest/v1/date_responses`,{method:'POST',headers:{...dbHeaders,Prefer:'return=minimal'},body:JSON.stringify(row)});
  if(saved.ok)return reply(200,{saved:true});
  if(saved.status===409){
   const existing=await fetch(`${url}/rest/v1/date_responses?id=eq.${response_id}&invitation_hash=eq.${hash}&select=chosen_date,jane_color,luke_color`,{headers:dbHeaders});
   if(existing.ok){const rows=await existing.json();if(rows.length===1&&rows[0].chosen_date===chosen_date&&rows[0].jane_color===jane_color&&rows[0].luke_color===luke_color)return reply(200,{saved:true});}
   return reply(409,{error:'Response conflict'});
  }
  return reply(503,{error:'Unable to save'});
 }catch{return reply(500,{error:'Unable to process response'});}
});
