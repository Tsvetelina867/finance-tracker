import { useEffect, useState } from "react";
import { fetchUserProfile } from "../api/userApi";

export default function useUser() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchUserProfile();
        setCurrentUser(userData);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  return { currentUser, setCurrentUser, loadingUser };
}
