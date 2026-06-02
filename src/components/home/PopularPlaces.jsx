/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
import queryString from "query-string";
import React, { useEffect, useRef, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { FaLocationDot } from "react-icons/fa6";
import { useLocation, useNavigate, useParams } from "//";
import Slider from "react-slick";
import mapboxgl from "mapbox-gl";
import moment from "moment";
import { message } from "antd";
import ApiFunction from "../../ApiFunction/ApiFunction";
import { Helmet } from "react-helmet-async";
// import SEO from "../../SEO";

export default function PopularPlaces() {
  const { id } = useParams();
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const { getData, header3 } = ApiFunction();
  const [TimeSlot, setTimeSlot] = useState("");
  const [SelectedTime, setSelectedTime] = useState("");
  const [SubcatData, setSubcatData] = useState([]);
  const [ImageDAta, setImageDAta] = useState("");

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFybGVncmFudCIsImEiOiJjbTgwdmV0MjkweXB2MnFzNXBjM2x6NThnIn0.3oz3YGaDHiFDh8W5ALk09w";

 //// = useNavigate();
  const [Parseddata, setParseddata] = useState([]);
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const handleTime = (data) => {
    setSelectedTime(data);
  };

  useEffect(() => {
    if (id) {
      getSubCatData();
    }
  }, [id]);

  const getSubCatData = async () => {
    try {
      const response = await getData(`websubcat/details/${id}`, header3);
      setSubcatData(response?.category);
      setImageDAta(response?.category?.images[0]);
      marker(response?.category);
    } catch (error) {
      console.log(error);
    }
  };

  const marker = (data) => {
    const start = [data?.lng, data?.lat];
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: start || [17.363747, -62.754593], // Default center if start is undefined
      zoom: 12,
      attributionControl: false,
    });
    if (start) {
      new mapboxgl.Marker({ color: "green" })
        .setLngLat(start)
        .addTo(mapRef.current);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  };

  const HandleClick = () => {
    if (SubcatData?.category?.name === "Excursion") {
      if (SelectedTime) {
        const queryParams = queryString.stringify({
          data: JSON.stringify(SubcatData),
          time: JSON.stringify(SelectedTime),
        });

        navigate(`${"/ride"}?${queryParams}`);
      } else {
        message.error("Please Select Date and Time");
      }
    } else {
      const queryParams = queryString.stringify({
        data: JSON.stringify(SubcatData),
      });

      navigate(`${"/ride"}?${queryParams}`);
    }
  };

  return (
    <>
      {/* <SEO data={SubcatData} id={id} /> */}

      <div className="bread">
        <h5 className="medium-font">Home/Detail</h5>
        <h3 className="medium-font">Detail</h3>
      </div>

      <Container className=" bg-white rounded  shadow-lg p-0 mt-3">
        <div className="w-full lg:grid lg:grid-cols-12 gap-8 p-5">
          <div className="col-span-4">
            <Slider {...settings}>
              {SubcatData?.images?.map((item, index) => (
                <div key={index} style={{ textAlign: "center" }}>
                  <img
                    src={item}
                    style={{
                      width: "100%",
                      objectFit: "cover", // Ensure the image covers the card nicely
                      borderRadius: "5px",
                      height: "30rem",
                    }}
                  />
                </div>
              ))}
            </Slider>
          </div>

          <div className="col-span-8 flex flex-col h-full sm:mt-4">
            <h5 className="mb-1 CardName capitalize text-Bold">
              {SubcatData?.name}
            </h5>
            <div className="mt-1 flex items-center gap-1">
              <FaLocationDot />
              <p
                className="font-medium text-lg text-[#767e94] mt-0 "
                style={{ fontSize: 15 }}
              >
                {SubcatData?.address}
              </p>
            </div>

            <h1 className="font-medium mt-1 text-xl " style={{ fontSize: 14 }}>
              {"Description"}
            </h1>

            <p className="CardDes font-Regular mt-1 " style={{ fontSize: 15 }}>
              {SubcatData?.about}
            </p>

            <div
              id="map-container"
              className="w-full  mt-3"
              style={{ height: "20vh" }}
              ref={mapContainerRef}
            />

            {SubcatData?.category?.name === "Excursion" ? (
              <>
                {SubcatData?.timeslots && (
                  <p className="font-Regular mt-2">Select Time Slot</p>
                )}

                <div className="flex gap-2 mb-3 flex-wrap mt-2">
                  {SubcatData?.timeslots?.map((item) => {
                    return (
                      <div
                        className="dateSelection"
                        onClick={() => handleTime(item)}
                        style={{
                          background:
                            SelectedTime === item ? "#004a70" : "#fff",
                          color: SelectedTime === item ? "#fff" : "#000",
                        }}
                      >
                        <h6 className="font-medium">
                          {moment(item, "HH:mm").format("hh:mm A")}
                        </h6>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}

            <div className="mt-auto flex justify-end" onClick={HandleClick}>
              <Button className="btnHome">Book a Ride</Button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
