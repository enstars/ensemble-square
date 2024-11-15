// ./initAuth.js
import { init } from "next-firebase-auth";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateEmail,
  updatePassword,
  reauthenticateWithPopup,
} from "firebase/auth";

const parseKey = (key: string) => {
  return key?.replace(/\\n/g, "\n")?.replace(/'/g, "");
};

// Config & Initialization
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const defaultCallback = console.error;

export function initAuthentication() {
  try {
    initializeApp(firebaseConfig);
    init({
      authPageURL: "/login",
      appPageURL: "/",
      firebaseAdminInitConfig: {
        credential: {
          projectId: "ensemble-square",
          clientEmail:
            "firebase-adminsdk-ftvei@ensemble-square.iam.gserviceaccount.com",
          // The private key must not be accessible on the client side.
          privateKey: parseKey(process.env.FIREBASE_PRIVATE_KEY || ""),
        },
        databaseURL: "",
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
        console.error("token error", err);
      },
      onTokenRefreshError: (err) => {
        console.error(err);
      },
      tokenChangedHandler: async (authUser) => {
        const { loginAPIEndpoint, logoutAPIEndpoint } = {
          loginAPIEndpoint: "/api/login", // required
          logoutAPIEndpoint: "/api/logout", // required
        };
        let response;
        // If the user is authed, call login to set a cookie.
        if (authUser.id) {
          const userToken = (await authUser.getIdToken()) || "";
          response = await fetch(loginAPIEndpoint, {
            method: "POST",
            headers: [["Authorization", userToken]],
            credentials: "include",
          });
          if (!response.ok) {
            const responseJSON = await response.json();
            throw new Error(
              `Received ${
                response.status
              } response from login API endpoint: ${JSON.stringify(
                responseJSON
              )}`
            );
          }
        } else {
          // If the user is not authed, call logout to unset the cookie.
          response = await fetch(logoutAPIEndpoint, {
            method: "POST",
            credentials: "include",
          });
          if (response.ok) {
            // window.location.reload();
          } else {
            const responseJSON = await response.json();
            throw new Error(
              `Received ${
                response.status
              } response from logout API endpoint: ${JSON.stringify(
                responseJSON
              )}`
            );
          }
        }
        return response;
      },
    });
  } catch (e) {
    console.error(e);
  }
}

export function signInWithGoogle(errorCallback = defaultCallback) {
  try {
    const clientAuth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    signInWithPopup(clientAuth, provider);
  } catch (error) {
    errorCallback(error);
    console.error(error);
  }
}

export function signInWithTwitter(errorCallback = defaultCallback) {
  const clientAuth = getAuth();
  const provider = new TwitterAuthProvider();
  provider.setCustomParameters({ force_login: "true" });
  signInWithPopup(clientAuth, provider).catch(errorCallback);
}

export function signInWithEmail(
  email: string,
  password: string,
  errorCallback = defaultCallback
) {
  try {
    const clientAuth = getAuth();
    signInWithEmailAndPassword(clientAuth, email, password);
  } catch (error) {
    errorCallback(error);
    console.error(error);
  }
}

export function signUpWithEmail(
  email: string,
  password: string,
  errorCallback = defaultCallback
) {
  try {
    const clientAuth = getAuth();
    createUserWithEmailAndPassword(clientAuth, email, password);
  } catch (error) {
    errorCallback(error);
    console.error(error);
  }
}

export async function bindEmailForTwitterUser() {
  const clientAuth = getAuth();
  const provider = new TwitterAuthProvider();
  provider.setCustomParameters({ force_login: "true" });

  if (clientAuth.currentUser !== null) {
    const provider = new TwitterAuthProvider();
    provider.setCustomParameters({ force_login: "true" });
    try {
      await reauthenticateWithPopup(clientAuth.currentUser, provider);
    } catch (e) {
      console.error(e);
      return null;
    }
    return (email: string, password: string) => {
      if (clientAuth.currentUser) {
        updateEmail(clientAuth.currentUser, email);
        updatePassword(clientAuth.currentUser, password);
      }
    };
  }
  return null;
}
