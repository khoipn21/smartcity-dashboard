import axios from "axios";
import { useAuthStore } from "@store/authStore";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to include the JWT token
axiosInstance.interceptors.request.use(
	(config) => {
		const token = useAuthStore.getState().token;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

export default axiosInstance;
