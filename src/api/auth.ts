import axiosInstance from "./axiosInstance";
import { RegisterRequest, LoginRequest } from "@utils/types";

export const register = (data: RegisterRequest) => {
	return axiosInstance.post("/api/account/register", data);
};

export const login = (data: LoginRequest) => {
	return axiosInstance.post("/api/account/login", data);
};

export const logout = () => {
	return axiosInstance.post("/api/account/logout");
};
