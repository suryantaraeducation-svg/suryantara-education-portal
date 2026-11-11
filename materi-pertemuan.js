// SURYANTARA DIGITAL LEARNING — TEMPLATE MATERI PERTEMUAN
// Isi URL Web App Apps Script Digital Learning (/exec).
// Halaman menerima parameter: ?lessonId=ID_PERTEMUAN
const API_BASE_URL = "PASTE_WEB_APP_EXEC_URL_HERE";
const params = new URLSearchParams(location.search);
const lessonId = params.get("lessonId");
const $ = id => document.getElementById(id);
$("year").textContent = new Date().getFullYear();

function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function drivePreviewUrl(value){
 const raw=String(value||"").trim();if(!raw)return "";
 const a=raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/),b=raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
 const id=a?a[1]:b?b[1]:raw;
 if(/^[a-zA-Z0-9_-]{20,}$/.test(id))return "https://drive.google.com/file/d/"+id+"/preview";
 if(/^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/preview/.test(raw))return raw;
 return "";
}
function callApi(action,extra={}){
 return new Promise((resolve,reject)=>{
  if(API_BASE_URL.includes("PASTE_WEB_APP"))return reject(new Error("URL API belum diisi."));
  const callback="sdlLessonCallback_"+Date.now()+"_"+Math.floor(Math.random()*10000),script=document.createElement("script");
  const query=new URLSearchParams({action,callback,...extra});
  const timer=setTimeout(()=>{cleanup();reject(new Error("Koneksi API melewati batas waktu."));},15000);
  function cleanup(){clearTimeout(timer);delete window[callback];script.remove();}
  window[callback]=data=>{cleanup();resolve(data);};script.onerror=()=>{cleanup();reject(new Error("Tidak dapat menghubungi API Digital Learning."));};
  script.src=API_BASE_URL+(API_BASE_URL.includes("?")?"&":"?")+query.toString();document.head.appendChild(script);
 });
}
function showNotice(message){$("pageNotice").hidden=false;$("pageNotice").textContent=message;}
function renderContents(contents){
 const root=$("lessonContent");root.innerHTML="";
 if(!contents?.length){root.innerHTML='<p class="muted">Materi tertulis dan ilustrasi belum dipublikasikan.</p>';return;}
 contents.sort((a,b)=>Number(a.sequence_no||0)-Number(b.sequence_no||0));
 contents.forEach(item=>{
  const type=String(item.content_type||"").toLowerCase(),block=document.createElement("article");block.className="lesson-block";
  const title=item.title?"<h3>"+escapeHtml(item.title)+"</h3>":"";
  if(type==="image"||type==="illustration")block.innerHTML=title+(item.content_url?'<img class="lesson-image" src="'+escapeHtml(item.content_url)+'" alt="'+escapeHtml(item.title||"Ilustrasi materi")+'" loading="lazy">':"");
  else if(type==="text"||type==="material"||type==="content")block.innerHTML=title+'<div class="lesson-text">'+escapeHtml(item.body_text||"")+"</div>";
  else return;
  root.appendChild(block);
 });
}
function renderVideo(contents){
 const video=(contents||[]).find(x=>String(x.content_type||"").toLowerCase()==="video");if(!video)return;
 const url=drivePreviewUrl(video.content_url);
 if(!url){$("videoNote").textContent="Tautan video belum dikenali. Simpan ID file atau link Google Drive pada content_url.";return;}
 $("videoFrame").innerHTML='<iframe src="'+escapeHtml(url)+'" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" title="'+escapeHtml(video.title||"Video pembelajaran")+'"></iframe>';
 $("videoNote").textContent="Video diputar dari Google Drive. Pastikan akses file sudah sesuai dengan kebijakan akses siswa.";
}
function renderLesson(data){
 const lesson=data.lesson||data;
 $("lessonTitle").textContent=lesson.title||"Materi Pertemuan";$("lessonDescription").textContent=lesson.description||"Pelajari materi secara bertahap dan kerjakan latihan setelah memahami konsep.";
 $("phaseName").textContent=data.phase_name||"Program Pembelajaran";$("meetingNumber").textContent="Pertemuan "+(lesson.meeting_no||"—");
 $("duration").textContent=(lesson.estimated_minutes||60)+" menit";document.title=(lesson.title||"Materi Pertemuan")+" | Suryantara Digital Learning";
 renderVideo(data.contents||[]);renderContents(data.contents||[]);
 const p=Math.max(0,Math.min(100,Number(data.progress_percent||0)));$("progressBar").style.width=p+"%";
 $("progressText").textContent=p?"Progres materi: "+p+"%":"Selesaikan materi ini sebelum melanjutkan ke pertemuan berikutnya.";
 if(data.previous_lesson_id)$("previousLesson").href="materi-pertemuan.html?lessonId="+encodeURIComponent(data.previous_lesson_id);
 if(data.next_lesson_id){$("nextLesson").href="materi-pertemuan.html?lessonId="+encodeURIComponent(data.next_lesson_id);$("nextLesson").querySelector("b").textContent="Pertemuan berikutnya →";}
}
async function init(){
 if(!lessonId){showNotice("ID pertemuan belum ditemukan. Buka halaman ini dari daftar materi program.");$("lessonTitle").textContent="Pertemuan belum dipilih";return;}
 try{
  // Endpoint getLessonDetail perlu ditambahkan pada Apps Script Digital Learning.
  const result=await callApi("getLessonDetail",{lessonId});
  if(!result||!result.success)throw new Error(result?.message||"Data pertemuan tidak tersedia.");
  renderLesson(result.data||{});
 }catch(err){$("lessonTitle").textContent="Materi belum dapat dimuat";$("lessonDescription").textContent="Periksa koneksi dan konfigurasi API Digital Learning.";showNotice(err.message+" Halaman ini memerlukan endpoint getLessonDetail pada Apps Script.");}
}
init();
