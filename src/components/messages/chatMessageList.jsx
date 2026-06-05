/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, Send } from "react-feather";
import ChatMessage from "./chatMessage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoVideocamOutline } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";

import {
  useActiveChat,
  useChatList,
  useChatUser,
  useResponsiveChat,
} from "./context";

import ApiFunction from "../ApiFunction/ApiFunction";
import ApiFile from "../ApiFunction/ApiFile";
import { useSocket } from "../ApiFunction/SoketProvider";
import { Spinner } from "react-bootstrap";
import { StaticUser } from "../assets/Images";

const getSenderId = (sender) => {
  if (!sender) return null;
  if (typeof sender === "string") return sender;
  if (typeof sender === "object") return sender._id || null;
  return null;
};

const getOtherUser = (chat) => {
  if (!chat) return null;
  if (typeof chat?.otherUser === "object" && chat?.otherUser !== null) {
    return chat.otherUser;
  }
  const id = typeof chat?.otherUser === "string" ? chat.otherUser : null;
  if (id && chat?.participantsDetails?.length > 0) {
    return chat.participantsDetails.find((p) => p._id === id) || null;
  }
  if (chat?.user1 && chat?.user2) {
    return chat?.user1?._id === chat?.otherUser ? chat?.user1 : chat?.user2;
  }
  return null;
};

