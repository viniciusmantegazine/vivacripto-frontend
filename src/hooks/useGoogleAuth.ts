import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    google: any;
  }
}

export const useGoogleAuth = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google SDK
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleLoaded(true);
      initializeGoogle();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogle = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // response.credential is the JWT ID token
      await login(response.credential);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const renderButton = (elementId: string) => {
    if (window.google && googleLoaded && !isAuthenticated) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: "outline",
          size: "large",
          text: "signin_with",
        }
      );
    }
  };

  const renderOneTap = () => {
    if (window.google && googleLoaded && !isAuthenticated) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One-tap UI is not displayed
        }
      });
    }
  };

  return {
    googleLoaded,
    isAuthenticated,
    loading,
    renderButton,
    renderOneTap,
  };
};
