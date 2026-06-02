export const updateChatList = ({ chatList, newConversation }) => {
  const conversationIndex = chatList.findIndex(
    (chat) => chat._id === newConversation._id
  );
  let updatedChatList;
  if (conversationIndex !== -1) {
    updatedChatList = [...chatList];
    updatedChatList[conversationIndex] = newConversation;
  } else {
    updatedChatList = [...chatList, newConversation];
  }
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
};
