import React, { useState } from "react";
import { Button } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function OAuth() {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      });

      // Try to open a test popup first
      const popupTest = window.open(
        "about:blank",
        "popup_test",
        "width=1,height=1,top=0,left=0"
      );

      if (!popupTest) {
        setError("Popup blocked! Please follow these steps:\n1. Click the lock/info icon in your browser's address bar\n2. Find 'Pop-ups' or 'Pop-ups and redirects'\n3. Change the setting to 'Allow'\n4. Refresh the page and try again");
        setLoading(false);
        return;
      }
      popupTest.close();

      // Now proceed with Google sign-in
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      
      if (!resultsFromGoogle?.user) {
        throw new Error('Failed to get user data from Google');
      }

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to authenticate with server');
      }

      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      if (error.code === 'auth/popup-blocked') {
        setError("Popup blocked! Please follow these steps:\n1. Click the lock/info icon in your browser's address bar\n2. Find 'Pop-ups' or 'Pop-ups and redirects'\n3. Change the setting to 'Allow'\n4. Refresh the page and try again");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        gradientDuoTone="pinkToOrange"
        outline
        onClick={handleGoogleClick}
        disabled={loading}
      >
        <AiFillGoogleCircle className="w-6 h-6 mr-2" />
        {loading ? 'Connecting...' : 'Continue with Google'}
      </Button>
      {error && (
        <div className="text-red-500 text-sm mt-2 whitespace-pre-line">
          {error}
        </div>
      )}
    </div>
  );
}
