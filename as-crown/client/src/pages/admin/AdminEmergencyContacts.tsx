import {
  useCallback,
  useEffect,
  useState
} from "react";

import type {
  FormEvent

} from "react";

import {
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X
} from "lucide-react";

import {
  createEmergencyContact,
  deleteEmergencyContact,
  getAllEmergencyContacts,
  updateEmergencyContact
} from "../../api/emergency-contacts.api";

import type {
  EmergencyContact,
  EmergencyContactCategory
} from "../../api/emergency-contacts.api";


const CATEGORY_OPTIONS:
  {
    value: EmergencyContactCategory;
    label: string;
  }[] = [

  {
    value: "Police",
    label: "Police"
  },

  {
    value: "Fire",
    label: "Fire"
  },

  {
    value: "Ambulance",
    label: "Ambulance"
  },

  {
    value: "Security",
    label: "Security"
  },

  {
    value: "Society Office",
    label: "Society Office"
  },

  {
    value: "Other",
    label: "Other"
  }

];


interface FormState {
  name: string;
  phone: string;
  category: EmergencyContactCategory;
  priority: string;
  isActive: boolean;
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


const emptyForm:
  FormState = {

  name:
    "",

  phone:
    "",

  category:
    "Security",

  priority:
    "1",

  isActive:
    true

};


export default function AdminEmergencyContacts() {

  const [
    contacts,
    setContacts
  ] =
    useState<
      EmergencyContact[]
    >([]);


  const [
    form,
    setForm
  ] =
    useState<
      FormState
    >(
      emptyForm
    );


  const [
    editingId,
    setEditingId
  ] =
    useState<
      number |
      null
    >(null);


  const [
    showForm,
    setShowForm
  ] =
    useState(false);


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
    error,
    setError
  ] =
    useState("");


  const [
    success,
    setSuccess
  ] =
    useState("");


  const load =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError("");

          const response =
            await getAllEmergencyContacts();

