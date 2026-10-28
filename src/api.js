export const COLORS = { cream: '#eee6d3', brown: '#75513c', black: '#292b29', navy: '#303e57', sage: '#909c80', rose: '#be8283', white: '#faf9f4' };
export const tomorrowManila = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get = type => parts.find(p=>p.type===type).value;
  const day = new Date(`${get('year')}-${get('month')}-${get('day')}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate()+1);
  return day.toISOString().slice(0,10);
};
export function invitationToken() { return new URLSearchParams(window.location.hash.slice(1)).get('invite') || ''; }
export async function saveResponse({date, janeColor, lukeColor, id}) {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;
  const token = invitationToken();
  if (!url || !key) throw new Error('Wala pa na-connect ang RSVP. Please tell Luke to finish setting it up. Your choices are still here.');
  if (!token) throw new Error('Please use the private invitation link from Luke to send your choices.');
  if (date < tomorrowManila() || !COLORS[janeColor] || !COLORS[lukeColor]) throw new Error('Choose a future date and both outfit colors.');
  const response = await fetch(`${url.replace(/\/$/,'')}/functions/v1/submit-rsvp`, {
    method:'POST', headers:{'Content-Type':'application/json',apikey:key},
    body:JSON.stringify({invitation_token:token,response_id:id,chosen_date:date,jane_color:janeColor,luke_color:lukeColor}),
    signal:AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error('Wala pa na-save. Check your connection or ask Luke to check the invitation, then try again.');
}
