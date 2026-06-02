
"use client"
import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import { Container, Spinner } from "react-bootstrap"; // Import Spinner for loading state
import ApiFunction from "../ApiFunction/ApiFunction";

function IntroVideo() {
  // const userData = useSelector((state) => state.auth.user?.user);

  const { header1, getData } = ApiFunction();
  const [FooterData, setFooterData] = useState(null); // Initially set to null
  const [isLoading, setIsLoading] = useState(true); // Loading state


  const getProfile = async () => {
    try {
      const response = await getData("users/footer", header1);
      setFooterData(response?.footer);
      setIsLoading(false); // Set loading to false when data is fetched
    } catch (error) {
      console.log(error);
      setIsLoading(false); // Set loading to false in case of error
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <Container>
      <div
        className="video-container mt-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        {isLoading ? (
          <Spinner animation="border" />
        ) : (
          FooterData?.videourl && (
            <video width="100%" height="auto" controls  autoPlay>
              <source src={FooterData?.videourl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )
        )}
      </div>
    </Container>
  );
}

export default IntroVideo;
