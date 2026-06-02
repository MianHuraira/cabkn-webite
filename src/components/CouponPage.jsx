"use client"

import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import { MdContentCopy } from "react-icons/md";
import { Spinner } from "react-bootstrap";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import Image from "next/image";
import { Bag, cross, discount, NoshowData } from "@/components/assets/Images";

export default function CouponPage() {
  const { getData, header1 } = ApiFunction();
  const [Coupons, setCoupons] = useState([]);
  const [show, setShow] = useState(false);
  const [CouponCode, setCouponCode] = useState("");
  const [loading, setloading] = useState(true);

  const handleClose = () => setShow(false);


  const GetCoupns = async () => {
    try {
      const res = await getData("coupon/me/1", header1);
      if (res?.success) {        
        setCoupons(res?.coupons ?? []); // Ensure it's an empty array if no data is returned
      }
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false); // Ensure loading is set to false in all cases
    }
  };
  


  useEffect(() => {
    GetCoupns();
  }, []);

  const handleShow = (data) => {
    setShow(true);
    setCouponCode(data);
  };

  return (
    <>
      <div className="bread">
        <h5 className="medium-font">Home/Offers</h5>
        <h3 className="medium-font">Offers</h3>
      </div>

      <Container className="mt-5">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner color="#fff"></Spinner>
          </div>
        ) : Coupons?.length == 0 ? (  <div className="d-flex mt-5 flex-col justify-content-center align-items-center">
          <Image
            src={NoshowData}
            style={{
              width: "150px",
              height: "150px",
              objectFit: "cover", // Ensure the image covers the card nicely
              borderRadius: "5px",
            }}
            alt="No data available"
          />
          <h1 className=" font-medium text-xl mt-3">{"No Coupons Found!"}</h1>
        </div>
      ):(
        <>
        {Coupons?.map((item) => (
          <div
            onClick={() => handleShow(item)}
            className="flex mt-2 items-center justify-between p-4 bg-white border rounded-lg shadow-md hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-center">
              {/* Icon */}
              <div className="flex items-center justify-center ">
                <Image src={Bag} alt="Shopping Bag" width={70} height={70} />
              </div>

              {/* Address and city details */}
              <div className="ml-4">
                <p className="text-base font-medium text-gray-800">
                  {item?.title}
                </p>
                <p className="text-sm text-gray-500 mt-2 mb-2">{`Kn-${item?.code}`}</p>

                <p className="text-sm text-gray-500">
                  {moment(item?.expirey_date).format("YYYY-MM-DD")}
                </p>
              </div>
            </div>

            {/* Arrow icon */}
            <button className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        ))}
      </>
      )}
      </Container>

      <Modal centered show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title></Modal.Title>
          <Image
            src={cross}
            onClick={handleClose}
            className="h-10 w-10 cursor-pointer"
            alt=""
          />
        </Modal.Header>
        <Modal.Body>
          <divc className="flex items-center flex-col justify-center gap-2">
            <p className="font-Medium">Special Offer</p>
            <Image src={discount} className="h-10 w-10" alt="" />
            <p className="font-Bold text-xl">{CouponCode?.title}</p>
            <button
              onClick={() => navigator.clipboard.writeText(CouponCode?.code)}
              className={`loginBtn mt-3 flex items-center`}
              style={{ borderRadius: "5px", height: 40 }}
            >
              {CouponCode?.code} {" "} <MdContentCopy />
            </button>
          </divc>
        </Modal.Body>
      </Modal>
    </>
  );
}
