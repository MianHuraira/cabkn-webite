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
    <div className={`min-h-screen bg-slate-50/50 flex flex-col ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* ===== HERO BANNER ===== */}
      <section className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 !pt-28 !pb-28 ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: "50ms" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />
        
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: "12s" }} />
        
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-family-medium !mb-4">
              <a href="/" className="text-slate-400 hover:text-white transition-colors">Home</a>
              <span className="text-slate-500">/</span>
              <span className="text-slate-200">Chat</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <BiSolidMessageRounded size={22} className="text-blue-300" />
              </div>
              <div>
                <h1 className="text-white text-3xl font-family-semibold tracking-tight !m-0 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200">
                    Messages
                  </span>
                </h1>
                <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                  Communicate with drivers and riders
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Content */}
      <div className={`flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10 !-mt-12 !pb-12 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: "150ms" }}>
        <div className="chat_grid shadow-[0_4px_24px_rgba(0,0,0,0.04)] !border !border-slate-100/80 rounded-2xl">
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
