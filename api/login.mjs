import {json,configured,authenticated,verifyPassword,sessionCookie} from './_shared.mjs';
export async function GET(req){return json({authenticated:authenticated(req),configured:configured()});}
export async function POST(req){if(!configured())return json({error:'서버 환경변수가 아직 설정되지 않았습니다.'},503);let body;try{body=await req.json()}catch{return json({error:'요청 형식이 잘못되었습니다.'},400)}if(!verifyPassword(body?.password))return json({error:'비밀번호가 맞지 않습니다.'},401);return json({ok:true},200,{'Set-Cookie':sessionCookie()});}
