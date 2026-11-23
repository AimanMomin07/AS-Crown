import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import type {
  ChangeEvent,
  CSSProperties,
  ReactNode
} from "react";

import {
  UserCircle,
  ShieldCheck,
  CalendarDays,
  RefreshCw,
  Save,
  Camera,
  LockKeyhole
} from "lucide-react";

import {
  getAdminUser,
  updateAdminUser,
  uploadAdminProfileImage
} from "../../api/admin.api";

import {
  useAuth
} from "../../context/AuthContext";


interface Profile {

  id: number;

  first_name: string;

  last_name?: string | null;

  email?: string | null;

  mobile?: string | null;

  phone?: string | null;

  profile_image?: string | null;

  status: string;

  role_name?: string;

  created_at: string;

}

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


export default function AdminProfile() {

  const {
    user
  } = useAuth();


  const [
    profile,
    setProfile
  ] =
    useState<Profile | null>(
      null
    );


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    saving,
    setSaving
  ] =
    useState(false);


  const [
    photoSaving,
    setPhotoSaving
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    success,
    setSuccess
  ] =
    useState("");


  const [
    firstName,
    setFirstName
  ] =
    useState("");


  const [
    lastName,
    setLastName
  ] =
    useState("");


  const [
    mobile,
    setMobile
  ] =
    useState("");


  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  const loadProfile = useCallback(async function loadProfile() {

    if (
      !user?.id
    ) {

      setLoading(false);

      return;

    }


    try {

      setLoading(true);

      setError("");


      const response =
        await getAdminUser(
          Number(
            user.id
          )
        );


      const data =
        response?.data?.user ||
        null;


      setProfile(
        data
      );


      setFirstName(
        data?.first_name ||
        ""
      );


      setLastName(
        data?.last_name ||
        ""
      );


      setMobile(
        data?.mobile ||
        data?.phone ||
        ""
      );

    } catch (
      requestError: unknown
    ) {

      console.error(
        "Load admin profile error:",
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to load profile."));

    } finally {

      setLoading(false);

    }

  }, [user]);


  useEffect(() => {

    void loadProfile();

  }, [
    loadProfile
  ]);


  /* =========================================================
     SAVE TEXT PROFILE
  ========================================================= */

  async function handleSave() {

    if (
      !user?.id
    ) {

      setError(
        "Administrator session not found."
      );

      return;

    }


    if (
      !firstName.trim()
    ) {

      setError(
        "First name is required."
      );

      return;

    }


    try {

      setSaving(true);

      setError("");

      setSuccess("");


      const response =
        await updateAdminUser(
          Number(
            user.id
          ),
          {

            firstName:
              firstName.trim(),

            lastName:
              lastName.trim(),

            mobile:
              mobile.trim()

          }
        );


      const updatedUser =
        response
          ?.data
          ?.user;


      if (
        updatedUser
      ) {

        setProfile(
          current =>
            current
              ? {

                  ...current,

                  first_name:
                    updatedUser.first_name ||
                    firstName.trim(),

                  last_name:
                    updatedUser.last_name ??
                    lastName.trim(),

                  mobile:
                    updatedUser.mobile ??
                    mobile.trim()

                }
              : current
        );

      }


      setSuccess(
        "Profile updated successfully."
      );


      /*
       * Reload from MySQL so the screen
       * always shows the actual saved value.
       */
      await loadProfile();

    } catch (
      requestError: unknown
    ) {

      console.error(
        "Update profile error:",
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to update profile."));

    } finally {

      setSaving(false);

    }

  }


  /* =========================================================
     OPEN PHOTO PICKER
  ========================================================= */

  function openPhotoPicker() {

    if (
      photoSaving
    ) {

      return;

    }


    fileInputRef.current?.click();

  }


  /* =========================================================
     UPLOAD PHOTO
  ========================================================= */

  async function handlePhotoSelect(
    event:
      ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    /*
     * Clear the browser file input so
     * selecting the same image again
     * still triggers onChange.
     */
    event.target.value =
      "";


    if (
      !file
    ) {

      return;

    }


    setError("");

    setSuccess("");


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      setError(
        "Only JPG, PNG and WEBP images are allowed."
      );

      return;

    }


    if (
      file.size >
      2 * 1024 * 1024
    ) {

      setError(
        "Profile image must be 2 MB or smaller."
      );

      return;

    }


    if (
      !user?.id
    ) {

      setError(
        "Administrator session not found."
      );

      return;

    }


    try {

      setPhotoSaving(true);


      const response =
        await uploadAdminProfileImage(
          Number(
            user.id
          ),
          file
        );


      const savedImage =
        response
          ?.data
          ?.profileImage;


      /*
       * IMPORTANT:
       * Do NOT use URL.createObjectURL()
       * here. The server has now stored
       * the actual image.
       */

      if (
        savedImage
      ) {

        setProfile(
          current =>
            current
              ? {

                  ...current,

                  profile_image:
                    savedImage

                }
              : current
        );

      }


      setSuccess(
        "Profile photo saved successfully."
      );


      /*
       * Fetch the saved database value
       * so the image remains correct after
       * a refresh/navigation.
       */
      await loadProfile();

    } catch (
      requestError: unknown
    ) {

      console.error(
        "Upload profile photo error:",
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to save profile photo."));

    } finally {

      setPhotoSaving(false);

    }

  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading
  ) {

    return (

      <div
        style={
          loadingPage
        }
      >

        Loading profile...

      </div>

    );

  }


  /* =========================================================
     UI
  ========================================================= */

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

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={
            header
          }
        >

          <div>

            <div
              style={
                eyebrow
              }
            >
              ACCOUNT
            </div>


            <h1
              style={
                heading
              }
            >
              My Profile
            </h1>


            <p
              style={
                subtitle
              }
            >
              Manage your administrator account.
            </p>

          </div>


          <button
            type="button"

            onClick={() =>
              void loadProfile()
            }

            disabled={
              loading ||
              saving ||
              photoSaving
            }

            style={
              refreshButton
            }
          >

            <RefreshCw
              size={
                16
              }
            />

            Refresh

          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            style={
              errorBox
            }
          >

            {error}

          </div>

        )}


        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (

          <div
            style={
              successBox
            }
          >

            {success}

          </div>

        )}


        {/* =================================================
            MAIN
        ================================================= */}

        <div
          style={
            mainGrid
          }
        >

          {/* =================================================
              PHOTO
          ================================================= */}

          <section
            style={
              photoCard
            }
          >

            <div
              style={
                avatar
              }
            >

              {profile?.profile_image ? (

                <img
                  key={
                    profile.profile_image
                  }

                  src={
                    getImageUrl(
                      profile.profile_image
                    )
                  }

                  alt="Administrator profile"

                  style={
                    avatarImage
                  }

                  onError={
                    event => {

                      event.currentTarget.style.display =
                        "none";

                    }
                  }
                />

              ) : (

                <span>

                  {
                    profile?.first_name
                      ?.charAt(0)
                      .toUpperCase() ||
                    "A"
                  }

                </span>

              )}

            </div>


            <h2
              style={
                profileName
              }
            >

              {
                profile?.first_name ||
                "Administrator"
              }{" "}

              {
                profile?.last_name ||
                ""
              }

            </h2>


            <div
              style={
                roleText
              }
            >

              {
                profile?.role_name ||
                "Administrator"
              }

            </div>


            <button
              type="button"

              onClick={
                openPhotoPicker
              }

              disabled={
                photoSaving
              }

              style={{
                ...photoButton,

                opacity:
                  photoSaving
                    ? 0.7
                    : 1,

                cursor:
                  photoSaving
                    ? "not-allowed"
                    : "pointer"
              }}
            >

              <Camera
                size={
                  17
                }
              />

              {
                photoSaving
                  ? "Uploading..."
                  : "Change Photo"
              }

            </button>


            <input
              ref={
                fileInputRef
              }

              type="file"

              accept=
                "image/jpeg,image/png,image/webp"

              onChange={
                handlePhotoSelect
              }

              style={{
                display:
                  "none"
              }}
            />


            <p
              style={
                photoHint
              }
            >
              JPG, PNG or WEBP
              <br />
              Maximum 2 MB
            </p>

          </section>


          {/* =================================================
              PROFILE FORM
          ================================================= */}

          <section
            style={
              formCard
            }
          >

            <div
              style={
                sectionHeader
              }
            >

              <div>

                <div
                  style={
                    cardEyebrow
                  }
                >
                  ACCOUNT INFORMATION
                </div>


                <h2
                  style={
                    sectionTitle
                  }
                >
                  Personal Details
                </h2>


                <p
                  style={
                    sectionDescription
                  }
                >
                  Update the information that can be changed by the administrator.
                </p>

              </div>


              <ShieldCheck
                size={
                  25
                }

                color="#2563eb"
              />

            </div>


            <div
              style={
                twoColumns
              }
            >

              <Field
                label="First Name"
                value={
                  firstName
                }

                onChange={
                  setFirstName
                }

                required
              />


              <Field
                label="Last Name"
                value={
                  lastName
                }

                onChange={
                  setLastName
                }
              />

            </div>


            <Field
              label="Mobile"
              value={
                mobile
              }

              onChange={
                setMobile
              }
            />


            {/* EMAIL */}

            <div
              style={
                fieldWrapper
              }
            >

              <label
                style={
                  fieldLabel
                }
              >

                Email


                <div
                  style={
                    lockedField
                  }
                >

                  <span>
                    {
                      profile?.email ||
                      "—"
                    }
                  </span>


                  <LockKeyhole
                    size={
                      15
                    }

                    color="#94a3b8"
                  />

                </div>

              </label>

            </div>


            {/* ROLE + STATUS */}

            <div
              style={
                twoColumns
              }
            >

              <ReadOnlyInfo
                icon={
                  <ShieldCheck
                    size={
                      17
                    }
                  />
                }

                label="Role"

                value={
                  profile?.role_name ||
                  "Administrator"
                }
              />


              <ReadOnlyInfo
                icon={
                  <UserCircle
                    size={
                      17
                    }
                  />
                }

                label="Status"

                value={
                  profile?.status ||
                  "—"
                }
              />

            </div>


            <ReadOnlyInfo
              icon={
                <CalendarDays
                  size={
                    17
                  }
                />
              }

              label="Account Created"

              value={
                profile?.created_at
                  ? new Date(
                      profile.created_at
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : "—"
              }
            />


            <div
              style={
                saveRow
              }
            >

              <button
                type="button"

                onClick={() =>
                  void handleSave()
                }

                disabled={
                  saving ||
                  photoSaving
                }

                style={{
                  ...saveButton,

                  opacity:
                    saving ||
                    photoSaving
                      ? 0.7
                      : 1,

                  cursor:
                    saving ||
                    photoSaving
                      ? "not-allowed"
                      : "pointer"
                }}
              >

                <Save
                  size={
                    17
                  }
                />

                {
                  saving
                    ? "Saving..."
                    : "Save Changes"
                }

              </button>

            </div>

          </section>


          {/* =================================================
              ACCOUNT SUMMARY
          ================================================= */}

          <section
            style={
              summaryCard
            }
          >

            <div
              style={
                cardEyebrow
              }
            >
              ACCOUNT STATUS
            </div>


            <div
              style={
                summaryRow
              }
            >

              <ReadOnlyInfo
                icon={
                  <UserCircle
                    size={
                      17
                    }
                  />
                }

                label="Administrator"

                value={
                  `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
                  "Administrator"
                }
              />


              <ReadOnlyInfo
                icon={
                  <ShieldCheck
                    size={
                      17
                    }
                  />
                }

                label="Account Status"

                value={
                  profile?.status ||
                  "active"
                }
              />

            </div>

          </section>

        </div>

      </div>

    </div>

  );

}


/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(
  image:
    string
) {

  if (
    !image
  ) {

    return "";

  }


  /*
   * Full URL returned by server.
   */
  if (
    image.startsWith(
      "http://"
    ) ||
    image.startsWith(
      "https://"
    ) ||
    image.startsWith(
      "data:"
    ) ||
    image.startsWith(
      "blob:"
    )
  ) {

    return image;

  }


  /*
   * Our backend normally stores:
   * /uploads/profile/filename.jpg
   */
  if (
    image.startsWith(
      "/"
    )
  ) {

    return `http://localhost:5000${image}`;

  }


  return `http://localhost:5000/${image}`;

}


