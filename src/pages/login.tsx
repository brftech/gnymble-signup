// src/pages/login.tsx
import { supabase } from "../lib/supabaseclient";

export default function Login() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <button
        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-md text-lg font-bold"
        onClick={signInWithGoogle}
      >
        Sign in with Google
      </button>
    </div>
  );
}
