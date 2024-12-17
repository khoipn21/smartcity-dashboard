import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

interface AuthState {
	token: string | null;
	role: string | null;
	setToken: (token: string | null) => void;
	isAuthenticated: boolean;
	isAdmin: boolean;
}

interface JwtPayload {
	sub: string;
	role: string;
	exp: number;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			role: null,
			isAuthenticated: false,
			isAdmin: false,
			setToken: (token: string | null) => {
				if (token) {
					const decoded: JwtPayload = jwtDecode(token);
					console.log(decoded);
					set({
						token,
						role: decoded.role,
						isAuthenticated: true,
						isAdmin: decoded.role === "ROLE_ADMIN",
					});
				} else {
					set({
						token: null,
						role: null,
						isAuthenticated: false,
						isAdmin: false,
					});
				}
			},
		}),
		{
			name: "auth-storage",
		},
	),
);
