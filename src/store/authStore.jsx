import { create } from "zustand";

// interface AuthState {
// 	isAuthenticated: boolean;
// 	error: string | null;
// 	isLoading: boolean;
// 	isCheckingAuth: boolean;
// 	// signin: () => Promise<void>;
// 	// logout: () => Promise<void>;
// 	checkAuth: () => Promise<void>;
// }

export const useAuthStore = create((set) => ({
	user: null,
	isMentor: localStorage.getItem('isMentor') === 'true',
	isAuthenticated: localStorage.getItem('auth') === 'true',
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	checkAuth: async () => {
		const allcookies = document.cookie.split(';');
		if (allcookies.length === 0) {
			// If the status code is 401, logout the user
			localStorage.setItem("auth", 'false');
			localStorage.removeItem("isMentor");
			document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; // Clear token cookie
			set({ error: "Unauthorized", isCheckingAuth: false, isAuthenticated: false });
		}
		let is_token_found = false;
		allcookies.map(async (cookie, index) => {
			const [key, value] = cookie.split('=');
			if (key.trim() === 'token') {
				is_token_found = true;
				set({ isCheckingAuth: true, error: null });
				fetch("/api/auth", {
					method: "GET",
					headers: {
						authorization: `Bearer ${value}`
					}
				}).then(resp => {
					if (resp.ok) return resp.json();
					else throw resp;
				}).then(data => {
					console.log(data);
					localStorage.setItem("auth", true);
					localStorage.setItem("isMentor", data.type === "mentor");
					set({
						isAuthenticated: true,
						isCheckingAuth: false,
						isMentor: data.type === "mentor",
						user: {
							email: data.email,
							github: data.github,
							type: data.type
						}
					});
				}).catch(async resp => {
					try {
						if (resp.status === 401) {
							localStorage.setItem("auth", 'false');
							localStorage.removeItem("isMentor");
							document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
						}
				
						let data;
						if (typeof resp.json === "function") {
							data = await resp.json();
						} else {
							throw new Error("Response is not JSON");
						}
				
						if ("message" in data) {
							set({ error: data.message, isCheckingAuth: false, isAuthenticated: false });
						} else if (typeof data.error === "string") {
							set({ error: data.error, isCheckingAuth: false, isAuthenticated: false });
						} else {
							set({ error: data.error?.[0]?.msg ?? "Unknown error", isCheckingAuth: false, isAuthenticated: false });
						}
					} catch (e) {
						console.error("Auth fetch failed:", e);
						set({ error: "Authentication failed", isCheckingAuth: false, isAuthenticated: false });
					}
				});
			}
			if (index >= allcookies.length - 1 && !is_token_found) {
				// If the status code is 401, logout the user
				localStorage.setItem("auth", 'false');
				localStorage.removeItem("isMentor");
				document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`; // Clear token cookie
				set({ error: "Unauthorized", isCheckingAuth: false, isAuthenticated: false });
			}
		})
	},
	logout: async () => {
		document.cookie.split(';').map(async cookie => {
			const [key, value] = cookie.split('=');
			if (key.trim() === 'token') {
				document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
			}
		});
		set({ isLoading: true });
		localStorage.setItem("auth", false);
		localStorage.removeItem("isMentor");

		set({ isAuthenticated: false, error: null, isLoading: false, isCheckingAuth: false });
	}
}));