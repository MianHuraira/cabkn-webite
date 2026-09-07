"use client";

import { store } from "../Redux/Store";
import { triggerLoginRequest } from "./actionToast";

export const isAuthenticated = () => {
  const user = store.getState()?.auth?.user;
  return Boolean(user && (user?.user || user?.token));
};

export const requireLogin = (message) => {
  if (isAuthenticated()) return true;
  triggerLoginRequest(message);
  return false;
};