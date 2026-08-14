import{initializeApp}from"https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import{getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import{getFirestore,collection,addDoc,query,orderBy,onSnapshot,serverTimestamp,doc,updateDoc}from"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* KEEP YOUR WORKING FIREBASE CONFIG HERE */
const firebaseConfig={apiKey:"PASTE_API_KEY",authDomain:"PASTE_PROJECT_ID.firebaseapp.com",projectId:"PASTE_PROJECT_ID",storageBucket:"PASTE_STORAGE_BUCKET",messagingSenderId:"PASTE_SENDER_ID",appId:"PASTE_APP_ID"};

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);
let signupMode=false,stopMessages=null,firstLoad=true;

function setMode(v){signupMode=v;$("loginTab").classList.toggle("active",!v);$("signupTab").classList.toggle("active",v);$("authButton").textContent=v?"Create account ❤️":"Login ❤️";$("authMessage").textContent=""}
$("loginTab").onclick=()=>setMode(false);$("signupTab").onclick=()=>setMode(true);

$("authForm").onsubmit=async e=>{e.preventDefault();$("authMessage").textContent="Please wait…";try{if(signupMode)await createUserWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);else await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value)}catch(x){console.error(x);$("authMessage").textContent=authError(x.code)}};

$("logoutBtn").onclick=async()=>{try{await signOut(auth)}catch(x){console.error(x);$("authMessage").textContent="Logout failed. Please try again."}};

onAuthStateChanged(auth,user=>{if(user){$("authScreen").classList.add("hidden");$("chatScreen").classList.remove("hidden");$("status").textContent="Connected ❤️";firstLoad=true;listenMessages()}else{$("chatScreen").classList.add("hidden");$("authScreen").classList.remove("hidden");if(stopMessages)stopMessages();stopMessages=null}});

function listenMessages(){
 if(stopMessages)stopMessages();
 const box=$("messages");if(!box)return;
 const q=query(collection(db,"messages"),orderBy("createdAt","asc"));
 stopMessages=onSnapshot(q,s=>{
   const near=box.scrollHeight-box.scrollTop-box.clientHeight<120;
   box.querySelectorAll(".bubble-row").forEach(x=>x.remove());
   const empty=$("empty");if(empty)empty.style.display=s.empty?"flex":"none";
   s.forEach(d=>drawMessage(d.id,d.data()));
   if(firstLoad||near)requestAnimationFrame(()=>box.scrollTop=box.scrollHeight);
   firstLoad=false;
   updateScrollButton();
 },e=>{console.error("Firestore messages:",e);$("status").textContent="Chat error"});
}

function drawMessage(id,m){
 const u=auth.currentUser;if(!u)return;
 const mine=m.senderUid===u.uid,row=document.createElement("div");row.className="bubble-row"+(mine?" mine":"");
 const b=document.createElement("div");b.className="bubble";
 const t=document.createElement("div");t.textContent=m.text;
 const tm=document.createElement("div");tm.className="time";tm.textContent=m.createdAt?.toDate?m.createdAt.toDate().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"Sending…";
 b.append(t,tm);
 if(mine){const r=document.createElement("div");r.className="receipt";r.textContent=Object.keys(m.readBy||{}).length>1?"✓✓ Read":"✓ Sent";b.append(r)}
 row.append(b);$("messages").append(row);
 if(!mine&&!m.readBy?.[u.uid])markRead(id,m);
}

async function markRead(id,m){
 const u=auth.currentUser;if(!u||m.senderUid===u.uid||m.readBy?.[u.uid])return;
 try{await updateDoc(doc(db,"messages",id),{[`readBy.${u.uid}`]:serverTimestamp()})}catch(e){console.warn("Read receipt:",e)}
}

$("messageForm").onsubmit=async e=>{
 e.preventDefault();const input=$("message"),text=input.value.trim(),u=auth.currentUser;if(!text||!u)return;
 input.value="";
 try{await addDoc(collection(db,"messages"),{text,senderUid:u.uid,senderEmail:u.email,createdAt:serverTimestamp(),readBy:{[u.uid]:serverTimestamp()}});requestAnimationFrame(()=>{$("messages").scrollTop=$("messages").scrollHeight})}
 catch(x){console.error(x);input.value=text;alert("Message could not be sent. Check Firestore rules.")}
};

$("messages").onscroll=updateScrollButton;
function updateScrollButton(){const b=$("messages");const d=b.scrollHeight-b.scrollTop-b.clientHeight;$("scrollBottom").classList.toggle("hidden",d<150)}
$("scrollBottom").onclick=()=>{$("messages").scrollTo({top:$("messages").scrollHeight,behavior:"smooth"})};

$("emojiBtn").onclick=()=>{$("emojiPanel").classList.toggle("hidden")};
document.querySelectorAll("#emojiPanel button").forEach(b=>b.onclick=()=>{$("message").value+=b.textContent;$("message").focus();$("emojiPanel").classList.add("hidden")});

function authError(c){return({"auth/invalid-credential":"Email or password is incorrect.","auth/user-not-found":"User does not exist.","auth/wrong-password":"Incorrect password.","auth/invalid-email":"Enter a valid email.","auth/email-already-in-use":"This email already has an account.","auth/weak-password":"Use at least 6 characters.","auth/network-request-failed":"Check your internet connection."}[c]||"Something went wrong. Check the Console.")}

setInterval(()=>{const h=document.createElement("div");h.className="heart";h.textContent=["❤️","💕","✨","💗"][Math.floor(Math.random()*4)];h.style.left=Math.random()*100+"vw";h.style.fontSize=14+Math.random()*18+"px";h.style.animationDuration=5+Math.random()*5+"s";$("hearts").append(h);setTimeout(()=>h.remove(),10000)},900);
