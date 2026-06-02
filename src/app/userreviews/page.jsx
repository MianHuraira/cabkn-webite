
"use client"
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { NoshowData } from "@/components/assets/Images";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Container, Spinner } from "reactstrap";

export default function page() {
  const [Reviews, setReviews] = useState([]);
  const [Loading, setLoading] = useState(true);
  const {getData, header1} = ApiFunction();
  const userData = useSelector((state) => state.auth.user?.user);

  const getReviews = async () => {
    try {
      const response = await getData(
        "rating/all/" + userData?._id,
        header1
      );
      setReviews(response.ratings);
    } catch (error) {
      setLoading(false);
      console.log("errr----", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if(userData){
        getReviews();
    }

  }, [userData]);
  return (
    <>
       <Container>
       <div className="space-y-4 mt-5 bg-white rounded-2xl p-6 shadow-lg">
      {Loading ? (
        <div className="flex justify-center items-center h-60">
          <Spinner color="#fff">Loading...</Spinner>
        </div>
      ) : (
        <div className="bg-white p-6">
          {Reviews?.length > 0 ? (
            Reviews.map((review, index) => (
              <div
                key={index}
                className="flex flex-wrap md:flex-nowrap gap-4 items-start mb-8 border-b pb-6"
              >
                <Image
                  src={NoshowData}
                  alt="Profile"
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-gray-200 object-cover"
                />
                <div>
                  <h3 className="text-base md:text-xl font-Bold">
                    {review.user?.name}
                  </h3>
                  <div className="flex items-center text-yellow-500 text-sm mt-1">
                    {"★".repeat(review.rating)}
                    <span className="ml-2 font-Regular text-gray-500">
                      {review.rating} Star Ratings
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-Regular text-gray-700 mt-2">
                    {review.review}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-60">
              <p>No Reviews</p>
            </div>
          )}
        </div>
      )}
      </div>
      </Container>
    </>
  );
}
