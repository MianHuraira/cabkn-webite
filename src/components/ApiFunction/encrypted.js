import CryptoJS from "crypto-js";
const secret_key ='fwkjrngfekrjngkejnrgjk';

export const encryptData = (data) => {
  try {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      secret_key
    ).toString();
    return encryptedData;
  } catch (error) {
    console.error("Error encrypting data:", error);
  }
};

export const decryptData = (data) => {
  try {
    if (data) {
      const bytes = CryptoJS.AES.decrypt(data, secret_key);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData;
    }
  } catch (error) {
    console.error("Error decrypting data:", error);
  }
  return null;
};