/*
=========================================================
EASY CUSTOMIZATION
=========================================================
1. Change girlfriendName if you want.
2. Edit questions below.
3. Replace memory image filenames with your photos.
4. Edit the secretMessage.
5. Put your song at music/our-song.mp3
=========================================================
*/

const girlfriendName = "Deepu";

const questions = [
  { icon:"🥺", category:"💕 Us", text:"Do you think about me when I'm not around?", yes:"Aww... I knew it. ❤️", no:"Hmm... I'm going to pretend I didn't see that. 😂" },
  { icon:"😊", category:"💕 Us", text:"Do I make you happy?", yes:"That's exactly what I wanted to hear. ❤️", no:"Okay... we need to have a serious meeting. 😂" },
  { icon:"🥰", category:"💕 Us", text:"Do you miss me when we're apart?", yes:"I miss you too. ❤️", no:"Liar! 😏" },
  { icon:"😂", category:"😈 Be Honest", text:"Am I sometimes annoying?", yes:"Finally! Some honesty. 😂", no:"You're being too nice to me. ❤️" },
  { icon:"❤️", category:"💕 Us", text:"Would you choose me again?", yes:"That's my girl. 🥰", no:"Wrong answer! Try again. 😂" },
  { icon:"📸", category:"✨ Future", text:"Do you want more memories with me?", yes:"Then let's make them. ❤️", no:"I'm not accepting that answer. 😌" },
  { icon:"✈️", category:"✨ Future", text:"Would you go on an adventure with me?", yes:"Adventure awaits! ✈️❤️", no:"I'll have to work on my convincing skills. 😂" },
  { icon:"💖", category:"💕 Us", text:"Do you feel lucky to have me?", yes:"Good answer. Very good answer. 😌❤️", no:"I'm choosing to believe you clicked the wrong button. 😂" }
];

const memories = [
  { image:"images/memory1.svg", title:"Memory #1 ❤️", text:"This moment will always have a special place in my heart." },
  { image:"images/memory2.svg", title:"Memory #2 💕", text:"One of my favorite moments with you." },
  { image:"images/memory3.svg", title:"Memory #3 🥰", text:"Another memory I never want to forget." },
  { image:"images/memory4.svg", title:"Memory #4 ✨", text:"Here's to many more moments like this." }
];

const secretMessage = `Thank you for being such a special part of my life.
You make ordinary moments brighter, and some of my favorite memories are the ones I've shared with you.
I hope we continue creating many more beautiful memories together.
Here's to us, to all the silly moments, and to everything still waiting for us.
I love you. Always. ❤️`;

let questionIndex = 0;
let memoryIndex = 0;
let musicPlaying = false;

const $ = id => document.getElementById(id);

function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}

function start(){
  questionIndex=0;
  show("quiz");
  renderQuestion();
  startHearts();
  startMusic();
}

function renderQuestion(){
  const q=questions[questionIndex];
  $("qCount").textContent=`Question ${questionIndex+1} of ${questions.length}`;
  $("qCategory").textContent=q.category;
  $("questionIcon").textContent=q.icon;
  $("questionText").textContent=q.text;
  $("response").textContent="";
  $("progressBar").style.width=`${(questionIndex/questions.length)*100}%`;
}

function answer(type){
  const q=questions[questionIndex];
  $("response").textContent=type==="yes"?q.yes:q.no;
  setTimeout(()=>{
    questionIndex++;
    if(questionIndex>=questions.length) show("memoriesIntro");
    else renderQuestion();
  },900);
}

function renderMemory(){
  const m=memories[memoryIndex];
  $("memoryImage").src=m.image;
  $("memoryImage").alt=m.title;
  $("memoryTitle").textContent=m.title;
  $("memoryText").textContent=m.text;
  $("memoryNumber").textContent=`${memoryIndex+1} / ${memories.length}`;
  $("prevMemory").disabled=memoryIndex===0;
  $("prevMemory").style.opacity=memoryIndex===0?".45":"1";
  $("nextMemory").textContent=memoryIndex===memories.length-1?"See My Score ❤️":"Next ❤️";
}

function startMemories(){memoryIndex=0;show("memories");renderMemory()}
function nextMemory(){
  if(memoryIndex<memories.length-1){memoryIndex++;renderMemory()}
  else {show("score");animateScore()}
}
function previousMemory(){if(memoryIndex>0){memoryIndex--;renderMemory()}}

function animateScore(){
  let n=0;
  const timer=setInterval(()=>{
    n+=4;
    if(n>=100){n=100;clearInterval(timer);launchConfetti()}
    $("scoreNumber").textContent=n;
  },22);
  $("scoreText").textContent="A completely scientific and definitely unbiased result. 😌❤️";
}

function finalYes(){launchConfetti();setTimeout(()=>show("celebrate"),500)}
function finalNo(){
  const b=$("finalNo");
  b.textContent="Are you really sure? 😏";
  b.style.position="relative";
  b.style.left=`${Math.random()*100-50}px`;
  b.style.top=`${Math.random()*30-15}px`;
  $("finalResponse").textContent="I'm giving you another chance. 😂❤️";
}

function openSecret(){
  $("secretMessage").textContent=secretMessage;
  show("secret");
  launchConfetti();
}

function restart(){questionIndex=0;memoryIndex=0;show("welcome")}

async function startMusic(){
  const audio=$("music");
  try{await audio.play();musicPlaying=true;$("musicBtn").textContent="⏸ Music"}
  catch(e){/* browser requires user interaction; music button remains available */}
}
function toggleMusic(){
  const audio=$("music");
  if(musicPlaying){audio.pause();musicPlaying=false;$("musicBtn").textContent="🎵 Music"}
  else{audio.play().then(()=>{musicPlaying=true;$("musicBtn").textContent="⏸ Music"}).catch(()=>alert("Add your song as music/our-song.mp3 first."))}
}

function startHearts(){
  if(window.heartTimer)return;
  window.heartTimer=setInterval(()=>{
    const h=document.createElement("div");
    h.className="heart";
    h.textContent=["❤️","💕","💗","💖","✨"][Math.floor(Math.random()*5)];
    h.style.left=Math.random()*100+"vw";
    h.style.fontSize=14+Math.random()*22+"px";
    h.style.animationDuration=5+Math.random()*5+"s";
    $("hearts").appendChild(h);
    setTimeout(()=>h.remove(),10000);
  },650);
}

function launchConfetti(){
  for(let i=0;i<120;i++){
    const c=document.createElement("div");
    c.className="confetti";
    c.textContent=Math.random()>.45?"❤️":"✨";
    c.style.left=Math.random()*100+"vw";
    c.style.animationDuration=2+Math.random()*2.5+"s";
    c.style.animationDelay=Math.random()*.5+"s";
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),4500);
  }
}

$("startBtn").addEventListener("click",start);
$("yesBtn").addEventListener("click",()=>answer("yes"));
$("noBtn").addEventListener("click",()=>answer("no"));
$("memoryStartBtn").addEventListener("click",startMemories);
$("prevMemory").addEventListener("click",previousMemory);
$("nextMemory").addEventListener("click",nextMemory);
$("finalBtn").addEventListener("click",()=>show("finalQuestion"));
$("finalYes").addEventListener("click",finalYes);
$("finalNo").addEventListener("click",finalNo);
$("secretBtn").addEventListener("click",openSecret);
$("restartBtn").addEventListener("click",restart);
$("musicBtn").addEventListener("click",toggleMusic);

$("memoryImage").addEventListener("error",function(){
  this.style.background="linear-gradient(135deg,#3d1235,#150014)";
  this.alt="Add your photo here";
});
