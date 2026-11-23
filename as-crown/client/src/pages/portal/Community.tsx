import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import type { CSSProperties, ChangeEvent } from "react";
import {
  CalendarDays,
  Camera,
  Check,
  FileText,
  Image,
  MapPin,
  MessageCircle,
  Mic,
  Paperclip,
  Pin,
  Plus,
  RefreshCw,
  Reply,
  Send,
  Square,
  UserPlus,
  Users,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { socket, joinCommunity, leaveCommunity } from "../../realtime/socket";
import {
  addCommunityMember,
  createCommunityGroup,
  createCommunityMeeting,
  getCommunityGroups,
  joinCommunityGroup,
  getCommunityMembers,
  getCommunityMeetingRsvps,
  getCommunityMeetings,
  getCommunityMessages,
  removeCommunityMember,
  rsvpCommunityMeeting,
  sendCommunityMessage,
  toggleCommunityPin,
  toggleCommunityReaction
} from "../../api/community.api";

interface Group {
  id: number;
  name: string;
  description?: string | null;
  membership_status?: string | null;
}

interface Member {
  id: number;
  user_id: number;
  status: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface Message {
  id: number;
  user_id: number;
  user_name: string;
  group_id: number;
  parent_message_id: number | null;
  is_pinned: number;
  pinned_at: string | null;
  pinned_by: number | null;
  message_type: "text" | "image" | "file" | "voice";
  message_text?: string | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
  created_at: string;
  reaction_count?: number;
  reply_count?: number;
  reactions?: { reaction: string; count: number }[];
  myReactions?: string[];
}

interface Meeting {
  id: number;
  group_id: number;
  title: string;
  description: string | null;
  agenda: string | null;
  meeting_date: string;
  meeting_time: string;
  location: string | null;
  status: "scheduled" | "cancelled" | "completed";
  creator_name?: string;
  attending_count?: number;
}

const reactionOptions = ["👍", "❤️", "😂", "⚠️", "👏", "✅"];

export default function Community() {
  const { user } = useAuth();
  const role = user?.role || user?.role_name;
  const isAdmin = role === "admin";
  const canModerate = role === "admin" || role === "committee";
  const canManageMembers = isAdmin || role === "committee";

  const [groups, setGroups] = useState<Group[]>([]);
  const [active, setActive] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<number | null>(null);
  const [myRsvp, setMyRsvp] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [memberUserId, setMemberUserId] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"chat" | "meetings">("chat");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    agenda: "",
    meetingDate: "",
    meetingTime: "",
    location: ""
  });

  const galleryRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCommunityGroups();
      const nextGroups = response?.data?.groups || [];
      setGroups(nextGroups);
      setActive((current) => current && nextGroups.some((g: Group) => g.id === current.id)
        ? nextGroups.find((g: Group) => g.id === current.id) || null
        : nextGroups[0] || null);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to load community groups.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!active) return;
    try {
      const response = await getCommunityMessages(active.id);
      setMessages(response?.data?.messages || []);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to load community messages.");
    }
  }, [active]);

  const loadMembers = useCallback(async () => {
    if (!active || !canManageMembers) return;
    try {
      const response = await getCommunityMembers(active.id);
      setMembers(response?.data?.members || []);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to load community members.");
    }
  }, [active, canManageMembers]);

  const loadMeetings = useCallback(async () => {
    if (!active) return;
    try {
      const response = await getCommunityMeetings(active.id);
      setMeetings(response?.data?.meetings || []);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to load meetings.");
    }
  }, [active]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    setMessages([]); setMeetings([]); setReplyTo(null); setActiveMeeting(null);
    void loadMessages(); void loadMembers(); void loadMeetings();
    if (!active) return;
    joinCommunity(active.id);
    const onMessage = (message: Message) => { if (Number(message.group_id) === Number(active.id)) setMessages(current => current.some(m => m.id === message.id) ? current : [...current, message]); };
    const onReaction = () => { void loadMessages(); };
    const onPin = () => { void loadMessages(); };
    const onMeeting = () => { void loadMeetings(); };
    socket.on("community:message", onMessage); socket.on("community:reaction", onReaction); socket.on("community:pin", onPin); socket.on("community:meeting", onMeeting);
    return () => { leaveCommunity(active.id); socket.off("community:message", onMessage); socket.off("community:reaction", onReaction); socket.off("community:pin", onPin); socket.off("community:meeting", onMeeting); };
  }, [active, loadMessages, loadMembers, loadMeetings]);

  async function joinGroup(groupId:number) {
    try { setError(""); await joinCommunityGroup(groupId); setSuccess("Joined the community group."); await loadGroups(); } catch (requestError:any) { setError(requestError?.response?.data?.message || "Unable to join group."); }
  }

  async function createGroup() {
    if (!groupName.trim()) return;
    try {
      setCreatingGroup(true);
      setError("");
      await createCommunityGroup({ name: groupName.trim(), description: groupDescription.trim() || undefined });
      setGroupName("");
      setGroupDescription("");
      setSuccess("Community group created.");
      await loadGroups();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to create group.");
    } finally {
      setCreatingGroup(false);
    }
  }

  async function addMember() {
    const id = Number(memberUserId);
    if (!active || !Number.isInteger(id) || id <= 0) return;
    try {
      setError("");
      await addCommunityMember(active.id, id);
      setMemberUserId("");
      setSuccess("Member access granted.");
      await loadMembers();
      await loadGroups();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to add member.");
    }
  }

  async function removeMember(userId: number) {
    if (!active) return;
    try {
      await removeCommunityMember(active.id, userId);
      await loadMembers();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to remove member.");
    }
  }

  async function send(message = text, attachment?: File | Blob, name?: string) {
    if (!active || (!message.trim() && !attachment)) return;
    try {
      setSending(true);
      setError("");
      await sendCommunityMessage(active.id, message, attachment, name, replyTo?.id || null);
      setText("");
      setReplyTo(null);
      await loadMessages();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to send community message.");
    } finally {
      setSending(false);
    }
  }

  async function handleAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await send("", file, file.name);
  }

  async function startVoiceRecording() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is not supported by this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setRecording(false);
        await send("", blob, `voice-${Date.now()}.webm`);
      };
      recorder.start();
      setRecording(true);
      setError("");
    } catch (requestError) {
      console.error(requestError);
      setError("Microphone access was unavailable.");
    }
  }

  async function react(messageId: number, emoji: string) {
    try {
      await toggleCommunityReaction(messageId, emoji);
      await loadMessages();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to update reaction.");
    }
  }

  async function pin(messageId: number) {
    try {
      await toggleCommunityPin(messageId);
      await loadMessages();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to pin message.");
    }
  }

  async function createMeeting() {
    if (!active || !meetingForm.title.trim() || !meetingForm.meetingDate || !meetingForm.meetingTime) return;
    try {
      await createCommunityMeeting(active.id, {
        title: meetingForm.title.trim(),
        description: meetingForm.description.trim() || undefined,
        agenda: meetingForm.agenda.trim() || undefined,
        meetingDate: meetingForm.meetingDate,
        meetingTime: meetingForm.meetingTime,
        location: meetingForm.location.trim() || undefined
      });
      setMeetingForm({ title: "", description: "", agenda: "", meetingDate: "", meetingTime: "", location: "" });
      setSuccess("Meeting created and members notified.");
      await loadMeetings();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to create meeting.");
    }
  }

  async function openRsvp(meeting: Meeting) {
    try {
      const response = await getCommunityMeetingRsvps(meeting.id);
      setMyRsvp(response?.data?.myResponse || null);
      setActiveMeeting(meeting.id);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to load meeting details.");
    }
  }

  async function rsvp(response: "attending" | "not_attending" | "maybe") {
    if (!activeMeeting) return;
    try {
      await rsvpCommunityMeeting(activeMeeting, response);
      setMyRsvp(response);
      await loadMeetings();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to update RSVP.");
    }
  }

  function renderAttachment(message: Message) {
    if (!message.attachment_url) return null;
    const url = message.attachment_url;
    if (message.message_type === "image") {
      return <img src={url} alt={message.attachment_name || "Community attachment"} style={attachmentImage} />;
    }
    if (message.message_type === "voice") return <audio controls src={url} style={audio} />;
    return <a href={url} target="_blank" rel="noreferrer" style={fileLink}><FileText size={16} />{message.attachment_name || "Open attachment"}</a>;
  }

  return (
    <div style={page}>
      <div style={container}>
        <div style={header}>
          <div>
            <div style={eyebrow}>AS CROWN COMMUNITY</div>
            <h1 style={title}>Society Community</h1>
            <p style={subtitle}>Discuss issues, share evidence, plan meetings and keep residents connected.</p>
          </div>
          <div style={headerActions}>
            <button type="button" onClick={() => { void loadGroups(); void loadMeetings(); }} style={secondary}><RefreshCw size={16} /> Refresh</button>
          </div>
        </div>

        {error && <div style={errorBox}>{error}</div>}
        {success && <div style={successBox}>{success}</div>}

        <div style={layout}>
          <aside style={sidebar}>
            <div style={sectionTitle}><Users size={16} /> Groups</div>
            {loading ? <div style={muted}>Loading groups...</div> : groups.length === 0 ? <div style={muted}>No groups yet.</div> : groups.map((group) => (
              <div key={group.id} style={{display:"flex",gap:5,alignItems:"center"}}>
                <button type="button" onClick={() => setActive(group)} style={{ ...groupButton, ...(active?.id === group.id ? activeGroupButton : {}), flex:1 }}>
                  <MessageCircle size={16} /><span style={groupNameStyle}>{group.name}</span>
                </button>
                {group.membership_status !== "active" && <button type="button" onClick={() => void joinGroup(group.id)} style={joinButton}>Join</button>}
              </div>
            ))}
            {isAdmin && <div style={adminPanel}>
              <div style={sectionTitle}><Plus size={15} /> New group</div>
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group name" style={input} />
              <textarea value={groupDescription} onChange={(e) => setGroupDescription(e.target.value)} placeholder="Description" rows={3} style={textarea} />
              <button type="button" onClick={() => void createGroup()} disabled={creatingGroup} style={primaryButton}>{creatingGroup ? "Creating..." : "Create group"}</button>
            </div>}
          </aside>

          <section style={chat}>
            <div style={chatHeader}>
              <div>
                <strong>{active?.name || "Select a group"}</strong>
                {active?.description && <div style={muted}>{active.description}</div>}
              </div>
              <div style={tabBar}>
                <button type="button" onClick={() => setTab("chat")} style={tab === "chat" ? tabActive : tabButton}>Chat</button>
                <button type="button" onClick={() => setTab("meetings")} style={tab === "meetings" ? tabActive : tabButton}><CalendarDays size={13} /> Meetings</button>
              </div>
            </div>

            {tab === "chat" ? (
              <>
                <div style={messagesPane}>
                  {!active ? <div style={empty}>Select a community group.</div> : messages.length === 0 ? <div style={empty}>No messages yet. Start the conversation.</div> : messages.map((message) => (
                    <div key={message.id} style={{ ...messageRow, ...(message.parent_message_id ? replyRow : {}) }}>
                      <div style={avatar}>{(message.user_name || "U").charAt(0).toUpperCase()}</div>
                      <div style={messageBody}>
                        <div style={messageMeta}><strong>{message.user_name}</strong><span>{new Date(message.created_at).toLocaleString("en-IN")}</span>{message.is_pinned ? <span style={pinnedLabel}><Pin size={11} /> Pinned</span> : null}</div>
                        {message.parent_message_id ? <div style={replyContext}><Reply size={12} /> Reply</div> : null}
                        {message.message_text && <div style={bubble}>{message.message_text}</div>}
                        {renderAttachment(message)}
                        <div style={messageActions}>
                          <button type="button" onClick={() => setReplyTo(message)} style={actionButton}><Reply size={13} /> Reply {message.reply_count ? `(${message.reply_count})` : ""}</button>
                          {reactionOptions.map((emoji) => {
                            const found = message.reactions?.find((r) => r.reaction === emoji);
                            const activeReaction = message.myReactions?.includes(emoji);
                            return <button key={emoji} type="button" onClick={() => void react(message.id, emoji)} style={{ ...reactionButton, ...(activeReaction ? reactionActive : {}) }}>{emoji}{found ? ` ${found.count}` : ""}</button>;
                          })}
                          {canModerate && <button type="button" onClick={() => void pin(message.id)} style={actionButton}><Pin size={13} /> {message.is_pinned ? "Unpin" : "Pin"}</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {active && <>
                  {replyTo && <div style={replyComposer}><span><Reply size={14} /> Replying to <strong>{replyTo.user_name}</strong></span><button type="button" onClick={() => setReplyTo(null)} style={iconButton}><X size={15} /></button></div>}
                  <div style={composerTools}>
                    <button type="button" onClick={() => galleryRef.current?.click()} style={toolButton} title="Gallery"><Image size={18} /></button>
                    <button type="button" onClick={() => cameraRef.current?.click()} style={toolButton} title="Camera"><Camera size={18} /></button>
                    <button type="button" onClick={() => fileRef.current?.click()} style={toolButton} title="PDF / file"><Paperclip size={18} /></button>
                    <button type="button" onClick={() => void startVoiceRecording()} style={{ ...toolButton, ...(recording ? recordingButton : {}) }}>{recording ? <Square size={16} /> : <Mic size={18} />}</button>
                    <span style={muted}>{recording ? "Recording voice note..." : "Images, PDF, voice, replies and reactions supported"}</span>
                  </div>
                  <div style={composer}>
                    <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder={replyTo ? `Reply to ${replyTo.user_name}...` : "Write to the society group..."} style={input} disabled={sending || recording} />
                    <button type="button" onClick={() => void send()} disabled={sending || recording || !text.trim()} style={sendButton}><Send size={17} /></button>
                  </div>
                </>}
              </>
            ) : (
              <div style={meetingPane}>
                {canModerate && active && <div style={meetingCreateCard}>
                  <div style={sectionTitle}><Plus size={15} /> Create meeting</div>
                  <div style={meetingGrid}>
                    <input value={meetingForm.title} onChange={(e) => setMeetingForm((f) => ({ ...f, title: e.target.value }))} placeholder="Meeting title" style={input} />
                    <input type="date" value={meetingForm.meetingDate} onChange={(e) => setMeetingForm((f) => ({ ...f, meetingDate: e.target.value }))} style={input} />
                    <input type="time" value={meetingForm.meetingTime} onChange={(e) => setMeetingForm((f) => ({ ...f, meetingTime: e.target.value }))} style={input} />
                    <input value={meetingForm.location} onChange={(e) => setMeetingForm((f) => ({ ...f, location: e.target.value }))} placeholder="Location" style={input} />
                    <textarea value={meetingForm.description} onChange={(e) => setMeetingForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} style={{ ...textarea, gridColumn: "1 / -1" }} />
                    <textarea value={meetingForm.agenda} onChange={(e) => setMeetingForm((f) => ({ ...f, agenda: e.target.value }))} placeholder="Agenda" rows={3} style={{ ...textarea, gridColumn: "1 / -1" }} />
                  </div>
                  <button type="button" onClick={() => void createMeeting()} style={primaryButton}>Create & notify members</button>
                </div>}
                <div style={meetingList}>
                  {meetings.length === 0 ? <div style={empty}>No meetings scheduled.</div> : meetings.map((meeting) => <div key={meeting.id} style={meetingCard}>
                    <div style={meetingHeader}><div><strong>{meeting.title}</strong><div style={muted}>{meeting.meeting_date} · {meeting.meeting_time}</div></div><span style={statusBadge}>{meeting.status}</span></div>
                    {meeting.description && <p style={meetingText}>{meeting.description}</p>}
                    {meeting.agenda && <div style={agenda}><strong>Agenda</strong><div>{meeting.agenda}</div></div>}
                    {meeting.location && <div style={meetingMeta}><MapPin size={13} /> {meeting.location}</div>}
                    <div style={meetingActions}><span style={muted}>{meeting.attending_count || 0} attending</span><button type="button" onClick={() => void openRsvp(meeting)} style={actionButton}><Check size={14} /> RSVP</button></div>
                    {activeMeeting === meeting.id && <div style={rsvpBox}><span style={muted}>Your response</span><div style={rsvpButtons}><button type="button" onClick={() => void rsvp("attending")} style={myRsvp === "attending" ? rsvpActive : rsvpButton}>Attending</button><button type="button" onClick={() => void rsvp("maybe")} style={myRsvp === "maybe" ? rsvpActive : rsvpButton}>Maybe</button><button type="button" onClick={() => void rsvp("not_attending")} style={myRsvp === "not_attending" ? rsvpActive : rsvpButton}>Not attending</button></div></div>}
                  </div>)}
                </div>
              </div>
            )}
          </section>

          {isAdmin && active && <aside style={membersPanel}>
            <div style={sectionTitle}><UserPlus size={16} /> Manage access</div>
            <div style={muted}>Grant access by user ID.</div>
            <div style={memberAddRow}><input value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)} placeholder="User ID" style={input} /><button type="button" onClick={() => void addMember()} style={primarySmall}><Plus size={16} /></button></div>
            <div style={memberList}>{members.map((member) => <div key={member.id} style={memberRow}><div><strong>{[member.first_name, member.last_name].filter(Boolean).join(" ") || `User #${member.user_id}`}</strong><div style={muted}>{member.email || `ID ${member.user_id}`}</div></div><button type="button" onClick={() => void removeMember(member.user_id)} style={removeButton}>Remove</button></div>)}</div>
          </aside>}
        </div>

        <input ref={galleryRef} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={handleAttachment} />
        <input ref={cameraRef} type="file" hidden accept="image/*" capture="environment" onChange={handleAttachment} />
        <input ref={fileRef} type="file" hidden accept="application/pdf,image/jpeg,image/png,image/webp" onChange={handleAttachment} />
      </div>
    </div>
  );
}

const page: CSSProperties = { minHeight: "100vh", background: "#f8fafc", padding: 28 };
const container: CSSProperties = { maxWidth: 1450, margin: "0 auto" };
const header: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 16 };
const headerActions: CSSProperties = { display: "flex", gap: 8 };
const eyebrow: CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#2563eb" };
const title: CSSProperties = { margin: "5px 0", fontSize: 30, color: "#0f172a" };
const subtitle: CSSProperties = { margin: 0, color: "#64748b" };
const secondary: CSSProperties = { height: 40, border: "1px solid #e2e8f0", borderRadius: 9, background: "white", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer" };
const layout: CSSProperties = { display: "grid", gridTemplateColumns: "240px minmax(0, 1fr) 270px", gap: 12, alignItems: "stretch" };
const sidebar: CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 15, padding: 12, display: "grid", alignContent: "start", gap: 7 };
const membersPanel: CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 15, padding: 12, display: "grid", alignContent: "start", gap: 9, maxHeight: "75vh", overflowY: "auto" };
const chat: CSSProperties = { background: "white", border: "1px solid #e2e8f0", borderRadius: 15, minHeight: "75vh", display: "grid", gridTemplateRows: "auto 1fr auto auto", overflow: "hidden" };
const sectionTitle: CSSProperties = { display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 12, color: "#334155" };
const groupButton: CSSProperties = { border: 0, background: "transparent", borderRadius: 9, padding: "10px 9px", display: "flex", alignItems: "center", gap: 8, textAlign: "left", cursor: "pointer", color: "#334155" };
const activeGroupButton: CSSProperties = { background: "#eff6ff", color: "#1d4ed8" };
const groupNameStyle: CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const adminPanel: CSSProperties = { borderTop: "1px solid #e2e8f0", paddingTop: 12, marginTop: 8, display: "grid", gap: 7 };
const input: CSSProperties = { width: "100%", height: 40, border: "1px solid #e2e8f0", borderRadius: 9, padding: "0 11px", boxSizing: "border-box", outline: "none" };
const textarea: CSSProperties = { width: "100%", border: "1px solid #e2e8f0", borderRadius: 9, padding: 10, boxSizing: "border-box", resize: "vertical" };
const primaryButton: CSSProperties = { height: 38, border: 0, borderRadius: 9, background: "#2563eb", color: "white", fontWeight: 700, cursor: "pointer" };
const primarySmall: CSSProperties = { width: 40, height: 40, border: 0, borderRadius: 9, background: "#2563eb", color: "white", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const chatHeader: CSSProperties = { padding: 14, borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: 12 };
const tabBar: CSSProperties = { display: "flex", gap: 4, background: "#f8fafc", borderRadius: 9, padding: 3 };
const tabButton: CSSProperties = { border: 0, background: "transparent", padding: "7px 9px", borderRadius: 7, cursor: "pointer", color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 };
const tabActive: CSSProperties = { ...tabButton, background: "white", color: "#1d4ed8", boxShadow: "0 1px 4px rgba(15,23,42,.08)" };
const messagesPane: CSSProperties = { padding: 15, overflowY: "auto", display: "grid", alignContent: "start", gap: 12 };
const messageRow: CSSProperties = { display: "flex", gap: 9, maxWidth: "94%" };
const replyRow: CSSProperties = { paddingLeft: 24 };
const avatar: CSSProperties = { width: 30, height: 30, borderRadius: 999, background: "#e0e7ff", color: "#3730a3", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 11, flexShrink: 0 };
const messageBody: CSSProperties = { minWidth: 0 };
const messageMeta: CSSProperties = { display: "flex", gap: 8, alignItems: "center", fontSize: 11, flexWrap: "wrap" };
const bubble: CSSProperties = { marginTop: 4, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px 10px 10px 4px", padding: "9px 11px", lineHeight: 1.5, whiteSpace: "pre-wrap" };
const replyContext: CSSProperties = { marginTop: 4, color: "#64748b", fontSize: 10, display: "inline-flex", alignItems: "center", gap: 5 };
const messageActions: CSSProperties = { display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 };
const actionButton: CSSProperties = { border: "1px solid #e2e8f0", background: "white", borderRadius: 7, padding: "5px 7px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "#475569" };
const reactionButton: CSSProperties = { border: "1px solid #e2e8f0", background: "white", borderRadius: 7, padding: "4px 7px", cursor: "pointer", fontSize: 11 };
const reactionActive: CSSProperties = { background: "#eff6ff", borderColor: "#93c5fd" };
const pinnedLabel: CSSProperties = { color: "#b45309", background: "#fff7ed", borderRadius: 999, padding: "3px 6px", fontSize: 9, display: "inline-flex", alignItems: "center", gap: 3 };
const attachmentImage: CSSProperties = { display: "block", maxWidth: 300, maxHeight: 240, borderRadius: 10, marginTop: 6, objectFit: "cover" };
const audio: CSSProperties = { width: "min(320px, 100%)", marginTop: 6 };
const fileLink: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, padding: "8px 10px", borderRadius: 8, background: "#eff6ff", color: "#1d4ed8", textDecoration: "none", fontSize: 11 };
const composerTools: CSSProperties = { padding: "8px 12px", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" };
const toolButton: CSSProperties = { width: 34, height: 34, border: "1px solid #e2e8f0", borderRadius: 8, background: "white", display: "grid", placeItems: "center", cursor: "pointer", color: "#475569" };
const recordingButton: CSSProperties = { background: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca" };
const composer: CSSProperties = { padding: 12, display: "flex", gap: 8 };
const sendButton: CSSProperties = { width: 42, height: 40, border: 0, borderRadius: 9, background: "#2563eb", color: "white", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const replyComposer: CSSProperties = { padding: "7px 12px", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 11, color: "#475569" };
const iconButton: CSSProperties = { border: 0, background: "transparent", cursor: "pointer", color: "#64748b" };
const memberAddRow: CSSProperties = { display: "flex", gap: 7 };
const memberList: CSSProperties = { display: "grid", gap: 7 };
const memberRow: CSSProperties = { border: "1px solid #e2e8f0", borderRadius: 9, padding: 9, display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" };
const removeButton: CSSProperties = { border: 0, background: "#fef2f2", color: "#b91c1c", borderRadius: 7, padding: "6px 8px", cursor: "pointer", fontSize: 10 };
const muted: CSSProperties = { fontSize: 10, color: "#94a3b8" };
const empty: CSSProperties = { minHeight: 300, display: "grid", placeItems: "center", color: "#94a3b8" };
const errorBox: CSSProperties = { background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 10, padding: 11, marginBottom: 10 };
const successBox: CSSProperties = { background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", borderRadius: 10, padding: 11, marginBottom: 10 };
const meetingPane: CSSProperties = { padding: 14, overflowY: "auto" };
const meetingCreateCard: CSSProperties = { border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "grid", gap: 9, marginBottom: 12 };
const meetingGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 };
const meetingList: CSSProperties = { display: "grid", gap: 9 };
const meetingCard: CSSProperties = { border: "1px solid #e2e8f0", borderRadius: 12, padding: 13 };
const meetingHeader: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" };
const meetingText: CSSProperties = { color: "#475569", fontSize: 12, lineHeight: 1.5 };
const agenda: CSSProperties = { background: "#f8fafc", borderRadius: 9, padding: 9, fontSize: 11, whiteSpace: "pre-wrap", lineHeight: 1.5 };
const meetingMeta: CSSProperties = { display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 11, marginTop: 8 };
const meetingActions: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 };
const statusBadge: CSSProperties = { background: "#eff6ff", color: "#1d4ed8", borderRadius: 999, padding: "4px 8px", fontSize: 9, fontWeight: 800, textTransform: "uppercase" };
const rsvpBox: CSSProperties = { marginTop: 10, paddingTop: 10, borderTop: "1px solid #e2e8f0" };
const rsvpButtons: CSSProperties = { display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" };
const rsvpButton: CSSProperties = { border: "1px solid #e2e8f0", background: "white", borderRadius: 7, padding: "7px 9px", cursor: "pointer", fontSize: 10 };
const rsvpActive: CSSProperties = { ...rsvpButton, background: "#eff6ff", borderColor: "#93c5fd", color: "#1d4ed8" };

const joinButton: CSSProperties = { border:0, background:"#2563eb", color:"white", borderRadius:7, padding:"5px 8px", cursor:"pointer", fontSize:10, fontWeight:800 };
