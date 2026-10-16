import {json,clearCookie} from './_shared.mjs';
export function POST(){return json({ok:true},200,{'Set-Cookie':clearCookie()});}