          setContacts(
            response
              ?.data
              ?.contacts ||
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
              "Unable to load emergency contacts."
            )
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      []
    );


  useEffect(() => {

    void load();

  }, [
    load
  ]);


  function openCreate() {

    setEditingId(
      null
    );

    setForm(
      emptyForm
    );

    setShowForm(
      true
    );

    setError("");
    setSuccess("");

  }


  function openEdit(
    contact:
      EmergencyContact
  ) {

    const category =
      CATEGORY_OPTIONS.some(
        item =>
          item.value ===
          contact.category
      )
        ? contact.category as
            EmergencyContactCategory
        : "Other";


    setEditingId(
      contact.id
    );


    setForm({

      name:
        contact.name,

      phone:
        contact.phone,

      category,

      priority:
        String(
          contact.priority
        ),

      isActive:
        Boolean(
          contact.is_active
        )

    });


    setShowForm(
      true
    );

    setError("");
    setSuccess("");

  }


  async function handleSubmit(
    event:
      FormEvent
  ) {

    event.preventDefault();


    try {

      setSaving(
        true
      );

      setError("");
      setSuccess("");


      const payload = {

        name:
          form.name.trim(),

        phone:
          form.phone.trim(),

        category:
          form.category,

        priority:
          Math.max(
            1,
            Number(
              form.priority
            ) || 1
          ),

        isActive:
          form.isActive

      };


      if (
        editingId
      ) {

        await updateEmergencyContact(
          editingId,
          payload
        );

        setSuccess(
          "Emergency contact updated successfully."
        );

      } else {

        await createEmergencyContact(
          payload
        );

        setSuccess(
          "Emergency contact created successfully."
        );

      }


      setShowForm(
        false
      );

      setEditingId(
        null
      );

      setForm(
        emptyForm
      );

      await load();

    } catch (
      requestError: unknown
    ) {

      console.error(
        requestError
      );

      setError(
        getErrorMessage(
          requestError,
          "Unable to save emergency contact."
        )
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  async function handleDelete(
    id:
      number
  ) {

    if (
      !window.confirm(
        "Delete this emergency contact?"
      )
    ) {

      return;

    }


    try {

      setError("");
      setSuccess("");

      await deleteEmergencyContact(
        id
      );

      setSuccess(
        "Emergency contact deleted."
      );

      await load();

    } catch (
      requestError: unknown
    ) {

      console.error(
        requestError
      );

      setError(
        getErrorMessage(
          requestError,
          "Unable to delete emergency contact."
        )
      );

    }

  }


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
          }
        >

          <div>

            <div
              style={
                eyebrow
              }
            >
              SAFETY MANAGEMENT
            </div>

            <h1
              style={
                title
              }
            >
              Emergency Contacts
            </h1>

            <p
              style={
                subtitle
              }
            >
              Manage the numbers residents and security can call immediately.
            </p>

          </div>


          <div
            style={
              headerActions
            }
          >

            <button
              type="button"
              onClick={() =>
                void load()
              }
              style={
                secondaryButton
              }
            >
              <RefreshCw size={15}/>
              Refresh
            </button>


            <button
              type="button"
              onClick={
                openCreate
              }
              style={
                primaryButton
              }
            >
              <Plus size={16}/>
              Add Contact
            </button>

          </div>

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


        {
          success &&
          (
            <div
              style={
                successBox
              }
            >
              {success}
            </div>
          )
        }


        {
          showForm &&
          (
            <form
              onSubmit={
                handleSubmit
              }
              style={
                formCard
              }
            >

              <div
                style={
                  formHeader
                }
              >

                <strong>
                  {
                    editingId
                      ? "Edit Emergency Contact"
                      : "New Emergency Contact"
                  }
                </strong>


                <button
                  type="button"
                  onClick={() =>
                    setShowForm(
                      false
                    )
                  }
                  style={
                    iconButton
                  }
                >
                  <X size={17}/>
                </button>

              </div>


              <div
                style={
                  twoColumns
                }
              >

                <Field
                  label="Name"
                  value={
                    form.name
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          name:
                            value
                        })
                      )
                  }
                />


                <Field
                  label="Phone"
                  value={
                    form.phone
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          phone:
                            value
                        })
                      )
                  }
                />


                <label
                  style={
                    labelStyle
                  }
                >

                  <span>
                    Category
                  </span>

                  <select
                    value={
                      form.category
                    }
                    onChange={
                      event =>
                        setForm(
                          current => ({
                            ...current,
                            category:
                              event
                                .target
                                .value as EmergencyContactCategory
                          })
                        )
                    }
                    style={
                      input
                    }
                  >

                    {
                      CATEGORY_OPTIONS.map(
                        option => (

                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>

                        )
                      )
                    }

                  </select>

                </label>


                <Field
                  label="Priority"
                  type="number"
                  value={
                    form.priority
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          priority:
                            value
                        })
                      )
                  }
                />


                <label
                  style={
                    checkboxLabel
                  }
                >

                  <input
                    type="checkbox"
                    checked={
                      form.isActive
                    }
                    onChange={
                      event =>
                        setForm(
                          current => ({
                            ...current,
                            isActive:
                              event
                                .target
                                .checked
                          })
                        )
                    }
                  />

                  Active contact

                </label>

              </div>


              <div
                style={
                  formActions
                }
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(
                      false
                    )
                  }
                  style={
                    secondaryButton
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  style={
                    primaryButton
                  }
                >

                  <Save size={15}/>

                  {
                    saving
                      ? "Saving..."
                      : editingId
                        ? "Update Contact"
                        : "Create Contact"
                  }

                </button>

              </div>

            </form>
          )
        }


        <section
          style={
            tableCard
          }
        >

          {
            loading

              ? (

                <div
                  style={
                    empty
                  }
                >
                  <RefreshCw size={25}/>
                  Loading contacts...
                </div>

              )

              : contacts.length ===
                0

                ? (

                  <div
                    style={
                      empty
                    }
                  >
                    No emergency contacts configured.
                  </div>

                )

                : (

                  <div
                    style={
                      tableWrap
                    }
                  >

                    <table
                      style={
                        table
                      }
                    >

                      <thead>

                        <tr>

                          <th
                            style={
                              th
                            }
                          >
                            Contact
                          </th>

                          <th
                            style={
                              th
                            }
                          >
                            Category
                          </th>

                          <th
                            style={
                              th
                            }
                          >
                            Phone
                          </th>

                          <th
                            style={
                              th
                            }
                          >
                            Priority
                          </th>

                          <th
                            style={
                              th
                            }
                          >
                            Status
                          </th>

                          <th
                            style={
                              th
                            }
                          >
                            Actions
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {
                          contacts.map(
                            contact => (

                              <tr
                                key={
                                  contact.id
                                }
                              >

                                <td
                                  style={
                                    td
                                  }
                                >
                                  <strong>
                                    {
                                      contact.name
                                    }
                                  </strong>
                                </td>


                                <td
                                  style={
                                    td
                                  }
                                >
                                  {
                                    contact.category
                                  }
                                </td>


                                <td
                                  style={
                                    td
                                  }
                                >
                                  {
                                    contact.phone
                                  }
                                </td>


                                <td
                                  style={
                                    td
                                  }
                                >
                                  {
                                    contact.priority
                                  }
                                </td>


                                <td
                                  style={
                                    td
                                  }
                                >

                                  <span
                                    style={
                                      contact.is_active
                                        ? activeBadge
                                        : inactiveBadge
                                    }
                                  >
                                    {
                                      contact.is_active
                                        ? "Active"
                                        : "Inactive"
                                    }
                                  </span>

                                </td>


                                <td
                                  style={
                                    td
                                  }
                                >

                                  <div
                                    style={
                                      actionRow
                                    }
                                  >

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEdit(
                                          contact
                                        )
                                      }
                                      style={
                                        editButton
                                      }
                                    >
                                      <Pencil size={14}/>
                                      Edit
                                    </button>


                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleDelete(
                                          contact.id
                                        )
                                      }
                                      style={
                                        deleteButton
                                      }
                                    >
                                      <Trash2 size={14}/>
                                      Delete
                                    </button>

                                  </div>

                                </td>

                              </tr>

                            )
                          )
                        }

                      </tbody>

                    </table>

                  </div>

                )
          }

        </section>

      </div>

    </div>

  );
}


