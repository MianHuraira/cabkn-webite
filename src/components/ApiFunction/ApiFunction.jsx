/* eslint-disable no-unused-vars */
// api.js
'use client'
import axios from "axios";
import { selectUser } from "../Redux/Slices/AuthSlice";
import { useSelector } from "react-redux";

const ApiFunction = () => {
  const userData = useSelector(selectUser);



  const token = userData?.token;
// 


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

  const getData = async (endpoint, headers = {}) => {
    try {
      const response = await axiosInstance.get(endpoint, {
        headers: {
          ...headers,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in GET request:", error);
      throw error;
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
      console.error("Error in POST request:", error);
      throw error;
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
      console.error("Error in DELETE request:", error);
      throw error;
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
      console.error("Error in PUT request:", error);
      throw error;
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

export default ApiFunction;
