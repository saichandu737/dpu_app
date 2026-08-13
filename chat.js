import{initializeApp}from"https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import{getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import{getFirestore,collection,addDoc,query,orderBy,onSnapshot,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* PASTE YOUR FIREBASE CONFIG HERE */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOre9fdJKTAVAaAWDic0QtsxnwW6yfQYg",
  authDomain: "chinnu-7f924.firebaseapp.com",
  projectId: "chinnu-7f924",
  storageBucket: "chinnu-7f924.firebasestorage.app",
  messagingSenderId: "184897170190",
  appId: "1:184897170190:web:8df0e26952cf1b9038455f",
  measurementId: "G-DY2BD8E7D8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);    
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const $=id=>document.getElementById(id);let signup=false,stop=null;

function mode(v){signup=v;$("loginTab").classList.toggle("active",!v);$("signupTab").classList.toggle("active",v);$("authButton").textContent=v?"Create account ❤️":"Login ❤️";$("authMessage").textContent=""}
$("loginTab").onclick=()=>mode(false);$("signupTab").onclick=()=>mode(true);

$("authForm").onsubmit=async e=>{e.preventDefault();$("authMessage").textContent="Please wait…";try{if(signup)await createUserWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);else await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value)}catch(x){$("authMessage").textContent=x.code||x.message}};
$("logout").onclick=()=>signOut(auth);

onAuthStateChanged(auth,u=>{if(u){$("authScreen").classList.add("hidden");$("chatScreen").classList.remove("hidden");$("status").textContent="Connected ❤️";listen()}else{$("chatScreen").classList.add("hidden");$("authScreen").classList.remove("hidden");if(stop)stop()}});

function listen(){if(stop)stop();const q=query(collection(db,"messages"),orderBy("createdAt","asc"));stop=onSnapshot(q,s=>{document.querySelectorAll(".bubble-row").forEach(x=>x.remove());$("empty").style.display=s.empty?"flex":"none";s.forEach(d=>draw(d.data()));$("messages").scrollTop=$("messages").scrollHeight},e=>{$("status").textContent="Firestore error";console.error(e)})}

function draw(m){const mine=m.senderUid===auth.currentUser?.uid,row=document.createElement("div");row.className="bubble-row "+(mine?"mine":"");const b=document.createElement("div");b.className="bubble";const t=document.createElement("div");t.textContent=m.text;const tm=document.createElement("div");tm.className="time";tm.textContent=m.createdAt?m.createdAt.toDate().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"Sending…";b.append(t,tm);row.append(b);$("messages").append(row)}

$("messageForm").onsubmit=async e=>{e.preventDefault();const text=$("message").value.trim(),u=auth.currentUser;if(!text||!u)return;$("message").value="";try{await addDoc(collection(db,"messages"),{text,senderUid:u.uid,senderEmail:u.email,createdAt:serverTimestamp()})}catch(x){alert("Could not send. Check Firestore rules.");$("message").value=text;console.error(x)}};

$("emoji").onclick=()=>$("emojiPanel").classList.toggle("hidden");document.querySelectorAll("#emojiPanel button").forEach(b=>b.onclick=()=>{$("message").value+=b.textContent;$("message").focus();$("emojiPanel").classList.add("hidden")});

setInterval(()=>{const h=document.createElement("div");h.className="heart";h.textContent=["❤️","💕","✨","💗"][Math.floor(Math.random()*4)];h.style.left=Math.random()*100+"vw";h.style.fontSize=14+Math.random()*18+"px";h.style.animationDuration=5+Math.random()*5+"s";$("hearts").append(h);setTimeout(()=>h.remove(),10000)},900);
