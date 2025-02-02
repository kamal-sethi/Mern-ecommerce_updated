import { create } from "zustand";
import axiosInstance from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password != confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords Do not match");
    }
    try {
      const res = await axiosInstance.post("/auth/sign-up", {
        name,
        email,
        password,
      });

      set({ user: res.data, loading: false });
      toast.success("user created successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message) || "An Error Occurred";
    }
  },
  login: async (email, password) => {
    set({ loading: true });

    try {
      console.log(email, password);
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      set({ user: res.data, loading: false });
      toast.success("login successful");
    } catch (error) {
      console.log("error");
      set({ loading: false });
      toast.error(error.response.data.message) || "An Error Occurred";
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/getProfile");
      console.log(res.data);
      set({ user: res.data, checkingAuth: false });
    } catch (error) {
      set({ checkingAuth: false, user: null });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.get("/auth/logout");
      set({ user: null });
      toast.success("Logout Successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  },
}));
