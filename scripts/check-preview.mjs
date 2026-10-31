// Standalone browser verification. Uses an existing Puppeteer/Edge runtime;
// installs nothing and never opens or clears the user's browser profile.
// node scripts/check-preview.mjs --runtime D:/lv-frontend/motion-demo/hyperframes/node_modules
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const i=process.argv.indexOf('--runtime');
if(i<0) throw Error('Supply --runtime with an existing Puppeteer node_modules directory');
const req=createRequire(pathToFileURL(path.join(path.resolve(process.argv[i+1]),'../package.json')));
const puppeteer=req('puppeteer-core');
const errors=[],requests=[];
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
const server=createServer(async(request,response)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}
  try{const data=await readFile(file);response.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream'});response.end(data);}
  catch{response.writeHead(404);response.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  browser=await puppeteer.launch({executablePath:process.env.EDGE_PATH??'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--no-first-run','--disable-background-networking']});
  const page=await browser.newPage();
  await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
  await page.setRequestInterception(true);
  page.on('request',r=>{requests.push(r.url());if(!r.url().startsWith(`http://127.0.0.1:${server.address().port}/`)&&!r.url().startsWith('data:')){errors.push('External request '+r.url());r.abort();}else r.continue();});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(`http://127.0.0.1:${server.address().port}/examples/frame-c/frame-c.html`,{waitUntil:'networkidle0'});
  const state=await page.evaluate(async()=>{await document.fonts.ready;await document.fonts.load('400 16px Figtree');await document.fonts.load('500 16px Newsreader');await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return{width:innerWidth,height:innerHeight,fonts:document.fonts.status,figtree:document.fonts.check('400 16px Figtree'),newsreader:document.fonts.check('500 16px Newsreader'),textLength:document.body.innerText.length,stageWidth:document.getElementById('stage').getBoundingClientRect().width};});
  if(state.fonts!=='loaded'||!state.figtree||!state.newsreader||state.textLength<100)errors.push('Font/content check failed');
  await mkdir(path.join(root,'docs/verification'),{recursive:true});
  await page.screenshot({path:path.join(root,'docs/verification/frame-c-preview.png')});
  const report={passed:!errors.length,state,requestCount:requests.length,network:'localhost/data only',errors,browser:'disposable headless Edge context',scope:'active portable Frame C only; not all historical source scenes'};
  await writeFile(path.join(root,'docs/verification/preview-check.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
