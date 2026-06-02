import { create } from 'zustand';

const usePaymentStore = create((set) => ({
  paymentData: null, // Initial State
  setPaymentData: (data) => set({ paymentData: data }), // Save Payment Data
  clearPaymentData: () => set({ paymentData: null }), // Clear Payment Data
}));

export default usePaymentStore;
