import multer
  from "multer";

import fs
  from "fs";

import path
  from "path";


/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory =
  path.join(
    process.cwd(),
    "uploads",
    "profile"
  );


if (
  !fs.existsSync(
    uploadDirectory
  )
) {

  fs.mkdirSync(
    uploadDirectory,
    {
      recursive:
        true
    }
  );

}


/* =========================================================
   STORAGE
========================================================= */

const storage =
  multer.diskStorage({

    destination:
      (
        _req,
        _file,
        callback
      ) => {

        callback(
          null,
          uploadDirectory
        );

      },


    filename:
      (
        _req,
        file,
        callback
      ) => {

        const extension =
          path.extname(
            file.originalname
          ).toLowerCase();


        const uniqueName =
          `profile-${Date.now()}-${Math.round(
            Math.random() *
            1_000_000
          )}${extension}`;


        callback(
          null,
          uniqueName
        );

      }

  });


/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter:
  multer.Options["fileFilter"] =
  (
    _req,
    file,
    callback
  ) => {

    const allowedTypes = [

      "image/jpeg",

      "image/png",

      "image/webp"

    ];


    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {

      callback(
        null,
        true
      );

      return;

    }


    callback(
      new Error(
        "Only JPG, PNG and WEBP images are allowed"
      )
    );

  };


/* =========================================================
   MULTER
========================================================= */

const upload =
  multer({

    storage,

    fileFilter,

    limits: {

      fileSize:
        2 *
        1024 *
        1024

    }

  });


export default upload;