/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  required = false
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;

  required?:
    boolean;
}) {

  return (

    <div
      style={
        fieldWrapper
      }
    >

      <label
        style={
          fieldLabel
      }
      >

        {label}


        <input
          type="text"

          value={
            value
          }

          required={
            required
          }

          onChange={
            event =>
              onChange(
                event.target.value
              )
          }

          style={
            input
          }
        />

      </label>

    </div>

  );

}


/* =========================================================
   READ ONLY INFO
========================================================= */

function ReadOnlyInfo({
  icon,
  label,
  value
}: {
  icon:
    ReactNode;

  label:
    string;

  value:
    string;
}) {

  return (

    <div
      style={
        info
      }
    >

      <div
        style={
          infoIcon
        }
      >
        {icon}
      </div>


      <div
        style={
          infoContent
        }
      >

        <div
          style={
            infoLabel
          }
        >
          {label}
        </div>


        <strong>
          {value}
        </strong>

      </div>

    </div>

  );

}


/* =========================================================
   STYLES
========================================================= */

const page:
  CSSProperties = {

    minHeight:
      "calc(100vh - 72px)",

    background:
      "#f8fafc",

    padding:
      28,

    boxSizing:
      "border-box"

  };


const container:
  CSSProperties = {

    maxWidth:
      1100,

    margin:
      "0 auto"

  };


