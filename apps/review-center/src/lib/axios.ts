import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const formatBaseUrl = (url: string) => {
  const trimmed = url.replace(/\/+$/, "");
  if (trimmed.endsWith("/api/v1") || trimmed.endsWith("/api")) {
    return trimmed;
  }
  return `${trimmed}/api/v1`;
};
export const API_BASE_URL = formatBaseUrl(rawUrl);

export const rcAxios = axios.create({
  baseURL: `${API_BASE_URL}/review-center-app`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default rcAxios;
