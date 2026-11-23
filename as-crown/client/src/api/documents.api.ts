import api from "./axios";


export type DocumentCategory =
  | "rules"
  | "notice"
  | "meeting"
  | "maintenance"
  | "legal"
  | "financial"
  | "other";


export interface SocietyDocument {

  id: number;

  title: string;

  category:
    DocumentCategory;

  description:
    string | null;

  file_name:
    string;

  file_url:
    string;

  file_type:
    string | null;

  file_size:
    number | null;

  is_public:
    number;

  uploaded_by:
    number;

  uploader_name?:
    string | null;

  created_at:
    string;

  updated_at:
    string;

}


export async function getDocuments(
  params?: {
    category?:
      DocumentCategory;

    search?:
      string;
  }
) {

  const response =
    await api.get(
      "/documents",
      {
        params
      }
    );

  return response.data;

}


export async function getAllDocuments(
  params?: {
    category?:
      DocumentCategory;

    search?:
      string;
  }
) {

  const response =
    await api.get(
      "/documents/admin/all",
      {
        params
      }
    );

  return response.data;

}

export async function downloadDocument(
  id: number,
  fileName: string
) {
  const response = await api.get(
    `/documents/${id}/download`,
    {
      responseType: "blob"
    }
  );

  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}


export async function uploadDocument(
  data: {
    title:
      string;

    category:
      DocumentCategory;

    description?:
      string;

    isPublic?:
      boolean;

    file:
      File;
  }
) {

  const formData =
    new FormData();

  formData.append(
    "title",
    data.title
  );

  formData.append(
    "category",
    data.category
  );

  formData.append(
    "description",
    data.description ||
    ""
  );

  formData.append(
    "isPublic",
    String(
      data.isPublic !==
      false
    )
  );

  formData.append(
    "document",
    data.file
  );


  const response =
    await api.post(
      "/documents",
      formData
    );


  return response.data;

}


export async function updateDocument(
  id:
    number,

  data: {
    title:
      string;

    category:
      DocumentCategory;

    description?:
      string;

    isPublic?:
      boolean;
  }
) {

  const response =
    await api.put(
      `/documents/${id}`,
      data
    );

  return response.data;

}


export async function deleteDocument(
  id:
    number
) {

  const response =
    await api.delete(
      `/documents/${id}`
    );

  return response.data;

}
