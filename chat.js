import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyAOre9fdJKTAVAaAWDic0QtsxnwW6yfQYg",
  authDomain: "chinnu-7f924.firebaseapp.com",
  projectId: "chinnu-7f924",
  storageBucket: "chinnu-7f924.firebasestorage.app",
  messagingSenderId: "184897170190",
  appId: "1:184897170190:web:8df0e26952cf1b9038455f",
  measurementId: "G-DY2BD8E7D8"
};
const app = initializeApp(firebaseConfig),
  auth = getAuth(app),
  db = getFirestore(app),
  $ = (id) => document.getElementById(id);
let signup = false,
  stopMessages = null,
  stopTyping = null,
  typingTimer = null;
function mode(v) {
  signup = v;
  $("loginTab").classList.toggle("active", !v);
  $("signupTab").classList.toggle("active", v);
  $("authButton").textContent = v ? "Create account ❤️" : "Login ❤️";
  $("authMessage").textContent = "";
}
$("loginTab").onclick = () => mode(false);
$("signupTab").onclick = () => mode(true);
$("authForm").onsubmit = async (e) => {
  e.preventDefault();
  $("authMessage").textContent = "Please wait…";
  try {
    if (signup)
      await createUserWithEmailAndPassword(
        auth,
        $("email").value.trim(),
        $("password").value,
      );
    else
      await signInWithEmailAndPassword(
        auth,
        $("email").value.trim(),
        $("password").value,
      );
  } catch (x) {
    $("authMessage").textContent = friendly(x.code);
    console.error(x);
  }
};
$("logout").onclick = () => signOut(auth);
onAuthStateChanged(auth, (u) => {
  if (u) {
    $("authScreen").classList.add("hidden");
    $("chatScreen").classList.remove("hidden");
    $("status").textContent = "Connected ❤️";
    listenMessages();
    listenTyping();
    setTyping(false);
  } else {
    $("chatScreen").classList.add("hidden");
    $("authScreen").classList.remove("hidden");
    if (stopMessages) stopMessages();
    if (stopTyping) stopTyping();
  }
});
function listenMessages() {
  if (stopMessages) stopMessages();
  const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
  stopMessages = onSnapshot(
    q,
    (s) => {
      document.querySelectorAll(".bubble-row").forEach((x) => x.remove());
      $("empty").style.display = s.empty ? "flex" : "none";
      s.forEach((d) => {
        const m = d.data();
        drawMessage(d.id, m);
        markRead(d.id, m);
      });
      $("messages").scrollTop = $("messages").scrollHeight;
    },
    (e) => {
      $("status").textContent = "Chat error";
      console.error(e);
    },
  );
}
async function markRead(id, m) {
  const u = auth.currentUser;
  if (!u || m.senderUid === u.uid || m.readBy?.[u.uid]) return;
  try {
    await updateDoc(doc(db, "messages", id), {
      [`readBy.${u.uid}`]: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Read receipt:", e);
  }
}
function drawMessage(id, m) {
  const mine = m.senderUid === auth.currentUser?.uid,
    row = document.createElement("div");
  row.className = "bubble-row " + (mine ? "mine" : "");
  const b = document.createElement("div");
  b.className = "bubble";
  const t = document.createElement("div");
  t.textContent = m.text;
  const tm = document.createElement("div");
  tm.className = "time";
  tm.textContent = m.createdAt
    ? m.createdAt
        .toDate()
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Sending…";
  b.append(t, tm);
  if (mine) {
    const r = document.createElement("div");
    r.className = "receipt";
    r.textContent =
      Object.keys(m.readBy || {}).length > 1 ? "✓✓ Read" : "✓ Sent";
    b.append(r);
  }
  row.append(b);
  $("messages").append(row);
}
$("messageForm").onsubmit = async (e) => {
  e.preventDefault();
  const text = $("message").value.trim(),
    u = auth.currentUser;
  if (!text || !u) return;
  $("message").value = "";
  setTyping(false);
  try {
    await addDoc(collection(db, "messages"), {
      text,
      senderUid: u.uid,
      senderEmail: u.email,
      createdAt: serverTimestamp(),
      readBy: { [u.uid]: serverTimestamp() },
    });
  } catch (x) {
    $("message").value = text;
    alert("Message could not be sent. Check Firestore rules.");
    console.error(x);
  }
};
$("message").addEventListener("input", () => {
  clearTimeout(typingTimer);
  setTyping($("message").value.length > 0);
  typingTimer = setTimeout(() => setTyping(false), 1200);
});
async function setTyping(value) {
  const u = auth.currentUser;
  if (!u) return;
  try {
    await setDoc(
      doc(db, "typing", u.uid),
      { typing: value, updatedAt: serverTimestamp() },
      { merge: true },
    );
  } catch (e) {
    console.warn("Typing status:", e);
  }
}
function listenTyping() {
  if (stopTyping) stopTyping();
  stopTyping = onSnapshot(
    collection(db, "typing"),
    (s) => {
      const me = auth.currentUser?.uid;
      let other = false;
      s.forEach((d) => {
        if (d.id !== me && d.data().typing === true) other = true;
      });
      $("typing").classList.toggle("hidden", !other);
    },
    (e) => console.warn("Typing listener:", e),
  );
}
$("emoji").onclick = () => $("emojiPanel").classList.toggle("hidden");
document.querySelectorAll("#emojiPanel button").forEach(
  (b) =>
    (b.onclick = () => {
      $("message").value += b.textContent;
      $("message").focus();
      $("emojiPanel").classList.add("hidden");
      $("message").dispatchEvent(new Event("input"));
    }),
);
function friendly(c) {
  return (
    {
      "auth/invalid-credential": "Email or password is incorrect.",
      "auth/user-not-found": "User does not exist.",
      "auth/wrong-password": "Incorrect password.",
      "auth/invalid-email": "Enter a valid email.",
      "auth/email-already-in-use": "This email already has an account.",
      "auth/weak-password": "Use at least 6 characters.",
      "auth/network-request-failed": "Check your internet connection.",
    }[c] || "Something went wrong."
  );
}
setInterval(() => {
  const h = document.createElement("div");
  h.className = "heart";
  h.textContent = ["❤️", "💕", "✨", "💗"][Math.floor(Math.random() * 4)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 14 + Math.random() * 18 + "px";
  h.style.animationDuration = 5 + Math.random() * 5 + "s";
  document.getElementById("hearts").append(h);
  setTimeout(() => h.remove(), 10000);
}, 900);
