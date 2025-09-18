import axios from "axios";

const API_URL = "http://localhost:5000/api"; // ganti sesuai backend kamu

export const updateVariant = (sku, stock, price) => {
  return axios.post(`${API_URL}/variant/update`, { sku, stock, price });
};
