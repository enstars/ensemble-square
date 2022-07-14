// ./initAuth.js
import { init } from "next-firebase-auth";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import "firebase/compat/auth";

const parseKey = (key) => {
  return key?.replace(/\\n/g, "\n") || undefined;
};

// Config & Initialization
const firebaseConfig = {
  apiKey: "AIzaSyA530zKJVq_vi56gzta4J_jGWIxgCIJg2k",
  authDomain: "ensemble-square.firebaseapp.com",
  projectId: "ensemble-square",
  storageBucket: "ensemble-square.appspot.com",
  messagingSenderId: "940403567905",
  appId: "1:940403567905:web:51d666cacd10e979cb2260",
  measurementId: "G-L1FLXJKQC5",
};

const initAuth = () => {
  init({
    authPageURL: "/login",
    appPageURL: "/",
    loginAPIEndpoint: "/api/login", // required
    logoutAPIEndpoint: "/api/logout", // required
    onLoginRequestError: (err) => {
      console.error(err);
    },
    onLogoutRequestError: (err) => {
      console.error(err);
    },
    // firebaseAuthEmulatorHost: "localhost:9099",
    firebaseAdminInitConfig: {
      credential: {
        projectId: "ensemble-square",
        clientEmail:
          "firebase-adminsdk-ftvei@ensemble-square.iam.gserviceaccount.com",
        // The private key must not be accessible on the client side.
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? parseKey(process.env.FIREBASE_PRIVATE_KEY)
          : undefined,
      },
      //   databaseURL: "https://my-example-app.firebaseio.com",
    },
    // Use application default credentials (takes precedence over firebaseAdminInitConfig if set)
    // useFirebaseAdminDefaultCredential: true,
    firebaseClientInitConfig: firebaseConfig,
    cookies: {
      name: "MakoTools", // required
      // Keys are required unless you set `signed` to `false`.
      // The keys cannot be accessible on the client side.
      keys: [
        process.env.COOKIE_SECRET_CURRENT,
        process.env.COOKIE_SECRET_PREVIOUS,
      ],
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
      overwrite: true,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "development" ? false : true, // set this to false in local (non-HTTPS) development
      signed: true,
    },
    onVerifyTokenError: (err) => {
      console.error(err);
    },
    onTokenRefreshError: (err) => {
      console.error(err);
    },
  });
};

export default initAuth;

// const firebaseApp = initializeApp(firebaseConfig);

// Authentication
const clientAuth = getAuth();
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const appSignInWithGoogle = () =>
  signInWithRedirect(clientAuth, provider);
export const appSignOut = () => signOut(clientAuth);

export const appSignInWithEmailAndPassword = (
  email,
  password,
  callback = () => {}
) =>
  signInWithEmailAndPassword(clientAuth, email, password)
    .then((result) => {
      //   syncFirestoreUserData(result.user);
    })
    .catch((error) => {
      callback({ status: "error", error });
    });
export const appSignUpWithEmailAndPassword = (
  email,
  password,
  userInfo,
  callback = () => {}
) => {
  createUserWithEmailAndPassword(clientAuth, email, password)
    .then((result) => {
      //   syncFirestoreUserData(result.user, callback, userInfo);
      // console.log(0);
    })
    .catch((error) => {
      // console.log(callback);
      callback({ status: "error", error });
    });
};

// Firestore Database
const db = getFirestore();

// getRedirectResult(clientAuth)
//   .then((result) => {
//     if (result) {
//       const { user } = result;
//       // console.log(user);
//       syncFirestoreUserData(user);
//     }
//   })
//   .catch((e) => {
//     console.error(e);
//   });

// function syncFirestoreUserData(user, callback = () => {}, userInfo = {}) {
//   // console.log(user);
//   setFirestoreUserData(
//     {
//       ...userInfo,
//       // googleUser: JSON.stringify(user),
//       user: JSON.stringify(user),
//       // i actually have no idea if this is safe. but this should be only public info so
//       lastLogin: serverTimestamp(),
//     },
//     user.uid
//   );
// }

function setFirestoreUserData(
  data,
  uid = clientAuth?.currentUser?.uid || null
) {
  if (uid) setDoc(doc(db, "users", uid), data, { merge: true });
}

async function getFirestoreUserData(uid = clientAuth.currentUser.uid) {
  const docSnap = await getDoc(doc(db, "users", uid));

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data;
  }
  return null;
}

async function validateUsernameDb(username) {
  const q = query(collection(db, "users"), where("username", "==", username));
  const querySnap = await getDocs(q);
  const usernameValid = !!!querySnap.size;
  return usernameValid;
}

export { setFirestoreUserData, getFirestoreUserData, validateUsernameDb };