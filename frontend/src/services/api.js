import axios from "axios";

const API = axios.create({
  baseURL: "https://cloud-storage-backend-05c9.onrender.com/api",
});

export default API;