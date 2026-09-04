// Redux store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./Slices/AuthSlice";
import cartReducer from "./Slices/CartSlice";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authReducer),
  cart: persistReducer({ key: "cart", storage }, cartReducer),
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    });
  },
});

const persistor = persistStore(store);

export { store, persistor };
