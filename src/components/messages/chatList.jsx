/* eslint-disable no-use-before-define */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
import React, { Fragment, useEffect, useRef, useState } from "react";
// import Moment from "react-moment";

import { useSelector } from "react-redux";
import {
  useActiveChat,
  useChatList,
  useChatUser,
  useResponsiveChat,
} from "./context";
//
// import avatar1 from "@src/assets/images/portrait/small/avatar-s-5.jpg";

import { useSocket } from "../ApiFunction/SoketProvider";
import ApiFunction from "../ApiFunction/ApiFunction";
import ApiFile from "../ApiFunction/ApiFile";
import { NoshowData } from "../assets/Images";

const ChatUsers = ({ name, discrip, img, id, timestamp, status, data }) => {
  const { userData } = ApiFunction();
  const [badge, setBadge] = useState(false);
  const { activeChatId, setActiveChatId } = useActiveChat();

  const { setChatUser } = useChatUser();
  const { setResponsiveChat } = useResponsiveChat();
  const { seenMessage, baseURL } = ApiFile;

  // seen message api start
  const socket = useSocket();
  const HandleSeenMessage = (userId) => {
    const apiSeen = `${seenMessage}/${userId}`;
  };

  const toggleData = async (chatData) => {
    setChatUser(chatData);
    setResponsiveChat(true);
    setActiveChatId(chatData?.otherUser?._id); // Set the active chat ID
    HandleSeenMessage(chatData?.otherUser?._id);
  };

  const isActive = id === activeChatId;
  useEffect(() => {
    if (isActive) {
      toggleData(data);
    }
  }, [activeChatId, isActive]);
  useEffect(() => {
    setBadge(
      data?.lastMsg?.sender !== userData?._id && data?.lastMsg?.seen === false
    );
  }, [data]);

  return (
    <div>
      <div
        className={`_link_  border-0 `}
        style={{ cursor: "pointer" }}
        onClick={() => toggleData(data)}
      >
        <div
          className={`flex items-center chat-list-link border-b-1 gap-2 border-b-[#dee2e6] pb-2 pt-2 ps-3  ${
            isActive ? "active" : ""
          }`}
        >
          {img ? (
            <>
              <img
                src={img}
                alt=""
                className="w-12 h-12 rounded-full border border-gray-200 object-cover"
              />
            </>
          ) : (
            <>
              <img
                src={NoshowData}
                style={{
                  objectFit: "cover",
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                }}
                alt=""
                className="w-[100%] h-[100%] rounded-[50%]"
              />
            </>
          )}

          <div className="">
            <div className=" mt-1">
              <h4 className="my-0  font-Medium text-[0.9rem] mb-2 line-clamp-1">
                {name}
              </h4>
              <div className="chat_detail00 font-Regular text-[1rem] line-clamp-1">
                {discrip}
              </div>
            </div>
            <div className="time_div00">
              <h6
                className="chat_detail00 font-Regular line-clamp-1"
                style={{ whiteSpace: "nowrap" }}
              >
                {/* <Moment fromNow>{timestamp}</Moment> */}
              </h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatList = () => {
  const { chatListData, setChatListData } = useChatList();

  const chatContainerRef = useRef(null);
  const [count, setCount] = useState(0);
  const [lastId, setLastId] = useState(0);
  const hasFetchedChatList = useRef(false);
  const { activeChatId, setActiveChatId } = useActiveChat();
  const { getData, header1, userData } = ApiFunction();
  const { getAllConversation } = ApiFile;
  const [listLoading, setListLoading] = useState(false);
  // get all conversatioin api start
  const handleChatList = async (id) => {
    setListLoading(true);
    const getConversation = getAllConversation;
    await getData(getConversation, header1)
      .then((result) => {
        if (result?.success) {
          setListLoading(false);
          if (result?.conversations?.length > 0) {
            setChatListData(
              result?.conversations?.sort((a, b) => {
                const lastMsgA = a?.lastMsg;
                const lastMsgB = b?.lastMsg;
                if (!lastMsgA || !lastMsgB) {
                  return 0;
                }
                const createdAtA = new Date(lastMsgA.createdAt);
                const createdAtB = new Date(lastMsgB.createdAt);
                return createdAtB - createdAtA;
              })
            );
          } else {
            setChatListData([]);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setListLoading(false);
      })
      .finally(() => {
        setListLoading(false);
      });
  };

  // get all conversatioin api ended

  async function handleScroll() {
    const { scrollTop, clientHeight, scrollHeight } = chatContainerRef.current;
    if (lastId <= count) {
      if (Math.ceil(scrollHeight - scrollTop) - 1 < clientHeight) {
        try {
          // const result = await getChatList(lastId + 10);
          // if (result?.data?.success) {
          //   setLastId(lastId + 10);
          //   const newConversations = result?.data?.conversations.filter(conversation => (
          //     !chatListData.find(chat => chat._id === conversation._id)
          //   ));
          //   // Combine filtered new data with previous chatList
          //   setChatListData(prevChatList => [
          //     ...prevChatList,
          //     ...newConversations
          //   ].sort((a, b) => {
          //     const lastMsgA = a?.lastMsg;
          //     const lastMsgB = b?.lastMsg;
          //     if (!lastMsgA || !lastMsgB) {
          //       return 0;
          //     }
          //     const createdAtA = new Date(lastMsgA.createdAt);
          //     const createdAtB = new Date(lastMsgB.createdAt);
          //     return createdAtB - createdAtA; // Sort in ascending order for oldest first
          //   }));
          // }
        } catch (err) {
          console.log(err);
        }
      }
    }
  }

  useEffect(() => {
    if (!hasFetchedChatList.current && chatListData?.length === 0) {
      handleChatList();
      hasFetchedChatList.current = true;
    }
  }, [chatListData]);

  const skeletonCount = 4;

  return (
    <>
      {listLoading ? (
        <>
          {[...Array(skeletonCount)].map((_, index) => (
            <div key={index} className="chatSkltonmain mt-3">
              {/* <Skeleton className="chatSklten0" /> */}
            </div>
          ))}
        </>
      ) : (
        <>
          <div
            className="chat_height_contol scrolbar"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {chatListData?.length > 0 &&
              chatListData?.map((chat, index) => (
                <Fragment key={chat?._id}>
                  <ChatUsers
                    id={chat?.otherUser?._id}
                    img={chat?.otherUser?.image || ""}
                    data={chat}
                    name={`${chat?.otherUser?.name} `}
                    discrip={chat?.lastMsg?.message}
                    timestamp={chat?.lastMsg?.createdAt}
                  />
                </Fragment>
              ))}
          </div>
        </>
      )}
    </>
  );
};

export default ChatList;
