/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
"use client"
import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Slider from "react-slick";
import ThingstodoCard from "./ThingstodoCard";
// import { useSelector } from "react-redux";
import { Button, Spinner } from "reactstrap";
import Image from "next/image";
import { NoshowData } from "../assets/Images";
import ApiFunction from "../ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";

export default function ServiceComponent() {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const { getData, header1 } = ApiFunction();
  const [Category, setCategory] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [SubCategory, setSubCategory] = useState([]);
  // const userData = useSelector((state) => state.auth.user?.user);
  const [loading, setloading] = useState(false);
  const [Count, setCount] = useState(1);
  const [Pagelength, setPagelength] = useState("");
  const [MoreLoading, setMoreLoading] = useState(false);

  const getCategory = async () => {
    try {
      const response = await getData("/servicecat/all/1", header1);
      const staticCategory = { _id: 0, name: "All" };
      const updatedCategories = [
        staticCategory,
        ...(response?.categories || []),
      ];

      setCategory(updatedCategories);
    } catch (error) {
      console.log(error);
    }
  };

  const getCategorydata = async () => {
    setloading(true);
    try {
      const response = await getData(
        selectedCategoryId === 0
          ? `/servicesubcat/all/${1}`
          : `/servicesubcat/all/${1}/${selectedCategoryId}`,
        header1
      );

      setSubCategory(response?.categories);
      setPagelength(response?.count?.currentPageSize);
      setloading(false);
    } catch (error) {
      setloading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getCategorydata();
  }, [selectedCategoryId]);

  const ShowMoreDAta = async () => {
    setCount(Count + 1);
    setMoreLoading(true);

    try {
      const response = await getData(
        selectedCategoryId === 0
          ? `/servicesubcat/all/${Count + 1}`
          : `/servicesubcat/all/${Count + 1}/${selectedCategoryId}`,
        header1
      );
      setSubCategory((prevCategories) => [
        ...prevCategories,
        ...response?.categories,
      ]);
      setCount(response?.count?.totalPage);
      setPagelength(response?.count?.currentPageSize);
      setMoreLoading(false);
    } catch (error) {
      setMoreLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);




  const settings2 = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 3,
    arrows: false,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const handleSelection = (category) => {
    router.push(`/service/${category?._id}?isServices=true`);
  };


  const handleItemClick = (item) => {
    const encodedData = encodeURIComponent(JSON.stringify(item));
    router.push(`/ride?data=${encodedData}`);
  };

  return (
    <div>

      <div className="d-flex justify-content-between align-items-center mb-4 mt-5">
        <div style={{ marginLeft: "1.4rem" }}>
          <h1 className="feedBack">Our Products</h1>
        </div>
      </div>

      <div className="slider-container p-2 " style={{ marginLeft: '10px' }}>
        <Slider {...settings2} key={Category.length}>
          {Category.map((category, index) => {
            const isSelected = selectedCategoryId === category._id;
            return (
              <div className="p-2">
                <div
                  className="CategoryMain text-center cursor-pointer"
                  style={{
                    padding: "10px",
                    background: isSelected
                      ? "linear-gradient(179.02deg, rgb(0, 74, 112) -69.5%, rgb(177, 176, 176) 99.16%)" // Gradient when selected
                      : "#ffff", // Default neutral gradient
                    color: isSelected ? "white" : "black",
                    borderRadius: "5px",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => setSelectedCategoryId(category._id)} // Set only the clicked ID
                >
                  <h1 className="font-medium text-base">{category?.name}</h1>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>

      <div className="slider-container p-5">
        {SubCategory.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {SubCategory?.map((testimonial, index) => (
                <ThingstodoCard
                  key={index}
                  testimonial={testimonial}
                  onClick={() => handleItemClick(testimonial)}
                  onClick2={() => handleSelection(testimonial)}
                  btnTitle={'Buy Product'}
                />
              ))}
            </div>
            <div className="flex justify-center items-center mt-5">
              {Pagelength > 1 ? (
                <>
                  <Button onClick={ShowMoreDAta} className="btnHome" style={{ width: 100, marginTop: 10, margin: 0, background: 'linear-gradient(179.02deg, rgb(0, 74, 112) -69.5%, rgb(177, 176, 176) 99.16%)' }}>
                    {MoreLoading ? (
                      <>
                        <Spinner size={"sm"} color="#fff" />
                      </>
                    ) : (
                      "See more"
                    )}
                  </Button>
                </>
              ) : (
                ""
              )}
            </div>
          </>
        ) : (
          <div className="d-flex mt-5 flex-col justify-content-center align-items-center">
            <Image
              src={NoshowData}
              style={{
                width: "200px",
                height: "200px",
                objectFit: "cover", // Ensure the image covers the card nicely
                borderRadius: "5px",
              }}
              alt="No data available"
            />
            <h1 className="font-medium text-xl mt-3">{"No Data Found!"}</h1>
          </div>
        )}
      </div>
    </div>
  );
}
