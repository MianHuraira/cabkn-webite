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

  

  useEffect(() => {
    setLastId(chatMsg[0]?._id);
  }, [chatMsg]);

  useEffect(() => {
    if (socket) {

      const handleMessage = (message) => {
        const isActiveChat =
          activeChatId === message?.sender ||
          userData?.user?._id === message?.sender;

        if (isActiveChat) {
          setChatMsg((prevChat) => [...prevChat, message]);
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
        socket.off("send-message");
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
    setIsLoading3(true);
    getUserChat(userId);
    setUsersId(userId);
  };

  // const initiateCall = async (channel, token) => {
  //   try {
  //     const response = await postData(
  //       createCall,
  //       {
  //         channel: channel,
  //         to_user: chatUser?.otherUser?._id,
  //       },
  //       header1
  //     );

  //     if (response?.message) {
  //       const videoCallData = {
  //         channel: channel,
  //         user: chatUser?.otherUser?._id,
  //       };

  //       // Set video call data in Redux store
  //       dispatch(setVideoCallData(videoCallData));

  //       // Determine route based on user type
  //       const redirectPath =
  //         userData?.user?.currentType === "service"
  //           ? `/service-provider/VideoCall?channel=${channel}&id=${chatUser?.otherUser?._id}`
  //           : `/customer/VideoCall?channel=${channel}&id=${chatUser?.otherUser?._id}`;

  //       router.push(redirectPath);
  //     } else {
  //       console.error("Call initiation failed. Response message is missing.");
  //       message.error("Error initiating the call. Please try again.");
  //     }
  //   } catch (error) {
  //     // Log the error details
  //     console.error("Error initiating the call:", error);
  //     message.error(error?.response?.data?.message);
  //   }
  // };

  // const createChannel = async () => {
  //   const generateRandomChannelName = (length) => {
  //     const characters =
  //       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //     let result = "";
  //     for (let i = 0; i < length; i++) {
  //       result += characters.charAt(
  //         Math.floor(Math.random() * characters.length)
  //       );
  //     }
  //     return result;
  //   };
  //   const channel = generateRandomChannelName(10);
  //   try {
  //     const response = await postData("users/get-token", { channel }, header1);
  //     if (response?.token) {
  //       initiateCall(channel, response?.token);
  //     }
  //   } catch (error) {}
  // };

  return (
    <div className="chat_height position-relative">
      <div
        className="d-flex align-items-center bg_dark rounded-4"
        style={{ borderRadius: "8px" }}
      >
        <div>
          <button
            className="d_left_button"
            onClick={() => {
              setResponsiveChat(false);
            }}
          >
            <ChevronLeft />
          </button>
        </div>

        <div className="w-100 py-2 px-3 d-flex justify-content-between align-items-center">
          {isLoading3 ? (
            <div className="chatSkltonmain w-50 mt-3">
              <Skeleton className="chatSklten0" />
            </div>
          ) : (
            <>
              <div className="d-flex gap-1 algin-items-center">
                {chatUser?.otherUser?.image ? (
                  <>
                    <img
                      className="rounded-[50%] bg-white chatImg00"
                      src={chatUser?.otherUser?.image}
                      alt=""
                    />
                  </>
                ) : (
                  <>
                    <Image
                      className="rounded-[50%] bg-white chatImg00"
                      src={StaticUser}
                      alt=""
                    />
                  </>
                )}
                <div className="d-flex flex-column">
                  <>
                    <span className=" text_white text-sm regular_font fs_11">{`${chatUser?.otherUser?.name}`}</span>
                    <span className="regular_font text_white text-sm fs_08">
                      {chatUser?.otherUser?.email}
                    </span>
                  </>
                </div>
              </div>
            </>
          )}
        </div>
     
      </div>

      <div className="position-relative">
        <div
          ref={chatMessagesRef}
          onScroll={handleScroll}
          className="chat-messages scrolbar px-2 py-3"
        >
          {isLoading3 ? (
            <div className="text-center flex justify-center mt-10 w-100">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              {isLoading2 && (
                <div className="text-center flex justify-center mt-10">
                  {" "}
                  <Spinner animation="border" role="status"></Spinner>
                </div>
              )}
              {chatMsg?.length > 0 &&
                chatMsg?.map((msg, index) => (
                  <Fragment key={index}>
                    <ChatMessage
                      left={userData?.user?._id === msg?.sender ? false : true}
                      message={msg?.message}
                      timestamp={`${msg?.createdAt}`}
                    />
                  </Fragment>
                ))}
            </>
          )}
        </div>
      </div>
      <form onSubmit={sendMessage} className="px-3">
        <div className="   w-100">
          <div className="d-flex my-3">
            <div className="position-relative hideFocus2  w-100 me-1">
              <input
                type="text"
                disabled={isLoading3}
                id="chatInput"
                required
                className="form-control rounded-3 ps-2 py-2 fs_10 "
                placeholder="Type your message.."
              />
            </div>
            <button
              disabled={isLoading3}
              className="send_btn rounded-3"
              type="submit"
            >
              <Send
                className="text-white p-0 m-0"
                style={{ width: "1.2rem" }}
              />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatMessageList;
