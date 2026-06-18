
"use client"
import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useApi } from "../ApiFunction/ApiFunction";

function IntroVideo() {
  const { header1, getData } = useApi();
  const [FooterData, setFooterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getProfile = async () => {
    try {
      setHasError(false);
      const response = await getData("users/footer", header1);
      setFooterData(response?.footer);
    } catch (error) {
      console.error("Failed to load footer data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <Container>
      <div
        className={`video-container mt-5 d-flex justify-content-center align-items-center ${loaded ? "animate-fade-in" : "opacity-0"}`}
        style={{ minHeight: "300px" }}
      >
        {isLoading ? (
          <Spinner animation="border" />
        ) : (
          FooterData?.videourl && (
            <video width="100%" height="auto" controls autoPlay onLoadedData={() => setLoaded(true)}>
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
