import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =====================================================
// YOUR FIREBASE CONFIG
// KEEP YOUR EXISTING CONFIG HERE
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyAOre9fdJKTAVAaAWDic0QtsxnwW6yfQYg",
  authDomain: "chinnu-7f924.firebaseapp.com",
  projectId: "chinnu-7f924",
  storageBucket: "chinnu-7f924.firebasestorage.app",
  messagingSenderId: "184897170190",
  appId: "1:184897170190:web:8df0e26952cf1b9038455f",
  measurementId: "G-DY2BD8E7D8"
};


// =====================================================
// FIREBASE INITIALIZATION
// =====================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// =====================================================
// HELPERS
// =====================================================

const $ = (id) => document.getElementById(id);

let signupMode = false;
let unsubscribeMessages = null;


// =====================================================
// LOGIN / SIGNUP
// =====================================================

$("loginTab").onclick = () => {
    signupMode = false;

    $("loginTab").classList.add("active");
    $("signupTab").classList.remove("active");

    $("authButton").textContent = "Login ❤️";
    $("authMessage").textContent = "";
};


$("signupTab").onclick = () => {
    signupMode = true;

    $("signupTab").classList.add("active");
    $("loginTab").classList.remove("active");

    $("authButton").textContent = "Create account ❤️";
    $("authMessage").textContent = "";
};


$("authForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = $("email").value.trim();
    const password = $("password").value;

    $("authMessage").textContent = "Please wait...";

    try {

        if (signupMode) {

            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        } else {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
        }

    } catch (error) {

        console.error(error);

        $("authMessage").textContent =
            getFirebaseError(error.code);
    }
});


// =====================================================
// LOGOUT
// =====================================================

$("logout").onclick = async () => {
    await signOut(auth);
};


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("Logged in:", user.email);

        $("authScreen").classList.add("hidden");
        $("chatScreen").classList.remove("hidden");

        $("status").textContent = "Connected ❤️";

        listenForMessages();

    } else {

        $("chatScreen").classList.add("hidden");
        $("authScreen").classList.remove("hidden");

        if (unsubscribeMessages) {
            unsubscribeMessages();
        }
    }
});


// =====================================================
// LISTEN FOR CHAT MESSAGES
// =====================================================

function listenForMessages() {

    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    const messagesQuery = query(
        collection(db, "messages"),
        orderBy("createdAt", "asc")
    );

    unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {

            document
                .querySelectorAll(".bubble-row")
                .forEach(element => element.remove());

            $("empty").style.display =
                snapshot.empty ? "flex" : "none";

            snapshot.forEach((documentSnapshot) => {

                const message = documentSnapshot.data();

                displayMessage(message);
            });

            $("messages").scrollTop =
                $("messages").scrollHeight;
        },

        (error) => {

            console.error("Firestore error:", error);

            $("status").textContent =
                "Unable to load messages";
        }
    );
}


// =====================================================
// DISPLAY MESSAGE
// =====================================================

function displayMessage(message) {

    const currentUser = auth.currentUser;

    const mine =
        message.senderUid === currentUser?.uid;

    const row = document.createElement("div");

    row.className =
        "bubble-row " + (mine ? "mine" : "");


    const bubble =
        document.createElement("div");

    bubble.className = "bubble";


    const text =
        document.createElement("div");

    text.textContent = message.text;


    const time =
        document.createElement("div");

    time.className = "time";


    if (message.createdAt) {

        time.textContent =
            message.createdAt
                .toDate()
                .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });

    } else {

        time.textContent = "Sending...";
    }


    bubble.appendChild(text);
    bubble.appendChild(time);

    row.appendChild(bubble);

    $("messages").appendChild(row);
}


// =====================================================
// SEND MESSAGE
// =====================================================

$("messageForm").addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const input =
            $("message");

        const text =
            input.value.trim();

        const user =
            auth.currentUser;


        if (!text || !user) {
            return;
        }


        input.value = "";


        try {

            await addDoc(
                collection(db, "messages"),
                {
                    text: text,

                    senderUid:
                        user.uid,

                    senderEmail:
                        user.email,

                    createdAt:
                        serverTimestamp()
                }
            );

        } catch (error) {

            console.error(
                "Message sending error:",
                error
            );

            alert(
                "Message could not be sent. Check Firestore rules."
            );

            input.value = text;
        }
    }
);


// =====================================================
// EMOJI
// =====================================================

$("emoji").onclick = () => {

    $("emojiPanel")
        .classList
        .toggle("hidden");
};


document
    .querySelectorAll("#emojiPanel button")
    .forEach((button) => {

        button.onclick = () => {

            $("message").value +=
                button.textContent;

            $("message").focus();

            $("emojiPanel")
                .classList
                .add("hidden");
        };
    });


// =====================================================
// FIREBASE ERROR MESSAGES
// =====================================================

function getFirebaseError(code) {

    const errors = {

        "auth/invalid-credential":
            "Email or password is incorrect.",

        "auth/user-not-found":
            "User does not exist.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/invalid-email":
            "Please enter a valid email.",

        "auth/email-already-in-use":
            "This email already has an account.",

        "auth/weak-password":
            "Password should be at least 6 characters.",

        "auth/network-request-failed":
            "Check your internet connection."
    };

    return errors[code] ||
        "Something went wrong. Check the browser console.";
}


// =====================================================
// FLOATING HEARTS
// =====================================================

setInterval(() => {

    const heart =
        document.createElement("div");

    heart.className = "heart";

    heart.textContent =
        ["❤️", "💕", "✨", "💗"][
            Math.floor(Math.random() * 4)
        ];

    heart.style.left =
        Math.random() * 100 + "vw";

    heart.style.fontSize =
        14 + Math.random() * 18 + "px";

    heart.style.animationDuration =
        5 + Math.random() * 5 + "s";

    $("hearts").appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 10000);

}, 900);
