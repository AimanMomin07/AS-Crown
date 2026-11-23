import api from "./axios";
export async function askAssistant(question: string) { return (await api.post("/ai/ask", { question })).data; }
