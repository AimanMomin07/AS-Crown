import {
  Request,
  Response
} from "express";

import path from "path";

import fs from "fs/promises";

import pool from "../config/database.js";


function getUserId(
  req: any
) {
  const id =
    Number(
      req.user?.id
    );

  return Number.isInteger(id) &&
    id > 0
    ? id
    : 0;
}


/* =========================================================
   RESIDENT / AUTHENTICATED DOCUMENTS
========================================================= */

export async function getDocuments(
  req: Request,
  res: Response
) {

  try {

    const category =
      String(
        req.query.category ||
        ""
      ).trim();

    const search =
      String(
        req.query.search ||
        ""
      ).trim();

    const conditions:
      string[] = [
        "d.is_public = 1"
      ];

    const params:
      any[] = [];


    if (
      category
    ) {

      conditions.push(
        "d.category = ?"
      );

      params.push(
        category
      );

    }


    if (
      search
    ) {

      conditions.push(
        `
        (
          d.title LIKE ?
          OR d.description LIKE ?
          OR d.file_name LIKE ?
        )
        `
      );

      const value =
        `%${search}%`;

      params.push(
        value,
        value,
        value
      );

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          d.id,
          d.title,
          d.category,
          d.description,
          d.file_name,
          d.file_url,
          d.file_type,
          d.file_size,
          d.is_public,
          d.uploaded_by,
          d.created_at,
          d.updated_at,

          CONCAT_WS(
            ' ',
            u.first_name,
            u.last_name
          ) AS uploader_name

        FROM society_documents d

        LEFT JOIN users u
          ON u.id = d.uploaded_by

        WHERE
          ${conditions.join(
            " AND "
          )}

        ORDER BY
          d.created_at DESC,
          d.id DESC
        `,
        params
      );


    return res.json({

      success:
        true,

      data: {
        documents:
          rows
      }

    });

  } catch (
    error
  ) {

    console.error(
      "Get documents error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve documents"
    });

  }

}

export async function downloadDocument(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID"
      });
    }

    const userId = getUserId(req);
    const role = String((req as any).user?.role || "");
    const [rows] = await pool.execute(
      `SELECT file_name, file_url, is_public
       FROM society_documents
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    const document = (rows as {
      file_name: string;
      file_url: string;
      is_public: number;
    }[])[0];

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    if (role !== "admin" && !document.is_public) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to download this document"
      });
    }

    const relativePath = String(document.file_url || "").replace(/^\/+/, "");
    const documentsRoot = path.resolve(process.cwd(), "uploads", "documents");
    const absolutePath = path.resolve(process.cwd(), relativePath);

    if (!absolutePath.startsWith(`${documentsRoot}${path.sep}`)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document path"
      });
    }

    return res.download(absolutePath, document.file_name);
  } catch (error) {
    console.error("Download document error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to download document"
    });
  }
}


/* =========================================================
   ADMIN → ALL DOCUMENTS
========================================================= */

