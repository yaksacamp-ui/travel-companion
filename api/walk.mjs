// Free public FOSSGIS pedestrian OSRM endpoint. No API key or paid services.
// Lightweight personal/family use only. No guaranteed uptime or SLA.
const ROUTER='https://routing.openstreetmap.de/routed-foot/route/v1/driving/';
const cache=new Map();let lastRequestAt=0;
const respond=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
function coordinate(s){if(typeof s!=='string'||s.length>65)return null;const parts=s.split(',');if(parts.length!==2)return null;const nums=parts.map(x=>Number(x));if(parts.some(x=>!x.trim())||nums.some(n=>!Number.isFinite(n)))return null;const [lat,lng]=nums;return Math.abs(lat)<=90&&Math.abs(lng)<=180?{lat,lng}:null}
export async function GET(request){
  const url=new URL(request.url),from=coordinate(url.searchParams.get('from')),to=coordinate(url.searchParams.get('to'));
  if(!from||!to)return respond({error:'출발지 또는 도착지 좌표가 올바르지 않습니다.'},400);
  const key=[from.lat.toFixed(5),from.lng.toFixed(5),to.lat.toFixed(5),to.lng.toFixed(5)].join(':');
  const hit=cache.get(key);if(hit&&Date.now()-hit.at<120000)return respond(hit.value);
  // Public route host's max 1 request/sec. This protects a warm serverless instance only.
  if(Date.now()-lastRequestAt<1100)return respond({error:'무료 지도 서버 요청 간격 제한입니다. 잠시 후 다시 시도해 주세요.'},429);
  lastRequestAt=Date.now();
  const endpoint=ROUTER+`${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=false`;
  let remote;
  try{remote=await fetch(endpoint,{signal:AbortSignal.timeout(12000),headers:{'Accept':'application/json'}})}
  catch{return respond({error:'무료 도보 경로 서버에 연결할 수 없습니다.'},503)}
  if(!remote.ok)return respond({error:'무료 도보 경로 서비스가 현재 응답하지 않습니다.'},503);
  let data;try{data=await remote.json()}catch{return respond({error:'도보 경로 응답이 올바르지 않습니다.'},502)}
  const r=data.routes?.[0],coordinates=r?.geometry?.coordinates;
  if(data.code!=='Ok'||!Array.isArray(coordinates)||coordinates.length<2||coordinates.length>40000||!Number.isFinite(r.distance)||!Number.isFinite(r.duration))return respond({error:'두 위치 사이의 도보 경로를 찾지 못했습니다.'},404);
  const value={coordinates,distance:r.distance,duration:r.duration,attribution:'OSRM / © OpenStreetMap contributors'};
  if(cache.size>80)cache.clear();cache.set(key,{at:Date.now(),value});return respond(value);
}