const loadingPage:
  CSSProperties = {

    minHeight:
      "70vh",

    display:
      "grid",

    placeItems:
      "center",

    color:
      "#64748b"

  };


const header:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      15,

    flexWrap:
      "wrap",

    marginBottom:
      22

  };


const eyebrow:
  CSSProperties = {

    fontSize:
      11,

    fontWeight:
      800,

    letterSpacing:
      1.5,

    color:
      "#2563eb"

  };


const heading:
  CSSProperties = {

    margin:
      "5px 0",

    fontSize:
      30,

    color:
      "#0f172a"

  };


const subtitle:
  CSSProperties = {

    margin:
      0,

    color:
      "#64748b"

  };


const refreshButton:
  CSSProperties = {

    height:
      42,

    padding:
      "0 14px",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    background:
      "white",

    color:
      "#334155",

    display:
      "inline-flex",

    alignItems:
      "center",

    gap:
      7,

    fontWeight:
      700

  };


const errorBox:
  CSSProperties = {

    padding:
      13,

    marginBottom:
      15,

    borderRadius:
      10,

    background:
      "#fef2f2",

    color:
      "#b91c1c",

    border:
      "1px solid #fecaca"

  };


const successBox:
  CSSProperties = {

    padding:
      13,

    marginBottom:
      15,

    borderRadius:
      10,

    background:
      "#ecfdf5",

    color:
      "#047857",

    border:
      "1px solid #a7f3d0"

  };


