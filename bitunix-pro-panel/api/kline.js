const BASE='https://fapi.bitunix.com';
const allowed=new Set(['1m','5m','15m','30m','1h','2h','4h','6h','12h','1d','1w','1M']);
const ms={'1m':60000,'5m':300000,'15m':900000,'30m':1800000,'1h':3600000,'2h':7200000,'4h':14400000,'6h':21600000,'12h':43200000,'1d':86400000,'1w':604800000};
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
    const s=String(req.query.symbol||'').toUpperCase(),i=String(req.query.interval||'1h'),limit=Math.min(Math.max(Number(req.query.limit)||120,30),200);
    if(!s.endsWith('USDT')||!allowed.has(i))return res.status(400).json({ok:false,error:'invalid args'});
    const now=Date.now(); let startTime;
    if(i==='1M'){const d=new Date(now);d.setUTCMonth(d.getUTCMonth()-(limit+3));startTime=d.getTime();}
    else startTime=Math.max(0,now-(limit+3)*ms[i]);
    const q=new URLSearchParams({symbol:s,interval:i,startTime:String(startTime),endTime:String(now),limit:String(limit+3),type:'LAST_PRICE'});
    const r=await fetch(BASE+'/api/v1/futures/market/kline?'+q,{headers:{accept:'application/json','user-agent':'bitunix-pro-panel-v2/1.0'},cache:'no-store'});
    const j=await r.json(); if(!r.ok||j.code!==0)throw new Error('kline error');
    const rows=(j.data||[]).sort((a,b)=>Number(a.time)-Number(b.time)).slice(-limit);
    const candles=rows.map((x,idx)=>({time:Number(x.time),open:n(x.open),high:n(x.high),low:n(x.low),close:n(x.close),volume:n(x.quoteVol??x.quoteVolume??x.amount??x.turnover??x.volume??x.baseVol),isClosed:idx<rows.length-1?true:null}));
    if(candles.length){const last=candles.at(-1);if(i==='1M'){const d=new Date(last.time);last.isClosed=now>=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1);}else last.isClosed=now>=last.time+ms[i];}
    res.status(200).json({ok:true,symbol:s,interval:i,generatedAt:new Date(now).toISOString(),candles});
  }catch(e){res.status(502).json({ok:false,error:String(e.message||e)})}
}
