import multer from "multer";

import path from "path";

import fs from "fs";


const uploadDirectory =
  path.join(
    process.cwd(),
    "uploads",
    "documents"
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


const storage =
  multer.diskStorage({

    destination(
      _req,
      _file,
      callback
    ) {

      callback(
        null,
        uploadDirectory
      );

    },

    filename(
      _req,
      file,
      callback
    ) {

      const extension =
        path.extname(
          file.originalname
        );

      const base =
        path
          .basename(
            file.originalname,
            extension
          )
          .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
          )
          .slice(
            0,
            60
          );


      callback(
        null,
        `${Date.now()}-${base || "document"}${extension.toLowerCase()}`
      );

    }

  });


const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];


const upload =
  multer({

    storage,

    limits: {
      fileSize:
        10 *
        1024 *
        1024
    },

    fileFilter(
      _req,
      file,
      callback
    ) {

      if (
        allowedMimeTypes.includes(
          file.mimetype
        )
      ) {

        callback(
          null,
          true
        );

      } else {

        callback(
          new Error(
            "Only PDF, image, DOC and DOCX files are allowed."
          )
        );

      }

    }

  });


export default upload;
