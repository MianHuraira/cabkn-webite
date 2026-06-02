import axios from "axios";
import ApiFunction from "./ApiFunction";
const { userData } = ApiFunction();
const token = userData?.token;

// service by id
export const sendNewMsg = async ({ data }) => {
  try {
    const res = await axios.post(
      `${global.BASEURL}/msg/send`,
      {
        to_id: data.to_id,
        message: data.message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": `${token}`,
        },
      }
    );
    return res;
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
};

// get related service bg id
export const getSpecificUserChat = async ({ id, lastId = "" }) => {
  try {
    const res = await axios.get(
      `${global.BASEURL}/msg/messages/${id}/${lastId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": `${global.TOKEN}`,
        },
      }
    );
    return res;
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
};
export const getChatList = async (id = "") => {
  try {
    const res = await axios.get(`${global.BASEURL}/msg/conversations/` + id, {
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": `${global.TOKEN}`,
      },
    });
    return res;
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
};
// get related service bg id
export const notifySeen = async (id) => {
  try {
    const res = await axios.put(
      `${global.BASEURL}/msg/seen/${id}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": `${token}`,
        },
      }
    );
    return res;
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
};
export const getRelatedWHById = async ({ lastId, id }) => {
  try {
    const res = await axios.post(
      `${global.BASEURL}/service/getWhById/${id}`,
      {
        last_id: lastId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res;
  } catch (error) {
    console.log(error, "error");
    throw error;
  }
};
