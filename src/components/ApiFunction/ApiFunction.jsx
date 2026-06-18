/* eslint-disable no-unused-vars */
// api.js
'use client'
import axios from "axios";
import { selectUser } from "../Redux/Slices/AuthSlice";
import { useSelector } from "react-redux";

export const useApi = () => {
  const userData = useSelector(selectUser);
  const token = userData?.token;
  const baseURL = "https://api.cabkn.com/api/";
  // const baseURL = "https://xjnhtpzb-5400.inc1.devtunnels.ms/api/"

  const baseUrlImage = "";
  const GoogleApiKey = "AIzaSyCkw_MZd-894MZUR4g1_p2XohCWTSTR8S4";
  
  const header1 = {
    "Content-Type": "application/json",
    "x-auth-token": token,
  };

  const header2 = {
    "Content-Type": "multipart/form-data",
    "x-auth-token": token,
  };
  const header3 = {};

  const axiosInstance = axios.create({
    baseURL,
  });

  const handleApiError = (error, method, endpoint) => {
    // More robust error logging without excessive console errors
    const errorInfo = {
      method,
      url: error.config?.url || endpoint,
      status: error.response?.status,
      message: error.message,
    };
    
    // Only log detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API ${method} Error:`, errorInfo);
    } else {
      console.error(`API ${method} Error:`, error.message);
    }
    
    // Don't re-throw, return undefined
    return undefined;
  };

  const getData = async (endpoint, headers = {}) => {
    try {
      const response = await axiosInstance.get(endpoint, {
        headers: {
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'GET', endpoint);
    }
  };

  const postData = async (endpoint, apiData, headers = {}) => {
    try {
      const response = await axiosInstance.post(endpoint, apiData, {
        headers: {
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'POST', endpoint);
    }
  };

  const deleteData = async (endpoint, headers = {}) => {
    try {
      const response = await axiosInstance.delete(endpoint, {
        headers: {
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'DELETE', endpoint);
    }
  };

  const putData = async (endpoint, apiData, headers = {}) => {
    try {
      const response = await axiosInstance.put(endpoint, apiData, {
        headers: {
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'PUT', endpoint);
    }
  };

  return {
    getData,
    postData,
    deleteData,
    putData,
    header1,
    header2,
    header3,
    GoogleApiKey,
    userData,
    baseURL,
    baseUrlImage,
  };
};

// For backward compatibility
export default useApi;
