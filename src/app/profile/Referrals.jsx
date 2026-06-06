"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  FaTwitter,
  FaFacebook,
  FaRedditAlien,
  FaDiscord,
  FaWhatsapp,
  FaFacebookMessenger,
  FaTelegram,
  FaWeixin,
  FaClone,
} from "react-icons/fa";
import ApiFunction from "@/components/ApiFunction/ApiFunction";

export default function Referrals() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const {userData} =ApiFunction()
  const customStyle = {
    root: {
      background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
      borderRadius: 3,
      border: 0,
      boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
      color: "white",
    },
    copyContainer: {
      border: "1px solid blue",
      background: "rgb(0,0,0,0.7)",
    },
    title: {
      color: "aquamarine",
      fontStyle: "italic",
    },
  };
  const shareUrl = "https://cabkn.com/";
  const shareText = `Check out these amazing discounts on Cabkn! Use my referral code: ${userData?.user?.referral_code} to sign up and save.`;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const copyToClipboard = () => {
    const copyText = document.getElementById("myInput");
    navigator.clipboard.writeText(copyText.value);
    alert("Copied to clipboard!");
    handleClose();
  };

  const openShareLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'}>
      <h2 className="font-medium text-lg">Referrals</h2>
      <div className="flex items-center justify-between bg-[#ECECEC] p-4 rounded shadow-md mt-4 mb-4">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Share Code</h3>
            <p className="text-sm text-gray-500">{userData?.referral_code}</p>
          </div>
        </div>
        <button
          onClick={handleShow}
          className="px-5 py-2 text-white bg-[#005081] rounded-lg shadow hover:bg-[#005081]"
        >
          Invite
        </button>
      </div>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header>
          <Modal.Title>Share</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="flex justify-around flex-wrap">
            <div
              className="text-center cursor-pointer flex justify-center items-center gap-2 flex-col"
              onClick={() =>
                openShareLink(
                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    shareUrl
                  )}&text=${encodeURIComponent(shareText)}`
                )
              }
            >
              <FaTwitter className=" rounded-full p-2 text-4xl" />
              <p className="font-medium">Twitter</p>
            </div>
            <div
              className="text-center cursor-pointer flex justify-center items-center gap-2 flex-col"
              onClick={() =>
                openShareLink(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`
                )
              }
            >
              <FaFacebook className=" rounded-full p-2 text-4xl" />
              <p className="font-medium">Facebook</p>
            </div>
            <div
              className="text-center cursor-pointer flex justify-center items-center gap-2 flex-col"
              onClick={() =>
                openShareLink(
                  `https://www.reddit.com/submit?url=${encodeURIComponent(
                    shareUrl
                  )}&title=${encodeURIComponent(shareText)}`
                )
              }
            >
              <FaRedditAlien className=" rounded-full p-2 text-4xl" />
              <p className="font-medium">Reddit</p>
            </div>
            <div
              className="text-center cursor-pointer flex justify-center items-center gap-2 flex-col"
              onClick={() => alert("Discord sharing must be done manually.")}
            >
              <FaDiscord className=" rounded-full p-2 text-4xl" />
              <p className="font-medium">Discord</p>
            </div>
          </div>
          <div className="flex justify-around flex-wrap mt-4">
            <div
              className="text-center cursor-pointer flex justify-center items-center gap-2 flex-col"
              onClick={() =>
                openShareLink(
                  `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    shareText + " " + shareUrl
                  )}`
                )
              }
            >
              <FaWhatsapp className=" rounded-full p-2 text-4xl" />
              <p className="font-medium">WhatsApp</p>
            </div>
            <div
              className="text-center cursor-pointer flex justify-center items-center gap-2 flex-col"
              onClick={() => alert("Messenger sharing must be done manually.")}
            >
              <FaFacebookMessenger className="rounded-full p-2 text-4xl" />
              <p className="font-medium">Messenger</p>
            </div>
            <div
              className="text-center cursor-pointer flex justify-center items-center gap-2 flex-col"
              onClick={() =>
                openShareLink(
                  `https://t.me/share/url?url=${encodeURIComponent(
                    shareUrl
                  )}&text=${encodeURIComponent(shareText)}`
                )
              }
            >
              <FaTelegram className=" rounded-full p-2 text-4xl" />
              <p className="font-medium">Telegram</p>
            </div>
            <div
              className="text-center cursor-pointer flex justify-center items-center flex-col"
              onClick={() => alert("WeChat sharing must be done manually.")}
            >
              <FaWeixin className="rounded-full p-2 text-4xl" />
              <p className="font-medium">WeChat</p>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex items-center gap-2 w-full">
            <input
              id="myInput"
              type="url"
              className="flex-grow border rounded-md px-2 py-1 mr-2 font-medium"
              value={shareText}
              readOnly
            />
            <button
              onClick={copyToClipboard}
              className="bg-[#004a70] p-2 rounded-md"
            >
              <FaClone color="#fff" />
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
