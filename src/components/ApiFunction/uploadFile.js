
"use client"
import axios from "axios";
import imageCompression from "browser-image-compression";
import ApiFunction from "./ApiFunction";
import ApiFile from "./ApiFile";
import { isValidFileType } from "./isValidType";


export const uploadFile = async (file, general = false) => {  

    try {
      const { postData, header2 } = ApiFunction();
      const check = isValidFileType(file);
      if (!check && !general) {
        toast.error(
          "!Invalid file type. Please upload a valid image file. you can only select the jpg, jpeg, png, svg"
        );
        return;
      }
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = general
        ? file
        : await imageCompression(file, options);
      const formData = new FormData();
      formData.append("image", compressedFile);
      const response = await postData('image/upload', formData, header2);
      
      return response;
    } catch (error) {
      console.error("Error uploading file:", error?.response);
      throw error;
    }
  };