export async function getAllDocuments(
  req: Request,
  res: Response
) {

  try {

    const category =
      String(
        req.query.category ||
        ""
      ).trim();

    const search =
      String(
        req.query.search ||
        ""
      ).trim();

    const conditions:
      string[] = [
        "1 = 1"
      ];

    const params:
      any[] = [];


    if (
      category
    ) {

      conditions.push(
        "d.category = ?"
      );

      params.push(
        category
      );

    }


    if (
      search
    ) {

      conditions.push(
        `
        (
          d.title LIKE ?
          OR d.description LIKE ?
          OR d.file_name LIKE ?
        )
        `
      );

      const value =
        `%${search}%`;

      params.push(
        value,
        value,
        value
      );

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT

          d.*,

          CONCAT_WS(
            ' ',
            u.first_name,
            u.last_name
          ) AS uploader_name

        FROM society_documents d

        LEFT JOIN users u
          ON u.id = d.uploaded_by

        WHERE
          ${conditions.join(
            " AND "
          )}

        ORDER BY
          d.created_at DESC,
          d.id DESC
        `,
        params
      );


    return res.json({

      success:
        true,

      data: {
        documents:
          rows
      }

    });

  } catch (
    error
  ) {

    console.error(
      "Get all documents error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve documents"
    });

  }

}


/* =========================================================
   CREATE DOCUMENT
========================================================= */

export async function createDocument(
  req: any,
  res: Response
) {

  try {

    const userId =
      getUserId(
        req
      );


    if (
      !userId
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
      });

    }


    if (
      !req.file
    ) {

      return res.status(400).json({
        success: false,
        message:
          "A document file is required"
      });

    }


    const title =
      String(
        req.body?.title ||
        ""
      ).trim();

    const category =
      String(
        req.body?.category ||
        "other"
      ).trim();

    const description =
      String(
        req.body?.description ||
        ""
      ).trim();

    const isPublic =
      req.body?.isPublic === "false" ||
      req.body?.isPublic === false
        ? 0
        : 1;


    const allowedCategories = [
      "rules",
      "notice",
      "meeting",
      "maintenance",
      "legal",
      "financial",
      "other"
    ];


    if (
      !title
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Document title is required"
      });

    }


    if (
      !allowedCategories.includes(
        category
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid document category"
      });

    }


    const relativeUrl =
      `/uploads/documents/${req.file.filename}`;


    const [
      result
    ] =
      await pool.execute(
        `
        INSERT INTO society_documents
        (
          title,
          category,
          description,
          file_name,
          file_url,
          file_type,
          file_size,
          is_public,
          uploaded_by
        )

        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [
          title,
          category,
          description ||
            null,
          req.file.originalname,
          relativeUrl,
          req.file.mimetype ||
            null,
          Number(
            req.file.size ||
            0
          ),
          isPublic,
          userId
        ]
      );


    return res.status(201).json({

      success:
        true,

      message:
        "Document uploaded successfully",

      data: {
        id:
          Number(
            (result as any)
              .insertId
          ),

        fileUrl:
          relativeUrl

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Create document error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to upload document"
    });

  }

}


/* =========================================================
   UPDATE DOCUMENT
========================================================= */

export async function updateDocument(
  req: Request,
  res: Response
) {

  try {

    const id =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid document ID"
      });

    }


    const title =
      String(
        req.body?.title ||
        ""
      ).trim();

    const category =
      String(
        req.body?.category ||
        "other"
      ).trim();

    const description =
      String(
        req.body?.description ||
        ""
      ).trim();

    const isPublic =
      req.body?.isPublic === false ||
      req.body?.isPublic === "false"
        ? 0
        : 1;


    const allowedCategories = [
      "rules",
      "notice",
      "meeting",
      "maintenance",
      "legal",
      "financial",
      "other"
    ];


    if (
      !title
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Document title is required"
      });

    }


    if (
      !allowedCategories.includes(
        category
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid document category"
      });

    }


    const [
      result
    ] =
      await pool.execute(
        `
        UPDATE society_documents

        SET
          title = ?,
          category = ?,
          description = ?,
          is_public = ?,
          updated_at =
            CURRENT_TIMESTAMP

        WHERE
          id = ?
        `,
        [
          title,
          category,
          description ||
            null,
          isPublic,
          id
        ]
      );


    if (
      !(result as any)
        .affectedRows
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Document not found"
      });

    }


    return res.json({
      success: true,
      message:
        "Document updated successfully"
    });

  } catch (
    error
  ) {

    console.error(
      "Update document error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update document"
    });

  }

}


/* =========================================================
   DELETE DOCUMENT
========================================================= */

export async function deleteDocument(
  req: Request,
  res: Response
) {

  try {

    const id =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid document ID"
      });

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT
          file_url

        FROM society_documents

        WHERE
          id = ?

        LIMIT 1
        `,
        [
          id
        ]
      );


    const document =
      (
        rows as any[]
      )[0];


    if (
      !document
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Document not found"
      });

    }


    await pool.execute(
      `
      DELETE FROM society_documents

      WHERE
        id = ?
      `,
      [
        id
      ]
    );


    const relativePath =
      String(
        document.file_url ||
        ""
      ).replace(
        /^\/+/,
        ""
      );


    if (
      relativePath
    ) {

      const absolutePath =
        path.join(
          process.cwd(),
          relativePath
        );

      try {

        await fs.unlink(
          absolutePath
        );

      } catch (
        fileError: any
      ) {

        if (
          fileError?.code !==
          "ENOENT"
        ) {

          console.warn(
            "Unable to remove document file:",
            fileError
          );

        }

      }

    }


    return res.json({
      success: true,
      message:
        "Document deleted successfully"
    });

  } catch (
    error
  ) {

    console.error(
      "Delete document error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete document"
    });

  }

}
