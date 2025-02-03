import React from "react";
import { useProductStore } from "../stores/useProductStore";
import { useEffect } from "react";
import { useParams } from "react-router-dom";


const CategoryPage = () => {
  const { fetchProductsByCategory, products } = useProductStore();
  const { category } = useParams();

  useEffect(() => {
    fetchProductsByCategory(category);
  }, [fetchProductsByCategory, category]);

  console.log(products);
  return <div>Category page</div>;
};

export default CategoryPage;
