import { apiRequest } from "./client";
import { savePlatformSession } from "../auth/session";

export async function loginPlatformAdmin(email, password) {
  const json = await apiRequest("/api/platform/auth/login", {
    method: "POST",
    body: { email, password },
    token: "",
  });
  if (!json?.token) {
    throw new Error("Login succeeded without a platform token.");
  }
  savePlatformSession(json.token, json.data);
  return json;
}
