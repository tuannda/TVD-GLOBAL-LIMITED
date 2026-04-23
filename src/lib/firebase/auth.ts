"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, onIdTokenChanged, type User } from "firebase/auth";
import { auth } from "./client";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}

export function useAdminClaim(user: User | null) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const token = await currentUser.getIdTokenResult();
      setIsAdmin(Boolean(token.claims.admin));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { isAdmin, loading };
}
