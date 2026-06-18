/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
"use client";
import React, { Fragment, Suspense, useEffect, useRef, useState } from "react";
import "./chat.css";
import ChatList from "./chatList";
import ChatMessageList from "./chatMessageList";
import { BiSolidMessageRounded } from "react-icons/bi";
import {
  ActiveChatProvider,
  ChatProvider,
  ChatUserProvider,
  ResponsiveChatProvider,
  useActiveChat,
  useChatList,
  useChatUser,
  useResponsiveChat,
} from "./context";
import axios from "axios";
import { io } from "socket.io-client";
import { Search } from "react-feather";

import { useRouter, useSearchParams } from "next/navigation";

import ApiFunction from "../ApiFunction/ApiFunction";
import { decryptData } from "../ApiFunction/encrypted";
import { useSocket } from "../ApiFunction/SoketProvider";
import { useDispatch } from "react-redux";
import { setUnreadCount } from "../Redux/Slices/AuthSlice";

const ChatMessage = () => {
  const { userData, baseURL } = ApiFunction();
  const { chatListData, setChatListData, updateChatList } = useChatList();
  const { chatUser, setChatUser } = useChatUser();
  const router = useRouter();
  const { activeChatId, setActiveChatId } = useActiveChat();
  const { responsiveChat, setResponsiveChat } = useResponsiveChat();
  const socket = useSocket();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const urlDataEnq = params.get("query");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const urlData = urlDataEnq ? decryptData(urlDataEnq) : "";
    if (urlData) {
      setActiveChatId(urlData?._id);
      setResponsiveChat(true);
      setChatUser({ otherUser: urlData });
      router.replace("/chat");
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("conversation-list", (conversationList) => {
        updateChatList(conversationList);
      });
    }
    return () => {
      if (socket) {
        socket.off("conversation-list");
      }
    };
  }, []);

  useEffect(() => {
    const currentUserId = userData?.user?._id || userData?._id;
    const total = chatListData?.reduce((sum, conv) => {
      const sender = conv?.lastMsg?.sender;
      const senderId = typeof sender === "object" ? sender?._id : sender;
      const isFromOther = senderId !== currentUserId;
      if (isFromOther && conv?.unseen > 0) {
        return sum + (conv?.unseen || 0);
      }
      return sum;
    }, 0) || 0;
    dispatch(setUnreadCount(total));
  }, [chatListData, userData]);
  const handleError = (error) => {
    console.error("WebSocket connection error:", error);
  };
  return (
    <div className={mounted ? 'animate-fade-in' : 'opacity-0'} style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0a2540 0%, #004a70 40%, #005f8a 100%)",
          padding: "clamp(20px, 4vw, 32px) 0 clamp(40px, 6vw, 56px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(12px, 3vw, 24px)", position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            <a href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
               onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
               onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
              Home
            </a>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Chat</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 16px)" }}>
            <div
              style={{
                width: "clamp(40px, 6vw, 52px)",
                height: "clamp(40px, 6vw, 52px)",
                borderRadius: "clamp(12px, 2vw, 16px)",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="clamp(20px, 3vw, 26px)" height="clamp(20px, 3vw, 26px)" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <div>
              <h1
                style={{
                  color: "#fff",
                  fontSize: "clamp(20px, 5vw, 30px)",
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                }}
              >
                Messages
              </h1>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(12px, 2vw, 14px)", margin: "2px 0 0", fontWeight: 400, wordBreak: "break-word" }}>
                Stay connected with your conversations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'} style={{ maxWidth: 1200, margin: "-28px auto 0", padding: "0 16px 48px", animationDelay: "150ms" }}>
        <div className="chat_grid">
          {/* Chat List Sidebar */}
          <div className={`chat-sidebar ${!responsiveChat ? "" : "d_chat_none"}`}>
            <div className="chat-sidebar-inner">
              <div className="chat-sidebar-header">
                <h5 className="chat-sidebar-title pb-3">All Conversations</h5>
                <div className="chat-search-wrapper">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2}>
                    <circle cx={11} cy={11} r={8} />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    className="chat-search-input"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="chat-search-clear"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                    >
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <ChatList searchQuery={searchQuery} />
            </div>
          </div>

          {/* Message Panel */}
          <div className={`chat-panel ${responsiveChat ? "" : "d_chat_none"}`}>
            {activeChatId ? (
              <ChatMessageList />
            ) : (
              <div className="chat-empty-state">
                <div className="chat-empty-icon">
                  <BiSolidMessageRounded />
                </div>
                <h4 className="chat-empty-title">Select a conversation</h4>
                <p className="chat-empty-text">
                  Choose from your existing conversations or start a new one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
  return (
    <>
      <Suspense>
        <ChatProvider>
          <ActiveChatProvider>
            <ChatUserProvider>
              <ResponsiveChatProvider>
                <ChatMessage />
              </ResponsiveChatProvider>
            </ChatUserProvider>
          </ActiveChatProvider>
        </ChatProvider>
      </Suspense>
    </>
  );
};

export default Messages;
