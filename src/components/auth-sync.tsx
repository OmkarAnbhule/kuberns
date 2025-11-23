"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setUser, clearUser } from "@/lib/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import { store } from "@/lib/store";

export function AuthSync() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);

  const getCookie = useCallback((name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  }, []);

  const syncAuthState = useCallback(() => {
    // Only check user_data cookie - access_token is httpOnly and not accessible from client
    const userDataStr = getCookie("user_data");
    const refreshToken = getCookie("refresh_token"); // This might also be httpOnly, but checking anyway

    // Get current auth state from Redux store directly
    const currentState = store.getState().auth;
    const currentIsAuthenticated = currentState.isAuthenticated;

    // If user_data cookie is missing or expired, user is not authenticated
    if (!userDataStr) {
      // If user is authenticated in Redux but cookie is missing/expired, logout
      if (currentIsAuthenticated) {
        dispatch(clearUser());
        // Redirect to login if not already there
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
      return;
    }

    // If we have user_data cookie, sync with Redux
    // Note: We don't have access to access_token (it's httpOnly), but we know user is authenticated
    if (userDataStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataStr));
        
        // Check if we need to update (user changed or not authenticated)
        const needsUpdate = !currentIsAuthenticated || 
                           !currentState.user || 
                           currentState.user.id !== userData.id;

        if (needsUpdate) {
          // Set user in Redux - token will be handled by proxy via httpOnly cookie
          // We use a placeholder token value since we can't read the httpOnly cookie
          dispatch(setUser({ 
            user: userData, 
            token: "httpOnly", // Placeholder - actual token is in httpOnly cookie
            refreshToken: refreshToken || undefined
          }));
        }
      } catch (error) {
        dispatch(clearUser());
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
    }
  }, [dispatch, router, pathname, getCookie]);

  useEffect(() => {
    // Initial sync on mount - use a small delay to ensure cookies are available after redirect
    const initialSync = () => {
      if (!hasInitializedRef.current) {
        syncAuthState();
        hasInitializedRef.current = true;
      }
    };

    // Immediate sync
    initialSync();

    // Also sync after a short delay to catch cookies set during redirect
    const timeoutId = setTimeout(() => {
      syncAuthState();
    }, 100);

    // Set up interval to check cookie expiration periodically (every 30 seconds)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      syncAuthState();
    }, 30000);

    // Listen for storage events (cookies changes in some cases)
    const handleStorageChange = () => {
      syncAuthState();
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for focus events (user returns to tab)
    window.addEventListener("focus", handleStorageChange);

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, [syncAuthState]);

  // Separate effect to handle pathname changes (e.g., after login redirect)
  useEffect(() => {
    if (hasInitializedRef.current) {
      // Small delay to ensure cookies are available after redirect
      const timeoutId = setTimeout(() => {
        syncAuthState();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [pathname, syncAuthState]);

  return null;
}

