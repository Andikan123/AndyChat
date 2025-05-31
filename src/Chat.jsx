import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { signOut, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
    console.log("Snapshot size:", snapshot.size);
    const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Fetched Users:", fetchedUsers);
    setUsers(fetchedUsers);
  });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || 'Anonymous',
        photoURL: auth.currentUser.photoURL || '',
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message: ', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleSetDisplayName = async () => {
    let name = displayName.trim();
    if (!name.toLowerCase().startsWith('nurse ')) {
      name = 'Nurse ' + name;
    }

    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
      });
      setDisplayName(name);
      alert('Display name updated!');
    } catch (err) {
      console.error('Error setting display name:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white py-6 px-8 flex justify-between items-center shadow-2xl rounded-b-3xl border-b-4 border-green-300 relative">
        <div className="flex items-center gap-4">
          <span className="text-4xl animate-pulse">🩺</span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-lg flex items-center gap-2">
              Andy's Nurses Chat
              <span className="bg-white text-green-700 text-xs font-bold px-2 py-1 rounded-full ml-2 shadow-md border border-green-200">
                Nursing Room
              </span>
            </h1>
            <p className="text-green-100 text-sm mt-1 italic font-light">
              A safe space for nurses to connect, share, and support each other 💚
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white text-green-700 font-bold px-6 py-2 rounded-full shadow-lg hover:bg-green-100 hover:scale-105 transition border-2 border-green-400"
        >
          Log out
        </button>
        <div className="absolute right-1/2 translate-x-1/2 top-0 h-2 w-32 bg-green-300 rounded-b-full opacity-60 blur-sm" />
      </div>

      {/* Display name input */}
      <div className="bg-white px-4 py-2 border-b border-green-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Set your display name..."
          className="flex-1 p-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleSetDisplayName}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md transition"
        >
          Set Name
        </button>
      </div>


      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${msg.uid === auth.currentUser.uid ? 'justify-end' : 'justify-start'}`}
          >
            {msg.uid !== auth.currentUser.uid && (
              <img
                src={msg.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                alt="profile"
                className="w-10 h-10 rounded-full border border-green-300 shadow-sm"
              />
            )}
            <div
              className={`max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-2xl shadow-md text-sm whitespace-pre-line ${
                msg.uid === auth.currentUser.uid
                  ? 'bg-green-500 text-white ml-auto'
                  : 'bg-white text-gray-800'
              }`}
            >
              <p className="font-semibold mb-1">{msg.displayName}</p>
              <p>{msg.text}</p>
            </div>
            {msg.uid === auth.currentUser.uid && (
              <img
                src={msg.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                alt="profile"
                className="w-10 h-10 rounded-full border border-green-300 shadow-sm"
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 p-4 bg-white border-t border-green-200 relative"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-full border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-xl px-2 hover:scale-110 transition"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 z-50">
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setNewMessage((prev) => prev + emojiData.emoji)
                }
                theme="light"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium shadow-md transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
