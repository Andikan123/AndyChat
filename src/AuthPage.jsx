import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // adjust path if needed
import { doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth,async (currentUser) => {
      setUser(currentUser);
       if (currentUser) {
        navigate('/chat'); // 🚀 redirect to chat page if already logged in
         try {
        await setDoc(doc(db, "users", user.uid), {
          displayName: user.displayName || "Anonymous",
          photoURL: user.photoURL || "",
          uid: user.uid,
        });
      } catch (err) {
        console.error("Error saving user to Firestore:", err);
      }
      }
    });
    return unsubscribe; // cleanup on unmount
  }, []);
  const getFriendlyError = (error) => {
  switch (error.code) {
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/user-not-found':
      return 'No user found with this email.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-credential':
      return 'Invalid Credentials. Please check your credentials.';
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign up
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err) {
     const friendlyMessage = getFriendlyError(err);
     console.log(err.code)
  setError(friendlyMessage); // assuming you have an error state for the form
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-amber-200 to-yellow-300">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-yellow-200">
            {user ? (
                <div className="flex flex-col items-center">
                    <svg className="w-16 h-16 text-yellow-400 mb-4 drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <h2 className="text-2xl font-bold mb-2 text-yellow-700 drop-shadow">Welcome,</h2>
                    <p className="text-lg text-yellow-600 mb-6">{user.email}</p>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-500 hover:to-amber-500 text-white py-2 rounded-xl font-semibold shadow-lg transition border border-yellow-300"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                    <h2 className="text-3xl font-extrabold text-center text-yellow-600 mb-2 tracking-tight drop-shadow">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </h2>
                    <p className="text-center text-yellow-500 mb-2 font-medium">
                        {isLogin ? 'Welcome back! Please login to your account.' : 'Create a new account to get started.'}
                    </p>
                    {error && (
                        <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded text-center text-sm shadow">
                            {error}
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <label className="text-yellow-700 font-semibold" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 focus:ring-2 p-3 rounded-xl outline-none transition bg-white/70 shadow"
                            autoComplete="email"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-yellow-700 font-semibold" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="border border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 focus:ring-2 p-3 rounded-xl outline-none transition bg-white/70 shadow"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-500 hover:to-amber-500 text-white py-3 rounded-xl font-bold shadow-xl transition text-lg border border-yellow-300"
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                    <div className="text-center text-yellow-600 mt-2">
                        {isLogin ? 'New here?' : 'Already have an account?'}{' '}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-amber-600 font-semibold underline hover:text-yellow-800 transition"
                        >
                            {isLogin ? 'Create an account' : 'Login instead'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    </div>
);
};

export default AuthPage;
