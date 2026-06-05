/* eslint-disable no-use-before-define */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
import React, { Fragment, useEffect, useRef, useState } from "react";

import { useSelector } from "react-redux";
import {
  useActiveChat,
  useChatList,
  useChatUser,
  useResponsiveChat,
} from "./context";

import { useSocket } from "../ApiFunction/SoketProvider";
import ApiFunction from "../ApiFunction/ApiFunction";
import ApiFile from "../ApiFunction/ApiFile";
import { NoshowData } from "../assets/Images";
import moment from "moment";

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

const ChatUsers = ({ name, discrip, img, id, timestamp, status, data }) => {
  const { userData } = ApiFunction();
  const [badge, setBadge] = useState(false);
  const { activeChatId, setActiveChatId } = useActiveChat();

  const { setChatUser } = useChatUser();
  const { setResponsiveChat } = useResponsiveChat();
  const { seenMessage, baseURL } = ApiFile;

  const socket = useSocket();
  const HandleSeenMessage = (userId) => {
    const apiSeen = `${seenMessage}/${userId}`;
  };

  const toggleData = async (chatData) => {
    const other = getOtherUser(chatData);
    setChatUser({ ...chatData, otherUser: other });
    setResponsiveChat(true);
    setActiveChatId(other?._id || chatData?.otherUser || null);
    if (other?._id) HandleSeenMessage(other._id);
  };

  const isActive = id === activeChatId;
  useEffect(() => {
    setBadge(
      (data?.lastMsg?.sender !== userData?.user?._id && data?.lastMsg?.sender !== userData?._id) && data?.unseen > 0
    );
  }, [data]);

  const formatTime = (ts) => {
    if (!ts) return "";
    const now = moment();
    const msgTime = moment(ts);
    if (now.diff(msgTime, "days") === 0) return msgTime.format("h:mm A");
    if (now.diff(msgTime, "days") === 1) return "Yesterday";
    return msgTime.format("MMM D");
  };

  return (
    <div
      className={`chat-conversation-item ${isActive ? "active" : ""}`}
      onClick={() => toggleData(data)}
    >
      <div className="chat-conversation-avatar">
        {img ? (
          <img src={img} alt="" className="chat-avatar-img" />
        ) : (
          <div className="chat-avatar-placeholder">
            {name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <span className={`chat-status-dot ${status === "online" ? "online" : "offline"}`} />
      </div>
      <div className="chat-conversation-content">
        <div className="chat-conversation-top">
          <span className="chat-conversation-name">{name}</span>
          <span className="chat-conversation-time">{formatTime(timestamp)}</span>
        </div>
        <div className="chat-conversation-bottom">
          <span className="chat-conversation-preview">{discrip}</span>
          {badge && <span className="chat-unseen-badge">{data?.unseen}</span>}
        </div>
      </div>
    </div>
  );
};

const ChatList = ({ searchQuery }) => {
  const { chatListData, setChatListData } = useChatList();

  const chatContainerRef = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const hasFetchedChatList = useRef(false);
  const isSearchFetching = useRef(false);
  const prevSearch = useRef(searchQuery);
  const searchTimer = useRef(null);
  const { activeChatId, setActiveChatId } = useActiveChat();
  const { getData, header1, userData } = ApiFunction();
  const { getAllConversation } = ApiFile;
  const [listLoading, setListLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  const handleChatList = async (pg, q) => {
    if (pg === 1) {
      setListLoading(true);
    } else {
      setLoadMoreLoading(true);
    }
    try {
      let url = `${getAllConversation}?page=${pg}&limit=${PAGE_SIZE}`;
      if (q) url += `&search=${encodeURIComponent(q)}`;
      const result = await getData(url, header1);
      if (result?.success) {
        const conversations = result?.conversations || [];
        const sorted = conversations.sort((a, b) => {
          const lastMsgA = a?.lastMsg;
          const lastMsgB = b?.lastMsg;
          if (!lastMsgA || !lastMsgB) return 0;
          return new Date(lastMsgB.createdAt) - new Date(lastMsgA.createdAt);
        });
        if (pg === 1) {
          setChatListData(sorted);
        } else {
          setChatListData((prev) => {
            const merged = [...prev, ...sorted];
            const seen = new Set();
            return merged.filter((item) => {
              if (seen.has(item._id)) return false;
              seen.add(item._id);
              return true;
            });
          });
        }
        if (conversations.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        if (pg === 1) setChatListData([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setListLoading(false);
      setLoadMoreLoading(false);
    }
  };

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el || loadMoreLoading || !hasMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      const nextPage = page + 1;
      setPage(nextPage);
      handleChatList(nextPage, searchQuery);
    }
  };

  useEffect(() => {
    if (!hasFetchedChatList.current && chatListData?.length === 0 && !isSearchFetching.current) {
      handleChatList(1, "");
      hasFetchedChatList.current = true;
    }
  }, [chatListData]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (hasFetchedChatList.current && searchQuery !== prevSearch.current) {
        prevSearch.current = searchQuery;
        isSearchFetching.current = true;
        setChatListData([]);
        setPage(1);
        setHasMore(true);
        handleChatList(1, searchQuery);
        setTimeout(() => { isSearchFetching.current = false; }, 0);
      }
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  const filteredList = chatListData;

  const skeletonCount = 4;

  return (
    <>
      <div className="chat-list-scroll" ref={chatContainerRef} onScroll={handleScroll}>
        {listLoading ? (
          <>
            {[...Array(skeletonCount)].map((_, index) => (
              <div key={index} className="chat-skeleton-item">
                <div className="skeleton-avatar" />
                <div className="skeleton-lines">
                  <div className="skeleton-line w-60" />
                  <div className="skeleton-line w-80" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {filteredList?.length > 0 ? (
              filteredList?.map((chat, index) => {
                const other = getOtherUser(chat);
                return (
                  <Fragment key={chat?._id}>
                    <ChatUsers
                      id={other?._id || chat?.otherUser || ""}
                      img={other?.image || ""}
                      data={chat}
                      name={other?.name || "Unknown"}
                      discrip={chat?.lastMsg?.message}
                      timestamp={chat?.lastMsg?.createdAt}
                      status={other?.status}
                    />
                  </Fragment>
                );
              })
            ) : (
              <div className="chat-empty-list">
                <p>{searchQuery ? "No conversations match your search" : "No conversations yet"}</p>
              </div>
            )}
            {loadMoreLoading && (
              <div className="chat-loading-more">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
            )}
            {!hasMore && chatListData.length > 0 && !searchQuery && (
              <div className="chat-end-list">
                <span>All conversations loaded</span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ChatList;
