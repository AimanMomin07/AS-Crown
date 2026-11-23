import api from "./axios";export async function globalSearch(q:string){return (await api.get("/search",{params:{q}})).data;}
