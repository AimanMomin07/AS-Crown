import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Download,
  FileText,
  RefreshCw,
  Search
} from "lucide-react";

import {
  downloadDocument,
  getDocuments
} from "../../api/documents.api";

import type {
  DocumentCategory,
  SocietyDocument
} from "../../api/documents.api";

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;
    if (typeof response === "object" && response !== null && "data" in response) {
      const data = response.data;
      if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
        return data.message;
      }
    }
  }
  return fallback;
}


const categories:
  {
    value:
      DocumentCategory;

    label:
      string;
  }[] = [

  {
    value:
      "rules",
    label:
      "Society Rules"
  },

  {
    value:
      "notice",
    label:
      "Notice"
  },

  {
    value:
      "meeting",
    label:
      "Meeting"
  },

  {
    value:
      "maintenance",
    label:
      "Maintenance"
  },

  {
    value:
      "legal",
    label:
      "Legal"
  },

  {
    value:
      "financial",
    label:
      "Financial"
  },

  {
    value:
      "other",
    label:
      "Other"
  }

];


export default function ResidentDocuments() {

  const [
    documents,
    setDocuments
  ] =
    useState<
      SocietyDocument[]
    >([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    search,
    setSearch
  ] =
    useState("");


  const [
    category,
    setCategory
  ] =
    useState<
      DocumentCategory |
      ""
    >("");


  const load =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError("");


          const response =
            await getDocuments({

              category:
                category ||
                undefined,

              search:
                search.trim() ||
                undefined

            });


          setDocuments(
            response
              ?.data
              ?.documents ||
            []
          );

        } catch (
          requestError: unknown
        ) {

          console.error(
            requestError
          );

          setError(
            getErrorMessage(
              requestError,
              "Unable to load documents."
            )
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      [
        category,
        search
      ]
    );


  useEffect(
    () => {

      const timer =
        window.setTimeout(
          () => {
            void load();
          },
          250
        );


      return () =>
        window.clearTimeout(
          timer
        );

    },
    [
      load
    ]
  );


  return (

    <div
      style={
        page
      }
    >

      <div
        style={
          container
        }
      >

        <header
          style={
            header
          }>

          <div>

            <div
              style={
                eyebrow
              }
            >
              SOCIETY DOCUMENTS
            </div>

            <h1
              style={
                title
              }
            >
              Documents
            </h1>

            <p
              style={
                subtitle
              }
            >
              Rules, notices and important society records.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              void load()
            }
            style={
              refresh
            }
          >
            <RefreshCw size={15}/>
            Refresh
          </button>

        </header>


        {
          error &&
          (
            <div
              style={
                errorBox
              }
            >
              {error}
            </div>
          )
        }


        <section
          style={
            toolbar
          }
        >

          <div
            style={
              searchWrap
            }
          >

            <Search size={15}/>

            <input
              value={
                search
              }
              onChange={
                event =>
                  setSearch(
                    event
                      .target
                      .value
                  )
              }
              placeholder="Search documents..."
              style={
                searchInput
              }
            />

          </div>


          <select
            value={
              category
            }
            onChange={
              event =>
                setCategory(
                  event
                    .target
                    .value as
                    DocumentCategory |
                    ""
                )
            }
            style={
              select
            }
          >

            <option value="">
              All categories
            </option>

            {
              categories.map(
                item => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                )
              )
            }

          </select>

        </section>


        {
          loading

            ? (
              <div
                style={
                  empty
                }
              >
                <RefreshCw size={25}/>
                Loading documents...
              </div>
            )

            : documents.length ===
              0

              ? (
                <div
                  style={
                    empty
                  }
                >
                  <FileText
                    size={32}
                  />
                  <strong>
                    No documents available.
                  </strong>
                </div>
              )

              : (
                <div
                  style={
                    grid
                  }
                >

                  {
                    documents.map(
                      document => (

                        <article
                          key={
                            document.id
                          }
                          style={
                            card
                          }
                        >

                          <div
                            style={
                              iconWrap
                            }
                          >
                            <FileText
                              size={21}
                            />
                          </div>


                          <div
                            style={
                              content
                            }
                          >

                            <div
                              style={
                                categoryLabel
                              }
                            >
                              {
                                document.category
                              }
                            </div>


                            <h2
                              style={
                                cardTitle
                              }
                            >
                              {
                                document.title
                              }
                            </h2>


                            {
                              document.description &&
                              (
                                <p
                                  style={
                                    description
                                  }
                                >
                                  {
                                    document.description
                                  }
                                </p>
                              )
                            }


                            <div
                              style={
                                meta
                              }
                            >
                              {
                                document.file_name
                              }

                              {
                                document.file_size
                                  ? ` · ${formatBytes(
                                      document.file_size
                                    )}`
                                  : ""
                              }
                            </div>


                            <button
                              type="button"
                              onClick={() => void downloadDocument(document.id, document.file_name)}
                              style={
                                openButton
                              }
                            >
                              <Download size={14}/>
                              Open / Download
                            </button>

                          </div>

                        </article>

                      )
                    )
                  }

                </div>
              )
        }

      </div>

    </div>
  );
}


