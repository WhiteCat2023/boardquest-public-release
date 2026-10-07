import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