const mainGrid:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "290px minmax(0,1fr)",

    gap:
      18

  };


const photoCard:
  CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      18,

    padding:
      24,

    textAlign:
      "center",

    height:
      "fit-content"

  };


const avatar:
  CSSProperties = {

    width:
      120,

    height:
      120,

    margin:
      "0 auto 15px",

    borderRadius:
      "50%",

    overflow:
      "hidden",

    background:
      "#dbeafe",

    color:
      "#1d4ed8",

    border:
      "4px solid white",

    boxShadow:
      "0 0 0 1px #dbeafe",

    display:
      "grid",

    placeItems:
      "center",

    fontSize:
      42,

    fontWeight:
      800

  };


const avatarImage:
  CSSProperties = {

    width:
      "100%",

    height:
      "100%",

    objectFit:
      "cover"

  };


const profileName:
  CSSProperties = {

    margin:
      0,

    fontSize:
      20,

    color:
      "#0f172a"

  };


const roleText:
  CSSProperties = {

    color:
      "#64748b",

    fontSize:
      12,

    marginTop:
      4,

    marginBottom:
      16

  };


const photoButton:
  CSSProperties = {

    width:
      "100%",

    height:
      42,

    border:
      "1px solid #bfdbfe",

    borderRadius:
      9,

    background:
      "#eff6ff",

    color:
      "#1d4ed8",

    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      7,

    fontWeight:
      700

  };


