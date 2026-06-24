// Slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    paymentCards: [],
    isTipModal: false,
    tipOrderId: {},
    unreadCount: 0,
    notifUnreadCount: 0,
    notifLastTotal: 0,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },

    setTipModal(state, action) {
      state.isTipModal = action.payload;
    },
    setTipOrderId(state, action) {
      state.tipOrderId = action.payload;
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
    setNotifUnreadCount(state, action) {
      state.notifUnreadCount = action.payload;
    },
    setNotifLastTotal(state, action) {
      state.notifLastTotal = action.payload;
    },
    setPaymentCards(state, action) {
      const newCard = { ...action.payload };
      delete newCard.cardcvv;
      const isCardDuplicate = state.paymentCards.some(
        (card) => card.cardnumber === newCard.cardnumber
      );

      if (!isCardDuplicate) {
        state.paymentCards = [...state.paymentCards, newCard];
      } else {
        console.log("This card is already saved.");
      }
    },
  },
});

export const {
  setUser,
  logout,
  setAgeVerified,
  setAuthenticated,
  setPaymentCards,
  setTipModal,
  setTipOrderId,
  setUnreadCount,
  setNotifUnreadCount,
  setNotifLastTotal,
} = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;


export default authSlice.reducer;
