import { useEffect, useState } from "react";
import {
  fetchAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../api/categoryApi";

export default function useCategories(currentUser) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const load = async () => {
      try {
        const res = await fetchAllCategories();
        setCategories(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    load();
  }, [currentUser?.id]);

  const createCategory = async (name) => {
    const newCat = await addCategory({
      name,
      userId: currentUser.id,
    });

    setCategories((prev) => [...prev, newCat]);
  };

  const editCategory = async (id, name) => {
    const updated = await updateCategory(id, { id, name });

    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const removeCategory = async (id) => {
    await deleteCategory(id);

    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    categories,
    setCategories,
    createCategory,
    editCategory,
    removeCategory,
  };
}
