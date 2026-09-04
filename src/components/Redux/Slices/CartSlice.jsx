import { createSlice } from "@reduxjs/toolkit";

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
  round(items.reduce((total, item) => total + lineTotal(item), 0));

const initialState = {
  cartItems: [],
  totalPrice: 0,
  isCartOpen: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const selectedColor = product.selectedColor || product.ProductColor || "";
      const selectedSize = product.selectedSize || product.Size || "";
      const addQty = parseInt(product.cartQuantity || product.incDec || 1, 10);

      // Match item by ID AND variants
      const existingProduct = state.cartItems.find(
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
        state.cartItems.push({
          ...product,
          cartQuantity: Math.min(addQty, maxQty),
          selectedColor,
          selectedSize,
        });
      }

      state.totalPrice = cartSum(state.cartItems);
    },

    removeFromCart: (state, action) => {
      const { productId, selectedColor, selectedSize } =
        typeof action.payload === "object"
          ? action.payload
          : { productId: action.payload, selectedColor: null, selectedSize: null };

      state.cartItems = state.cartItems.filter((item) => {
        if (item._id !== productId) return true;
        if (selectedColor !== null && (item.selectedColor || "") !== (selectedColor || "")) {
          return true;
        }
        if (selectedSize !== null && (item.selectedSize || "") !== (selectedSize || "")) {
          return true;
        }
        return false;
      });

      state.totalPrice = cartSum(state.cartItems);
    },

    updateQuantity: (state, action) => {
      const { productId, quantity, selectedColor, selectedSize } = action.payload;
      const product = state.cartItems.find((item) => {
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
          state.cartItems = state.cartItems.filter((item) => item !== product);
        } else {
          const maxQty = Number(product.quantity || 99);
          product.cartQuantity = Math.min(quantity, maxQty);
        }
      }

      state.totalPrice = cartSum(state.cartItems);
    },

    updateCartItemDetails: (state, action) => {
      const { productId, selectedColor, selectedSize, oldColor, oldSize } = action.payload;
      const product = state.cartItems.find((item) => {
        if (item._id !== productId) return false;
        if (oldColor !== undefined && (item.selectedColor || "") !== (oldColor || "")) return false;
        if (oldSize !== undefined && (item.selectedSize || "") !== (oldSize || "")) return false;
        return true;
      });

      if (product) {
        if (selectedColor !== undefined) product.selectedColor = selectedColor;
        if (selectedSize !== undefined) product.selectedSize = selectedSize;
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.totalPrice = 0;
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
});

export const {
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
