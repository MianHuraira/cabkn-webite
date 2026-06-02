/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
/* eslint-disable array-bracket-newline */
/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
/* eslint-disable semi */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import ApiFunction from "./ApiFunction";
import { setTipModal, setTipOrderId, setUser } from "../Redux/Slices/AuthSlice";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const { userData } = ApiFunction();
  const token = userData?.token;
  const dispatch = useDispatch();

  const initializeSocket = () => {
    if (!token) return;

    const newSocket = io("https://api.cabkn.com/", {
      reconnectionAttempts: 15,
      transports: ["websocket"],
    });

    newSocket.emit("authenticate", token);
    newSocket.on("authenticated", (id) => {
      console.log("Socket authenticated with ID:", id);
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("unauthorized", (error) => {
      console.error("Unauthorized socket connection:", error.message);
    });

    newSocket.on("update-order-customer", (res) => {
      dispatch(setTipModal(true));
      dispatch(setTipOrderId(res?.order));
    });

    newSocket.on("user_update", (res) => {
      const responseBody = {
        token: userData?.token,
        success: true,
        newUser: false,
        user: res?.user,
      };

      dispatch(setUser(responseBody))
    });
    newSocket.on("disconnect", () => {
      console.log("Socket disconnected. Attempting to reconnect...");
      setSocket(null);
      initializeSocket();
    });

    socketRef.current = newSocket;
  };

  useEffect(() => {
    if (token) {
      initializeSocket();
      console.log("Socket Initialized");
    } else {
      console.log("No token found for authentication");
    }

    // Cleanup on unmount
    return () => {
      console.log("Disconnecting socket...");
      socketRef.current?.disconnect();
      setSocket(null);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
