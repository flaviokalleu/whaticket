import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import openSocket from "../../services/socket-io";

import { toast } from "react-toastify";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

// Interceptors must be registered synchronously (not inside a useEffect),
// otherwise child components can fire requests before they're attached,
// racing the request past the Authorization header. Since useAuth is only
// ever instantiated once (the root AuthProvider), a module-level guard
// keeps registration idempotent across re-renders without deferring it.
let interceptorsRegistered = false;
let refreshPromise = null;
let onSessionExpired = () => {};

if (!interceptorsRegistered) {
	interceptorsRegistered = true;

	api.interceptors.request.use(
		config => {
			const token = localStorage.getItem("token");
			if (token) {
				config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
			}
			return config;
		},
		error => {
			return Promise.reject(error);
		}
	);

	api.interceptors.response.use(
		response => {
			return response;
		},
		async error => {
			const originalRequest = error.config;
			if (error?.response?.status === 403 && !originalRequest._retry) {
				originalRequest._retry = true;

				if (!refreshPromise) {
					refreshPromise = api
						.post("/auth/refresh_token")
						.then(({ data }) => {
							if (data) {
								localStorage.setItem("token", JSON.stringify(data.token));
								api.defaults.headers.Authorization = `Bearer ${data.token}`;
							}
							return data;
						})
						.finally(() => {
							refreshPromise = null;
						});
				}

				await refreshPromise;
				return api(originalRequest);
			}
			if (error?.response?.status === 401) {
				localStorage.removeItem("token");
				api.defaults.headers.Authorization = undefined;
				onSessionExpired();
			}
			return Promise.reject(error);
		}
	);
}

const useAuth = () => {
	const history = useHistory();
	const [isAuth, setIsAuth] = useState(false);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState({});

	useEffect(() => {
		onSessionExpired = () => setIsAuth(false);
	}, []);

	useEffect(() => {
		const token = localStorage.getItem("token");
		(async () => {
			if (token) {
				try {
					const { data } = await api.post("/auth/refresh_token");
					api.defaults.headers.Authorization = `Bearer ${data.token}`;
					setIsAuth(true);
					setUser(data.user);
				} catch (err) {
					toastError(err);
				}
			}
			setLoading(false);
		})();
	}, []);

	useEffect(() => {
		const socket = openSocket();

		socket.on("user", data => {
			if (data.action === "update" && data.user.id === user.id) {
				setUser(data.user);
			}
		});

		return () => {
			socket.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user.id]);

	const handleLogin = async userData => {
		setLoading(true);

		try {
			const { data } = await api.post("/auth/login", userData);
			localStorage.setItem("token", JSON.stringify(data.token));
			api.defaults.headers.Authorization = `Bearer ${data.token}`;
			setUser(data.user);
			setIsAuth(true);
			toast.success(i18n.t("auth.toasts.success"));
			history.push("/tickets");
			setLoading(false);
		} catch (err) {
			toastError(err);
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		setLoading(true);

		try {
			await api.delete("/auth/logout");
			setIsAuth(false);
			setUser({});
			localStorage.removeItem("token");
			api.defaults.headers.Authorization = undefined;
			setLoading(false);
			history.push("/login");
		} catch (err) {
			toastError(err);
			setLoading(false);
		}
	};

	return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;
