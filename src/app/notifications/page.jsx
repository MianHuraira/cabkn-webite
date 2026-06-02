"use client";
import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import moment from "moment";
import { FaUserAlt } from "react-icons/fa";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { NoshowData } from "@/components/assets/Images";
import Image from "next/image";

const page = () => {
  const { getData, header1 } = ApiFunction();
  const [pagetications, setNotitications] = useState([]);
  const [loading, setloading] = useState(true);

  const GetCoupns = async () => {
    try {
      const res = await getData("notification/all/", header1);
      if (res?.success) {
        setNotitications(res?.notifications);
        setloading(false);
      } else {
        setNotitications([]);
        setloading(false);
      }
    } catch (error) {
      console.log(error);
      setloading(false);
    }
  };

  useEffect(() => {
    GetCoupns();
  }, []);

  return (
    <>
      <div className="bread">
        <h5 className="medium-font">Home/Notifications</h5>
        <h3 className="medium-font">Notifications</h3>
      </div>
      <Container className="mb-5">
        <div className="space-y-4 mt-5 p-6   ">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner color="#fff"></Spinner>
            </div>
          ) : pagetications?.length === 0 ? (
            <div className="d-flex mt-5 flex-col justify-content-center align-items-center">
              <Image
                src={NoshowData}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "5px",
                }}
                alt="No data available"
              />
              <h1 className=" font-medium text-xl mt-3">{"No Data Found!"}</h1>
            </div>
          ) : (
            pagetications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start space-x-4  pb-4"
                style={{ borderBottom: "1px solid #ccc" }}
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <FaUserAlt />
                </div>
                <div className="flex justify-between items-center w-100">
                  <div>
                    <h2 className="font-mediu text-xl">{notification.title}</h2>
                    <p className="text-sm text-gray-600">
                      {notification.description}
                    </p>
                    <span className="text-xs text-gray-500">
                      {moment(notification.createdAt).fromNow()}
                    </span>
                  </div>
                  <div>
                    {notification.image && (
                      <div className="cursor-pointer" onClick={() => notification.weburl? window.open(notification.weburl) : {}}>
                      <Image
                        src={notification.image}
                        width={100}
                        height={100}
                        style={{ marginTop: 20 }}
                      />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Container>
    </>
  );
};

export default page;
