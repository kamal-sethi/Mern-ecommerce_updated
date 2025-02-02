import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  setProducts: (products) => set({ products }),

  createProduct: async (productData) => {
    set({ loading: true });
    console.log(productData);
    try {
      const res = await axiosInstance.post("/products", productData);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
      toast.success("Product Created Successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.error);
    }
  },

  getProduct: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/products");
      set({ loading: false, products: res.data });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.error);
    }
  },

  
}));
