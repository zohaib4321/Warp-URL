import axios from "axios"

const ApiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 12000
})

const registerUser = (data) => {
  return ApiClient.post("/users/register", data)
}

const loginUser = (data) => {
  return ApiClient.post("/users/login", data)
}

const logoutUser = () => {
  return ApiClient.post("/users/logout")
}

export {
  registerUser,
  loginUser,
  logoutUser
}