const photoHint:
  CSSProperties = {

    margin:
      "13px 0 0",

    color:
      "#94a3b8",

    fontSize:
      11,

    lineHeight:
      1.5

  };


const formCard:
  CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      18,

    padding:
      28

  };


const summaryCard:
  CSSProperties = {

    gridColumn:
      "1 / -1",

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      18,

    padding:
      24

  };


const sectionHeader:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap:
      15,

    paddingBottom:
      20,

    marginBottom:
      20,

    borderBottom:
      "1px solid #f1f5f9"

  };


const cardEyebrow:
  CSSProperties = {

    fontSize:
      10,

    fontWeight:
      800,

    letterSpacing:
      1.3,

    color:
      "#2563eb"

  };


const sectionTitle:
  CSSProperties = {

    margin:
      "5px 0 0",

    fontSize:
      20,

    color:
      "#0f172a"

  };


const sectionDescription:
  CSSProperties = {

    margin:
      "4px 0 0",

    color:
      "#64748b",

    fontSize:
      13

  };


const twoColumns:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",

    gap:
      14

  };


const fieldWrapper:
  CSSProperties = {

    marginBottom:
      16

  };


const fieldLabel:
  CSSProperties = {

    display:
      "block",

    fontSize:
      13,

    fontWeight:
      700,

    color:
      "#334155"

  };


const input:
  CSSProperties = {

    width:
      "100%",

    height:
      44,

    marginTop:
      6,

    boxSizing:
      "border-box",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    padding:
      "0 12px",

    background:
      "white",

    outline:
      "none"

  };


const lockedField:
  CSSProperties = {

    width:
      "100%",

    height:
      44,

    marginTop:
      6,

    boxSizing:
      "border-box",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    padding:
      "0 12px",

    background:
      "#f8fafc",

    color:
      "#64748b",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between"

  };


const info:
  CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      10,

    marginBottom:
      15

  };


const infoIcon:
  CSSProperties = {

    width:
      36,

    height:
      36,

    borderRadius:
      9,

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


const infoContent:
  CSSProperties = {

    minWidth:
      0

  };


const infoLabel:
  CSSProperties = {

    fontSize:
      10,

    color:
      "#94a3b8",

    fontWeight:
      800,

    marginBottom:
      3

  };


const saveRow:
  CSSProperties = {

    marginTop:
      8,

    paddingTop:
      18,

    borderTop:
      "1px solid #f1f5f9",

    display:
      "flex",

    justifyContent:
      "flex-end"

  };


const saveButton:
  CSSProperties = {

    height:
      44,

    padding:
      "0 18px",

    border:
      0,

    borderRadius:
      9,

    background:
      "#2563eb",

    color:
      "white",

    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      8,

    fontWeight:
      700

  };


const summaryRow:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",

    gap:
      20,

    marginTop:
      18

  };