const ChatMessageList = () => {
  const { userData, baseURL, getData, postData, header1 } = ApiFunction();

  const { getUserMessages } = ApiFile;
  const router = useRouter();
  const dispatch = useDispatch();
  const [chatMsg, setChatMsg] = useState([]);

  const [usersId, setUsersId] = useState("");
  const [lastMsgId, setLastMsgId] = useState("");

  const chatMessagesRef = useRef(null);
  const [lastId, setLastId] = useState(0);
  const [count, setCount] = useState(0);

  const [newMsg, setNewMsg] = useState(false);
  const { setResponsiveChat } = useResponsiveChat();

  const [isLoading3, setIsLoading3] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const { chatUser } = useChatUser();
  const { activeChatId } = useActiveChat();

  const { chatListData, setChatListData } = useChatList();
  const socket = useSocket();
  const lastFetchedUserId = useRef(null);

  const currentUserId = userData?.user?._id || userData?._id;

  useEffect(() => {
    setLastId(chatMsg[0]?._id);
  }, [chatMsg]);

  useEffect(() => {
    if (socket) {
      const handleMessage = (message) => {
        const msgSenderId = getSenderId(message?.sender);
        const currentId = currentUserId;

        if (msgSenderId !== currentId && msgSenderId === activeChatId) {
          setChatMsg((prev) => {
            if (prev.some((m) => m?._id === message?._id)) return prev;
            return [...prev, message];
          });
          setNewMsg(true);
        }
        setChatListData((prevChatList) => {
          let updatedChatList = prevChatList.map((conversation) => {
            if (conversation?._id === message?.conversationId) {
              return {
                ...conversation,
                lastMsg: message,
              };
            }
            return conversation;
          });

          return updatedChatList.sort((a, b) => {
            const lastMsgA = a?.lastMsg?.createdAt;
            const lastMsgB = b?.lastMsg?.createdAt;
            return new Date(lastMsgB) - new Date(lastMsgA);
          });
        });
      };

      socket.on("recieved-message", handleMessage);

      return () => {
        socket.off("recieved-message", handleMessage);
      };
    }
  }, [activeChatId, chatListData]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const message = input.value;

    const data = {
      name: chatUser?.otherUser?.name,
      recipientId: chatUser?.otherUser?._id,
      messageText: message,
    };

    if (message.trim() !== "") {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      await socket.emit("send-message", data, (res) => {
        setChatMsg((prevChat) => [...prevChat, res]);
        setChatListData((prev) => {
          const updated = prev.map((c) => {
            if (c?._id === res?.conversationId || c?._id === chatUser?._id) {
              return { ...c, lastMsg: res };
            }
            return c;
          });
          return updated.sort((a, b) => {
            const ta = a?.lastMsg?.createdAt || 0;
            const tb = b?.lastMsg?.createdAt || 0;
            return new Date(tb) - new Date(ta);
          });
        });
      });
      input.value = "";
    }
  };

  const getUserChat = (userId) => {
    const apiChat = `${getUserMessages}/${userId}`;
    getData(apiChat, header1)
      .then((res) => {
        if (res?.success) {
          setNewMsg(true);
          setChatMsg(res?.messages?.reverse());
          setIsLoading3(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setIsLoading3(false);
      })
      .finally(() => {
        setIsLoading3(false);
      });
  };

  useLayoutEffect(() => {
    handleChatClick(activeChatId);
  }, [activeChatId]);
  useEffect(() => {
    if (chatMsg?.length > 0) {
      if (lastId === 0) {
        chatMessagesRef.current.scrollTop =
          chatMessagesRef.current.scrollHeight;
      } else {
        if (newMsg) {
          chatMessagesRef.current.scrollTop =
            chatMessagesRef.current.scrollHeight;
          setNewMsg(true);
        }
      }
    }
  }, [chatMsg]);

  const handleScroll = async () => {
    if (chatMessagesRef.current.scrollTop === 0 && !isLoading3) {
      setNewMsg(false);
      setIsLoading2(true);
      const apiChat = `${getUserMessages}/${usersId}/${lastId}`;

      getData(apiChat, header1)
        .then((res) => {
          if (res?.success) {
            const data = [...res?.messages?.reverse(), ...chatMsg];
            setChatMsg(data);
            setIsLoading2(false);
          } else {
            setIsLoading2(false);
          }
        })
        .catch((error) => {
          console.log(error);
          setIsLoading2(false);
        })
        .finally(() => {
          setIsLoading2(false);
        });
    } else setIsLoading2(false);
  };

  const handleChatClick = async (userId) => {
    if (!userId || lastFetchedUserId.current === userId) return;
    lastFetchedUserId.current = userId;
    setIsLoading3(true);
    getUserChat(userId);
    setUsersId(userId);
  };

  return (
    <div className="chat-panel-inner">
      {/* Header */}
      <div className="chat-panel-header">
        <button
          className="chat-back-btn"
          onClick={() => setResponsiveChat(false)}
        >
          <ChevronLeft size={20} />
        </button>

        {isLoading3 ? (
          <div className="chat-header-skeleton">
            <div className="skeleton-avatar-sm" />
            <div className="skeleton-lines-sm">
              <div className="skeleton-line w-40" />
              <div className="skeleton-line w-60" />
            </div>
          </div>
        ) : (
          <div className="chat-header-user">
            <div className="chat-header-avatar">
              {chatUser?.otherUser?.image ? (
                <img
                  className="chat-header-img"
                  src={chatUser?.otherUser?.image}
                  alt=""
                />
              ) : (
                <div className="chat-header-placeholder">
                  {chatUser?.otherUser?.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <span className={`chat-status-dot ${chatUser?.otherUser?.status === "online" ? "online" : "offline"}`} />
            </div>
            <div className="chat-header-info">
              <span className="chat-header-name">{chatUser?.otherUser?.name}</span>
              <span className="chat-header-status">
                {chatUser?.otherUser?.status === "online" ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages-container">
        <div
          ref={chatMessagesRef}
          onScroll={handleScroll}
          className="chat-messages-scroll"
        >
          {isLoading3 ? (
            <div className="chat-loading-spinner">
              <Spinner animation="border" role="status" style={{ color: "#004a70" }} />
            </div>
          ) : (
            <>
              {isLoading2 && (
                <div className="chat-loading-spinner">
                  <Spinner animation="border" role="status" style={{ color: "#004a70" }} />
                </div>
              )}
              {chatMsg?.length > 0 ? (
                chatMsg?.map((msg, index) => (
                  <Fragment key={index}>
                    <ChatMessage
                      left={getSenderId(msg?.sender) !== currentUserId}
                      message={msg?.message}
                      timestamp={`${msg?.createdAt}`}
                    />
                  </Fragment>
                ))
              ) : (
                <div className="chat-empty-messages">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="chat-input-form">
        <div className="chat-input-wrapper">
          <input
            type="text"
            disabled={isLoading3}
            id="chatInput"
            required
            className="chat-input"
            placeholder="Type your message..."
          />
          <button
            disabled={isLoading3}
            className="chat-send-btn"
            type="submit"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatMessageList;