function Field({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange:
    (
      value: string
    ) => void;
  type?: string;
}) {

  return (

    <label
      style={
        labelStyle
      }
    >

      <span>
        {label}
      </span>

      <input
        required={
          label ===
            "Name" ||
          label ===
            "Phone"
        }
        type={
          type
        }
        value={
          value
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

  );

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
    15,

  flexWrap:
    "wrap",

  marginBottom:
    18

};


const headerActions:
  React.CSSProperties = {

  display:
    "flex",

  gap:
    8

};


const eyebrow:
  React.CSSProperties = {

  color:
    "#dc2626",

  fontSize:
    11,

  fontWeight:
    800,

  letterSpacing:
    1.4

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


const primaryButton:
  React.CSSProperties = {

  border:
    0,

  background:
    "#2563eb",

  color:
    "white",

  borderRadius:
    9,

  padding:
    "10px 13px",

  display:
    "inline-flex",

  gap:
    7,

  alignItems:
    "center",

  cursor:
    "pointer",

  fontWeight:
    800

};


const secondaryButton:
  React.CSSProperties = {

  border:
    "1px solid #e2e8f0",

  background:
    "white",

  color:
    "#334155",

  borderRadius:
    9,

  padding:
    "10px 13px",

  display:
    "inline-flex",

  gap:
    7,

  alignItems:
    "center",

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


const successBox:
  React.CSSProperties = {

  background:
    "#ecfdf5",

  color:
    "#047857",

  border:
    "1px solid #a7f3d0",

  borderRadius:
    10,

  padding:
    12,

  marginBottom:
    12

};


const formCard:
  React.CSSProperties = {

  background:
    "white",

  border:
    "1px solid #e2e8f0",

  borderRadius:
    16,

  padding:
    18,

  marginBottom:
    14

};


const formHeader:
  React.CSSProperties = {

  display:
    "flex",

  justifyContent:
    "space-between",

  alignItems:
    "center",

  marginBottom:
    15

};


const twoColumns:
  React.CSSProperties = {

  display:
    "grid",

  gridTemplateColumns:
    "repeat(2,minmax(0,1fr))",

  gap:
    12

};


const labelStyle:
  React.CSSProperties = {

  display:
    "grid",

  gap:
    6,

  fontSize:
    11,

  color:
    "#475569",

  fontWeight:
    700

};


const input:
  React.CSSProperties = {

  width:
    "100%",

  height:
    40,

  boxSizing:
    "border-box",

  border:
    "1px solid #e2e8f0",

  borderRadius:
    9,

  padding:
    "0 10px",

  background:
    "white",

  outline:
    "none"

};


const checkboxLabel:
  React.CSSProperties = {

  alignSelf:
    "end",

  height:
    40,

  display:
    "flex",

  alignItems:
    "center",

  gap:
    7,

  fontSize:
    11,

  color:
    "#475569",

  fontWeight:
    700

};


const formActions:
  React.CSSProperties = {

  display:
    "flex",

  justifyContent:
    "flex-end",

  gap:
    8,

  marginTop:
    15

};


const iconButton:
  React.CSSProperties = {

  border:
    "1px solid #e2e8f0",

  background:
    "white",

  borderRadius:
    8,

  width:
    34,

  height:
    34,

  display:
    "grid",

  placeItems:
    "center",

  cursor:
    "pointer"

};


const tableCard:
  React.CSSProperties = {

  background:
    "white",

  border:
    "1px solid #e2e8f0",

  borderRadius:
    16,

  overflow:
    "hidden"

};


const tableWrap:
  React.CSSProperties = {

  overflowX:
    "auto"

};


const table:
  React.CSSProperties = {

  width:
    "100%",

  minWidth:
    850,

  borderCollapse:
    "collapse"

};


const th:
  React.CSSProperties = {

  textAlign:
    "left",

  padding:
    13,

  fontSize:
    10,

  color:
    "#64748b",

  background:
    "#f8fafc",

  borderBottom:
    "1px solid #e2e8f0",

  textTransform:
    "uppercase"

};


const td:
  React.CSSProperties = {

  padding:
    13,

  fontSize:
    12,

  borderBottom:
    "1px solid #f1f5f9",

  color:
    "#334155",

  verticalAlign:
    "top"

};


const activeBadge:
  React.CSSProperties = {

  display:
    "inline-flex",

  padding:
    "5px 9px",

  borderRadius:
    999,

  background:
    "#ecfdf5",

  color:
    "#047857",

  fontWeight:
    800,

  fontSize:
    9

};


const inactiveBadge:
  React.CSSProperties = {

  display:
    "inline-flex",

  padding:
    "5px 9px",

  borderRadius:
    999,

  background:
    "#f1f5f9",

  color:
    "#64748b",

  fontWeight:
    800,

  fontSize:
    9

};


const actionRow:
  React.CSSProperties = {

  display:
    "flex",

  gap:
    6,

  flexWrap:
    "wrap"

};


const editButton:
  React.CSSProperties = {

  border:
    "1px solid #bfdbfe",

  background:
    "#eff6ff",

  color:
    "#1d4ed8",

  borderRadius:
    8,

  padding:
    "7px 9px",

  display:
    "inline-flex",

  gap:
    5,

  alignItems:
    "center",

  cursor:
    "pointer",

  fontSize:
    10,

  fontWeight:
    800

};


const deleteButton:
  React.CSSProperties = {

  border:
    "1px solid #fecaca",

  background:
    "#fef2f2",

  color:
    "#b91c1c",

  borderRadius:
    8,

  padding:
    "7px 9px",

  display:
    "inline-flex",

  gap:
    5,

  alignItems:
    "center",

  cursor:
    "pointer",

  fontSize:
    10,

  fontWeight:
    800

};


const empty:
  React.CSSProperties = {

  minHeight:
    250,

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