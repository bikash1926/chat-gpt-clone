import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import axios from 'axios';
import {
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  setChats
} from '../store/chatSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logout } from '../store/userSlice.js';
import { useNavigate } from 'react-router-dom';



const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  // ✅ Create a new chat
  const handleNewChat = async () => {
    try {
      let title = window.prompt('Enter a title for the new chat:', '');
      if (title) title = title.trim();
      if (!title) return alert("Chat title cannot be empty!");

      const response = await axios.post("https://chat-gpt-clone-vdwd.onrender.com/api/chat/", {
        title
      }, { withCredentials: true });

      dispatch(startNewChat(response.data.chat));
      getMessages(response.data.chat._id);
      setSidebarOpen(false);
      console.log("New chat created:", response.data.chat);
    } catch (error) {
      console.error("Error creating new chat:", error);
      alert("Failed to create new chat. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      // 1. Tell the backend to log out
      await axios.post("https://chat-gpt-clone-vdwd.onrender.com/api/auth/logout", {}, { withCredentials: true });
      // 2. Clear user data from the Redux store
      dispatch(logout());
      // 3. Redirect to the login page
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  // ✅ Fetch all chats on load & connect socket
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get("https://chat-gpt-clone-vdwd.onrender.com/api/chat/", {
          withCredentials: true
        });
        dispatch(setChats(response.data.chats.reverse()));
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();

    const tempSocket = io("https://chat-gpt-clone-vdwd.onrender.com", { withCredentials: true });

    tempSocket.on("ai-response", (messagePayload) => {
      console.log("Received AI response:", messagePayload);
      setMessages(prev => [
        ...prev,
        { type: 'ai', content: messagePayload.content }
      ]);
      dispatch(sendingFinished());
    });

    setSocket(tempSocket);

    // ✅ Clean up socket connection
    return () => {
      tempSocket.disconnect();
      console.log("Socket disconnected");
    };
  }, [dispatch]);

  // ✅ Send message to server
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeChatId || isSending) return;

    dispatch(sendingStarted());
    setMessages(prev => [...prev, { type: 'user', content: trimmed }]);
    dispatch(setInput(''));

    try {
      socket.emit("ai-message", {
        chat: activeChatId,
        content: trimmed
      });
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch(sendingFinished());
    }
  };

  // ✅ Fetch chat messages
  const getMessages = async (chatId) => {
    try {
      const response = await axios.get(
        `https://chat-gpt-clone-vdwd.onrender.com/api/chat/messages/${chatId}`,
        { withCredentials: true }
      );

      setMessages(response.data.messages.map(m => ({
        type: m.role === 'user' ? 'user' : 'ai',
        content: m.content
      })));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  return (
    <div className="chat-layout minimal">
      <ChatMobileBar
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onNewChat={handleNewChat}
      />

      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          dispatch(selectChat(id));
          setSidebarOpen(false);
          getMessages(id);
        }}
        onNewChat={handleNewChat}
        open={sidebarOpen}
        onLogout={handleLogout}
      />

      <main className="chat-main" role="main">
        {messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="chip">Early Preview</div>
            <h1>ChatGPT Clone</h1>
            <p>Ask anything. Paste text, brainstorm ideas, or get quick explanations. 
               Your chats stay in the sidebar so you can pick up where you left off.</p>
          </div>
        )}

        <ChatMessages messages={messages} isSending={isSending} />

        {activeChatId && (
          <ChatComposer
            input={input}
            setInput={(v) => dispatch(setInput(v))}
            onSend={sendMessage}
            isSending={isSending}
          />
        )}
      </main>

      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
