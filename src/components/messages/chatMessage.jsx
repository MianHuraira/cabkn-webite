/* eslint-disable no-unused-vars */
import React from "react";
import Moment from "react-moment";

const ChatMessage = ({ message, timestamp, left }) => {
  return (
    <div className={`chat-msg ${left ? "chat-msg-left" : "chat-msg-right"}`}>
      <div className={`chat-bubble ${left ? "chat-bubble-left" : "chat-bubble-right"}`}>
        <p className="chat-bubble-text">{message}</p>
      </div>
      <span className="chat-timestamp">
        <Moment fromNow>{timestamp}</Moment>
      </span>
    </div>
  );
};

export default ChatMessage;
