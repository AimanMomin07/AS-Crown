import fs from "fs";
import path from "path";

import {
  cert,
  getApp,
  getApps,
  initializeApp
} from "firebase-admin/app";

import {
  getAuth
} from "firebase-admin/auth";


function getServiceAccount() {

  const configuredPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    "./config/firebase-service-account.json";


  const absolutePath =
    path.isAbsolute(
      configuredPath
    )
      ? configuredPath
      : path.resolve(
          process.cwd(),
          configuredPath
        );


  if (
    !fs.existsSync(
      absolutePath
    )
  ) {

    throw new Error(
      `Firebase service account file not found: ${absolutePath}`
    );

  }


  return JSON.parse(
    fs.readFileSync(
      absolutePath,
      "utf8"
    )
  );

}


const firebaseApp =
  getApps().length
    ? getApp()
    : initializeApp({

        credential:
          cert(
            getServiceAccount()
          )

      });


export const firebaseAdminAuth =
  getAuth(
    firebaseApp
  );
