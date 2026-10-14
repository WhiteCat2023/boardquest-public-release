import axios from "axios";
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const formatBaseUrl = (url: string) => {
  const trimmed = url.replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1") || trimmed.endsWith("/api")) {
    return trimmed;
  }
  return `${trimmed}/api/v1`;
};
const BASE_URL = formatBaseUrl(rawUrl);
export default axios.create({
  baseURL: BASE_URL,
});
export const AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
