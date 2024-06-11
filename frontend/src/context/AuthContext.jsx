import { useState, useEffect, createContext, useContext } from "react";
import { registerUser, loginUser, logoutUser } from "@/api";
import { requestHandler } from "@/utils";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({
	user: null,
	token: null,
	register: async () => {},
	login: async () => {},
	logout: async () => {},
});

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);

	const navigate = useNavigate();

	const register = async (data) => {
		await requestHandler(async () => await registerUser(data)),
			setIsLoading,
			() => {
				alert("Account created successfully! Go ahead and login.");
				navigate("/login");
			},
      alert
	};

  const login = async (data) => {
    await requestHandler(
      async () => await loginUser(data)
    )
  }

	const logout = async () => {
		await requestHandler(
			async () => logoutUser()
		)
	}


	return (
		<AuthContext.Provider value={{ user, token, register, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
