/* Async boundaries shared by the extension and regression tests. */
(function(root){
  'use strict';
  async function bounded(promise,ms,label){
    let timer;
    try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label+' tidak merespons dalam '+Math.ceil(ms/1000)+' detik.')),Math.max(1,ms))})]);}
    finally{clearTimeout(timer);}
  }
  function decode(data){return Uint8Array.from(atob(data),c=>c.charCodeAt(0));}
  function toBase64(bytes){let parts=[];for(let i=0;i<bytes.length;i+=24576)parts.push(btoa(String.fromCharCode(...bytes.subarray(i,i+24576))));return parts.join('');}
  async function readPdfStream(output,command){
    if(output.data)return decode(output.data);
    if(!output.stream)throw Error('Chrome tidak mengembalikan file PDF.');
    const chunks=[];let size=0;
    try{while(true){
      const part=await command('IO.read',{handle:output.stream,size:262144});
      const bytes=part.base64Encoded?decode(part.data||''):new TextEncoder().encode(part.data||'');
      chunks.push(bytes);size+=bytes.length;
      if(part.eof)break;
      if(!bytes.length)throw Error('Aliran PDF berhenti sebelum selesai.');
    }}finally{try{await command('IO.close',{handle:output.stream});}catch{}}
    const result=new Uint8Array(size);let offset=0;
    for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}
    if(new TextDecoder().decode(result.subarray(0,5))!=='%PDF-')throw Error('File dari Chrome bukan PDF yang valid.');
    return result;
  }
  const api={bounded,readPdfStream,toBase64};
  if(typeof module!=='undefined')module.exports=api;else root.GeneratorJobs=api;
})(typeof self!=='undefined'?self:globalThis);
