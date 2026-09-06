import { createSlice } from "@reduxjs/toolkit";
import { setUser, logout } from "./AuthSlice";

const round = (val) => Number((Number(val) || 0).toFixed(2));

const getItemDiscountPercent = (item) => {
  const n = Number(item?.discountPercent ?? item?.discount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, 100);
};

const applyItemDiscount = (amount, item) => {
  const base = round(amount);
  const percent = getItemDiscountPercent(item);
  if (percent <= 0 || !(base > 0)) return base;
  return round(base * (1 - percent / 100));
};

const lineTotal = (item) => {
  const unit = applyItemDiscount(
    item.location_price || item.price || 0,
    item
  );
  return unit * parseInt(item.cartQuantity || 1, 10);
};

const cartSum = (items) =>
  round((items || []).reduce((total, item) => total + lineTotal(item), 0));

const syncActiveCart = (state) => {
  if (!state.cartsByUser || typeof state.cartsByUser !== "object") {
    state.cartsByUser = {};
  }
  const currentId = state.activeUserId;
  if (!currentId) {
    state.cartItems = [];
    state.totalPrice = 0;
    return;
  }
  if (!state.cartsByUser[currentId]) {
    // If state.cartItems already had items from a previous single-user store version, migrate them
    state.cartsByUser[currentId] = {
      cartItems: Array.isArray(state.cartItems) && state.cartItems.length > 0 ? state.cartItems : [],
      totalPrice: Number(state.totalPrice) || 0,
    };
  }
  state.cartItems = state.cartsByUser[currentId].cartItems || [];
  state.totalPrice = state.cartsByUser[currentId].totalPrice || 0;
};

const initialState = {
  cartsByUser: {}, // { [userId]: { cartItems: [], totalPrice: 0 } }
  activeUserId: null,
  cartItems: [],   // Active user's items
  totalPrice: 0,   // Active user's total price
  isCartOpen: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    syncUserCart: (state, action) => {
      const userId = action.payload || null;
      state.activeUserId = userId;
      syncActiveCart(state);
    },

    addToCart: (state, action) => {
      const product = action.payload || {};
      const targetUserId = product.userId || state.activeUserId;
      if (!targetUserId) {
        return;
      }
      state.activeUserId = targetUserId;
      if (!state.cartsByUser) state.cartsByUser = {};
      if (!state.cartsByUser[targetUserId]) {
        state.cartsByUser[targetUserId] = { cartItems: [], totalPrice: 0 };
      }

      const userCart = state.cartsByUser[targetUserId];
      if (!Array.isArray(userCart.cartItems)) {
        userCart.cartItems = [];
      }

      const selectedColor = product.selectedColor || product.ProductColor || "";
      const selectedSize = product.selectedSize || product.Size || "";
      const addQty = parseInt(product.cartQuantity || product.incDec || 1, 10);

      // Match item by ID AND variants
      const existingProduct = userCart.cartItems.find(
        (item) =>
          item._id === product._id &&
          (item.selectedColor || "") === selectedColor &&
          (item.selectedSize || "") === selectedSize
      );

      const maxQty = Number(product.quantity || product.maxQuantity || 99);

      if (existingProduct) {
        existingProduct.cartQuantity = Math.min(
          existingProduct.cartQuantity + addQty,
          maxQty
        );
      } else {
        userCart.cartItems.push({
          ...product,
          cartQuantity: Math.min(addQty, maxQty),
          selectedColor,
          selectedSize,
        });
      }

      userCart.totalPrice = cartSum(userCart.cartItems);
      syncActiveCart(state);
    },

    removeFromCart: (state, action) => {
      const targetUserId = action.payload?.userId || state.activeUserId;
      if (!targetUserId || !state.cartsByUser?.[targetUserId]) return;

      const userCart = state.cartsByUser[targetUserId];
      const { productId, selectedColor, selectedSize } =
        typeof action.payload === "object"
          ? action.payload
          : { productId: action.payload, selectedColor: null, selectedSize: null };

      userCart.cartItems = (userCart.cartItems || []).filter((item) => {
        if (item._id !== productId) return true;
        if (selectedColor !== null && (item.selectedColor || "") !== (selectedColor || "")) {
          return true;
        }
        if (selectedSize !== null && (item.selectedSize || "") !== (selectedSize || "")) {
          return true;
        }
        return false;
      });

      userCart.totalPrice = cartSum(userCart.cartItems);
      syncActiveCart(state);
    },

    updateQuantity: (state, action) => {
      const targetUserId = action.payload?.userId || state.activeUserId;
      if (!targetUserId || !state.cartsByUser?.[targetUserId]) return;

      const userCart = state.cartsByUser[targetUserId];
      const { productId, quantity, selectedColor, selectedSize } = action.payload;

      const product = (userCart.cartItems || []).find((item) => {
        if (item._id !== productId) return false;
        if (selectedColor !== undefined && (item.selectedColor || "") !== (selectedColor || "")) {
          return false;
        }
        if (selectedSize !== undefined && (item.selectedSize || "") !== (selectedSize || "")) {
          return false;
        }
        return true;
      });

      if (product) {
        if (quantity <= 0) {
          userCart.cartItems = userCart.cartItems.filter((item) => item !== product);
        } else {
          const maxQty = Number(product.quantity || 99);
          product.cartQuantity = Math.min(quantity, maxQty);
        }
      }

      userCart.totalPrice = cartSum(userCart.cartItems);
      syncActiveCart(state);
    },

    updateCartItemDetails: (state, action) => {
      const targetUserId = action.payload?.userId || state.activeUserId;
      if (!targetUserId || !state.cartsByUser?.[targetUserId]) return;

      const userCart = state.cartsByUser[targetUserId];
      const { productId, selectedColor, selectedSize, oldColor, oldSize } = action.payload;
      const product = (userCart.cartItems || []).find((item) => {
        if (item._id !== productId) return false;
        if (oldColor !== undefined && (item.selectedColor || "") !== (oldColor || "")) return false;
        if (oldSize !== undefined && (item.selectedSize || "") !== (oldSize || "")) return false;
        return true;
      });

      if (product) {
        if (selectedColor !== undefined) product.selectedColor = selectedColor;
        if (selectedSize !== undefined) product.selectedSize = selectedSize;
      }
      syncActiveCart(state);
    },

    clearCart: (state, action) => {
      const targetUserId = action.payload?.userId || action.payload || state.activeUserId;
      if (targetUserId && state.cartsByUser?.[targetUserId]) {
        state.cartsByUser[targetUserId].cartItems = [];
        state.cartsByUser[targetUserId].totalPrice = 0;
      }
      if (!targetUserId) {
        state.cartItems = [];
        state.totalPrice = 0;
      } else {
        syncActiveCart(state);
      }
    },

    openCart: (state) => {
      state.isCartOpen = true;
    },

    closeCart: (state) => {
      state.isCartOpen = false;
    },

    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setUser, (state, action) => {
        const userObj = action.payload;
        const userId =
          userObj?.user?._id ||
          userObj?._id ||
          (typeof userObj === "string" ? userObj : null);
        state.activeUserId = userId || null;
        syncActiveCart(state);
      })
      .addCase(logout, (state) => {
        state.activeUserId = null;
        state.cartItems = [];
        state.totalPrice = 0;
        state.isCartOpen = false;
      });
  },
});

export const {
  syncUserCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  updateCartItemDetails,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;

export default cartSlice.reducer;
