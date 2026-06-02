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
    setPaymentCards(state, action) {
      const newCard = { ...action.payload };
      delete newCard.cardcvv;
      const isCardDuplicate = state.paymentCards.some(
        (card) => card.cardnumber === newCard.cardnumber
      );

      if (!isCardDuplicate) {
        state.paymentCards = [...state.paymentCards, newCard];
        console.log("Card added successfully!");
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
} = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;


export default authSlice.reducer;
