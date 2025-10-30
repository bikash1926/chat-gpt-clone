import React from 'react';
import './ChatSidebar.css';
import { useSelector } from 'react-redux';



const ChatSidebar = ({ open, onNewChat, onSelectChat, onLogout }) => {

  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const user = useSelector(state => state.user.user);
  

  
  return (
    <aside className={"chat-sidebar " + (open ? 'open' : '')} aria-label="Previous chats">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button className="small-btn" onClick={onNewChat}>New</button>
      </div>
      <nav className="chat-list" aria-live="polite">
        {chats.map(c => (
          <button
            key={c._id}
            className={"chat-list-item " + (c._id === activeChatId ? 'active' : '')}
            onClick={() => onSelectChat(c._id)}
          >
            <span className="title-line">{c.title}</span>
          </button>
        ))}
        {chats.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
      <div className="sidebar-footer">
        {user && user.fullname ? (
          <div className="user-profile">
            <div className="user-avatar">
              {user.fullname.firstname && user.fullname.firstname.charAt(0)}
            </div>
            <span className="user-name">{user.fullname.firstname} {user.fullname.lastname}</span>
          </div>
        ) : (
          <div className="user-profile">
             <div className="user-avatar">G</div>
            <span className="user-name">Guest</span>
          </div>
        )}
        <button className="small-btn" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
};

export default ChatSidebar;