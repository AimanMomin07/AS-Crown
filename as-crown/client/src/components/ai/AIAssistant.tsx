import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { askAssistant } from "../../api/ai.api";

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("Ask about residents, flats, bills, complaints or visitors.");
  const [loading, setLoading] = useState(false);
  async function ask() {
    if (!question.trim() || loading) return;
    try { setLoading(true); const response = await askAssistant(question.trim()); setAnswer(response?.data?.answer || "No answer available."); setQuestion(""); }
    catch (error) { console.error(error); setAnswer("The AS CROWN assistant could not process that request."); }
    finally { setLoading(false); }
  }
  return <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: 20 }}>
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}><Bot size={20}/><strong>AS CROWN Assistant</strong></div>
    <div style={{ minHeight: 62, padding: 13, borderRadius: 12, background: "#f8fafc", color: "#334155", marginBottom: 12 }}>{answer}</div>
    <div style={{ display: "flex", gap: 8 }}><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void ask(); }} placeholder="e.g. How many flats are vacant?" style={{ flex: 1, height: 42, border: "1px solid #e2e8f0", borderRadius: 10, padding: "0 12px" }}/><button onClick={() => void ask()} disabled={loading} style={{ width: 48, border: 0, borderRadius: 10, background: "#2563eb", color: "white", display: "grid", placeItems: "center" }}><Send size={17}/></button></div>
  </div>;
}
