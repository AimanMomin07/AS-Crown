import {
  getApp,
  getApps,
  initializeApp
} from "firebase/app";

import {
  getAuth
} from "firebase/auth";


let authInstance:
  ReturnType<typeof getAuth> |
  null = null;


function getConfig() {

  const config = {

    apiKey:
      import.meta.env.VITE_FIREBASE_API_KEY,

    authDomain:
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

    projectId:
      import.meta.env.VITE_FIREBASE_PROJECT_ID,

    storageBucket:
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

    messagingSenderId:
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

    appId:
      import.meta.env.VITE_FIREBASE_APP_ID

  };


  const missing =
    Object.entries(
      config
    )
      .filter(
        ([, value]) =>
          !String(
            value ||
            ""
          ).trim()
      )
      .map(
        ([key]) =>
          key
      );


  if (
    missing.length
  ) {

    throw new Error(
      `Firebase configuration is incomplete. Missing: ${missing.join(", ")}`
    );

  }


  return config;

}


export function getFirebaseAuth() {

  if (
    authInstance
  ) {

    return authInstance;

  }


  const app =
    getApps().length
      ? getApp()
      : initializeApp(
          getConfig()
        );


  authInstance =
    getAuth(
      app
    );


  return authInstance;

}