function formatBytes(
  bytes:
    number
) {

  if (
    !bytes
  ) {
    return "0 B";
  }

  const units =
    [
      "B",
      "KB",
      "MB",
      "GB"
    ];

  const index =
    Math.floor(
      Math.log(
        bytes
      ) /
      Math.log(
        1024
      )
    );

  return `${(
    bytes /
    Math.pow(
      1024,
      index
    )
  ).toFixed(
    1
  )} ${units[index]}`;
}


const page:
  React.CSSProperties = {
    minHeight:
      "100vh",
    background:
      "#f8fafc",
    padding:
      28
  };

const container:
  React.CSSProperties = {
    maxWidth:
      1200,
    margin:
      "0 auto"
  };

const header:
  React.CSSProperties = {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-end",
    gap:
      12,
    flexWrap:
      "wrap",
    marginBottom:
      18
  };

const eyebrow:
  React.CSSProperties = {
    fontSize:
      10,
    fontWeight:
      900,
    letterSpacing:
      1.4,
    color:
      "#2563eb"
  };

const title:
  React.CSSProperties = {
    margin:
      "5px 0",
    fontSize:
      30
  };

const subtitle:
  React.CSSProperties = {
    margin:
      0,
    color:
      "#64748b"
  };

const refresh:
  React.CSSProperties = {
    border:
      "1px solid #e2e8f0",
    background:
      "white",
    borderRadius:
      9,
    padding:
      "10px 13px",
    display:
      "inline-flex",
    alignItems:
      "center",
    gap:
      7,
    cursor:
      "pointer",
    fontWeight:
      700
  };

const errorBox:
  React.CSSProperties = {
    background:
      "#fef2f2",
    color:
      "#b91c1c",
    border:
      "1px solid #fecaca",
    borderRadius:
      10,
    padding:
      12,
    marginBottom:
      12
  };

const toolbar:
  React.CSSProperties = {
    display:
      "flex",
    gap:
      8,
    alignItems:
      "center",
    flexWrap:
      "wrap",
    background:
      "white",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      14,
    padding:
      12,
    marginBottom:
      14
  };

const searchWrap:
  React.CSSProperties = {
    flex:
      1,
    minWidth:
      230,
    display:
      "flex",
    alignItems:
      "center",
    gap:
      7,
    border:
      "1px solid #e2e8f0",
    borderRadius:
      9,
    padding:
      "0 10px",
    height:
      40
  };

const searchInput:
  React.CSSProperties = {
    border:
      0,
    outline:
      "none",
    flex:
      1,
    height:
      "100%"
  };

const select:
  React.CSSProperties = {
    height:
      40,
    border:
      "1px solid #e2e8f0",
    borderRadius:
      9,
    padding:
      "0 10px",
    background:
      "white"
  };

const grid:
  React.CSSProperties = {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap:
      14
  };

const card:
  React.CSSProperties = {
    background:
      "white",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      16,
    padding:
      16,
    display:
      "flex",
    gap:
      12
  };

const iconWrap:
  React.CSSProperties = {
    width:
      45,
    height:
      45,
    borderRadius:
      12,
    background:
      "#eff6ff",
    color:
      "#2563eb",
    display:
      "grid",
    placeItems:
      "center",
    flexShrink:
      0
  };

const content:
  React.CSSProperties = {
    minWidth:
      0,
    flex:
      1
  };

const categoryLabel:
  React.CSSProperties = {
    fontSize:
      9,
    textTransform:
      "uppercase",
    fontWeight:
      900,
    letterSpacing:
      1,
    color:
      "#2563eb"
  };

const cardTitle:
  React.CSSProperties = {
    margin:
      "4px 0",
    fontSize:
      17,
    color:
      "#0f172a"
  };

const description:
  React.CSSProperties = {
    color:
      "#64748b",
    fontSize:
      11,
    lineHeight:
      1.5
  };

const meta:
  React.CSSProperties = {
    color:
      "#94a3b8",
    fontSize:
      10,
    margin:
      "8px 0 11px",
    wordBreak:
      "break-word"
  };

const openButton:
  React.CSSProperties = {
    textDecoration:
      "none",
    background:
      "#2563eb",
    color:
      "white",
    borderRadius:
      8,
    padding:
      "8px 10px",
    display:
      "inline-flex",
    alignItems:
      "center",
    gap:
      6,
    fontSize:
      10,
    fontWeight:
      800
  };

const empty:
  React.CSSProperties = {
    minHeight:
      280,
    background:
      "white",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      16,
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    flexDirection:
      "column",
    gap:
      8,
    color:
      "#94a3b8"
  };
