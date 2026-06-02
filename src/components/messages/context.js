// context.js
import React, { createContext, useContext, useState } from "react";

const ChatList = createContext();
const ActiveChat = createContext();
const ChatUser = createContext();
const ResponsiveChat = createContext();

export const ChatProvider = ({ children }) => {
  const [chatListData, setData] = useState([]);
  // Function to replace the entire chat list
  const setChatListData = (newData) => {
    setData(newData);
  };

  // Function to replace or push a new conversation
  const updateChatList = (newConversation) => {
    setData((prevChatList) => {
      // Check if the conversation exists
      const conversationIndex = prevChatList.findIndex(
        (chat) => chat._id === newConversation._id
      );

      let updatedChatList;
      if (conversationIndex !== -1) {
        // Replace the existing conversation
        updatedChatList = [...prevChatList];
        updatedChatList[conversationIndex] = newConversation;
      } else {
        // Push the new conversation
        updatedChatList = [...prevChatList, newConversation];
      }

      // Sort the chat list by the latest message
      return updatedChatList.sort((a, b) => {
        const lastMsgA = a?.lastMsg;
        const lastMsgB = b?.lastMsg;
        if (!lastMsgA || !lastMsgB) {
          return 0;
        }
        const createdAtA = new Date(lastMsgA.createdAt);
        const createdAtB = new Date(lastMsgB.createdAt);
        return createdAtB - createdAtA; // Sort in descending order for newest first
      });
    });
  };

  return (
    <ChatList.Provider value={{ chatListData, setChatListData, updateChatList }}>
      {children}
    </ChatList.Provider>
  );
};
export const ActiveChatProvider = ({ children }) => {
  const [activeChatId, setData] = useState(null);

  const setActiveChatId = (newData) => {
    setData(newData);
  };

  return (
    <ActiveChat.Provider value={{ activeChatId, setActiveChatId }}>
      {children}
    </ActiveChat.Provider>
  );
};
export const ChatUserProvider = ({ children }) => {
  const [chatUser, setData] = useState(null);

  const setChatUser = (newData) => {
    setData(newData);
  };

  return (
    <ChatUser.Provider value={{ chatUser, setChatUser }}>
      {children}
    </ChatUser.Provider>
  );
};
export const ResponsiveChatProvider = ({ children }) => {
  const [responsiveChat, setData] = useState(false);

  const setResponsiveChat = (newData) => {
    setData(newData);
  };

  return (
    <ResponsiveChat.Provider value={{ responsiveChat, setResponsiveChat }}>
      {children}
    </ResponsiveChat.Provider>
  );
};

export const useChatList = () => {
  const context = useContext(ChatList);
  if (!context) {
    throw new Error("useMyContext must be used within a Chat Provider");
  }
  return context;
};
export const useActiveChat = () => {
  const context = useContext(ActiveChat);
  if (!context) {
    throw new Error("useMyContext must be used within a ActiveChat Provider");
  }
  return context;
};
export const useChatUser = () => {
  const context = useContext(ChatUser);
  if (!context) {
    throw new Error("useMyContext must be used within a ChatUser Provider");
  }
  return context;
};
export const useResponsiveChat = () => {
  const context = useContext(ResponsiveChat);
  if (!context) {
    throw new Error(
      "useMyContext must be used within a responsive chat Provider"
    );
  }
  return context;
};
