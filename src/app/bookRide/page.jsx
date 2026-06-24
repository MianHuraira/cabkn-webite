"use client";

import React, { lazy, Suspense, useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import Spinner from "react-bootstrap/Spinner";

import { MdOutlineMyLocation } from "react-icons/md";
import { Button, FormFeedback, Input, Label } from "reactstrap";
import Modal from "react-bootstrap/Modal";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import axios from "axios";
import { Checkbox, message, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
const apiKey = "0FGR7.1720815360";
const apiSecret =
  "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
const tokenUrl = "https://jad.cash/HAPI/token";
const paymentUrl = "https://jad.cash/HAPI/cardpayment";
import { FaWallet } from "react-icons/fa";
import moment from "moment";
import { Container } from "react-bootstrap";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useSocket } from "@/components/ApiFunction/SoketProvider";
import { setPaymentCards, setUser } from "@/components/Redux/Slices/AuthSlice";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { BsCashCoin } from "react-icons/bs";

import { NoshowData } from "@/components/assets/Images";
import { Controller } from "react-hook-form";

const CreateRide = () => {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const { putData, postData, getData, header1, userData } = ApiFunction();

  const socket = useSocket();
  // const userData = useSelector((state) => state.auth.user?.user);
  const [AdditionalPrice, setAdditionalPrice] = useState("");
  const paymentCards = useSelector((state) => state.auth.paymentCards);
  const dispatch = useDispatch();
  const [productDetail, setProductDetail] = useState(null);
  const [isExitedRide, setExitedRide] = useState([]);
  const [mainLoading, setMainLoading] = useState(false);
  const [order_id, setOrder_id] = useState("");
  const [CabPrice, setCabPrice] = useState("");
  const [MakePaymentModal, setMakePaymentModal] = useState(false);
  const [loading, setloading] = useState(false);
  const [isSavedCard, setSavedCard] = useState(false);
  const [PaymentMethod, setPaymentMethod] = useState("");
  const [DriverRequest, setDriverRequest] = useState([]);
  const [RefIdPayement, setRefId] = useState("");
  const [RequestId, setRequestId] = useState("");
  const [RideType, setRideType] = useState("");
  const [pincode, setPincode] = useState("");
  const [PassangerCount, setPassangerCount] = useState("");

  const [increasedPrice, setIncreasedPrice] = useState(0);
  const [ProductData, setProductData] = useState([]);
  const [Count, setCount] = useState("");
  const [prices, setPrices] = useState([]);
  const [WalletLoading, setWalletLoading] = useState(false);
  const [Passanger, setPassanger] = useState(false);
  const router = useRouter();
  const [cardDetails, setCardDetails] = useState({
    price: productDetail?.price || "",
    cvc: "",
    expiry: "",
    name: "",
    number: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setPassangerCount(e.target.value);
  };

  const areAllFieldsFilled = () => {
    return Object.values(cardDetails).every((value) => value?.trim() !== "");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };

      return updatedDetails;
    });
  };

  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);

  const handleClose = () => setShow(false);

  const CancelRequest = async () => {
    if (socket) {
      const body = {
        requestId: RequestId,
      };
      socket.emit("delete-request-customer", body, (res) => {
        message.success(res?.message);
        router.push("/");
      });
    } else {
      message.error("No Internet Connection");
    }
  };

  const handleShow = () => {
    if (PaymentMethod == "jad") {
      setShow(true);
    } else if (PaymentMethod == "wallet") {
      paymentwithWAllet();
    } else if (PaymentMethod == "cash") {
      cashPayment();
    }
  };

  const generateCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let code = "";

    for (let i = 0; i < 2; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 6; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    setOrder_id(code);
  };

  const generatePinCode = () => {
    const numbers = "0123456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    setPincode(code);
  };

  useEffect(() => {
    const row = encodedData
      ? JSON.parse(decodeURIComponent(encodedData))
      : null;

    if (row) {
      generateCode();
      generatePinCode();
      setProductDetail(row);
      if (row.price) {
        setCardDetails((prevDetails) => ({
          ...prevDetails,
          price: parsedDetail.price,
        }));
      }
    }
  }, []);

  const ActivePayment = async (RefId) => {
    setRefId(RefId);
    const apiPrice = productDetail?.stop?.length
      ? changePrice(
          (RideType?.price || 0) + (productDetail?.stop?.length * 5 || 0),
        )
      : changePrice(RideType?.price || 0);

    try {
      const paymetbody = {
        paymentId: RefId,
        amount: apiPrice,
      };

      const res = await putData(
        `users/order-card-payment`,
        paymetbody,
        header1,
      );

      let newDate = null;

      if (productDetail?.schedule_date && productDetail?.schedule_time) {
        newDate = moment(productDetail?.schedule_date)
          .set({
            hour: parseInt(productDetail?.schedule_time.split(":")[0], 10),
            minute: parseInt(productDetail?.schedule_time.split(":")[1], 10),
          })
          .toISOString();
      }

      let FavUserId = productDetail?.FavUserId;
      let service = productDetail?.service;

      const body = {
        couponId: "",
        order_id: order_id,
        pincode: pincode,
        paymentType: "paid",
        bookingtype: productDetail?.bookingtype,
        liability: RideType?._id || "",
        end_address: productDetail?.metaTitle,
        end_lat: productDetail?.end[1],
        end_lng: productDetail?.end[0],
        passengerCount: PassangerCount,
        price: (Number(CabPrice) || 0) + Number(apiPrice),
        start_address: productDetail?.name,
        start_lat: productDetail?.start[1],
        start_lng: productDetail?.start[0],
        type: productDetail?.type,
        distance: productDetail?.distance,
        stops: productDetail?.stop,
        ...(service ? { service } : {}),
        ...(productDetail?.FavUserId ? { FavUserId } : {}),
        ...(productDetail?.bookingtype === "schedule" && {
          schedule_time: newDate,
          schedule_date: productDetail?.schedule_date,
        }),
        ...(productDetail?.travlers > 0 && {
          travelers: productDetail?.travlers,
          subcatId: productDetail?.subcatId,
        }),
      };

      if (socket) {
        socket.emit("send-request-customer", body, (res) => {
          message.success(res?.message);
          if (res?.success) {
            setRequestId(res?.request?._id);
            setShow(false);
            setTimeout(() => {
              setShow1(true);
            }, 500);
          }
        });
      }
      setloading(false);
    } catch (error) {
      setloading(false);
      console.log(error);
    }
  };

  async function getToken() {
    const url = `${tokenUrl}`;
    const params = new URLSearchParams({
      apikey: apiKey,
      secret: apiSecret,
      grant_type: "credentials",
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  const submitPayment = async (token, paydata) => {
    try {
      const postData = new URLSearchParams({
        token: token,
        paydata: JSON.stringify(paydata),
      }).toString();

      // if (isSavedCard) {
      dispatch(setPaymentCards(paydata));
      // }

      const response = await axios.post(paymentUrl, postData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data;
    } catch (error) {
      console.log(error);

      setloading(false);
      throw error;
    }
  };

  const jadAPiFunction = async () => {
    setloading(true);
    const tokenResponse = await getToken();
    if (tokenResponse.result !== "Success") {
      throw new Error(
        `Failed to obtain token: ${JSON.stringify(tokenResponse)}`,
      );
    }

    const token = tokenResponse.data.token;
    const finalPrice = 10 * 2.7;

    const dateString = cardDetails?.expiry;
    const [month, year] = dateString.split("/");
    const paydata = {
      live: "1",
      timestamp: moment(new Date()).format("YYYYMMDDHHmmss"),
      refnum: "101",
      jadnumber: "101310573865",
      amount: finalPrice?.toFixed(2),
      cardnumber: cardDetails.number,
      cardexpmonth: month,
      cardexpyear: year,
      cardcvv: cardDetails.cvc,
      cardfirstname: "",
      cardlastname: "",
      address: "",
      city: "",
      state: "",
      postalcode: "",
      country: "",
      email: cardDetails?.email,
      phone: cardDetails?.phone,
    };

    try {
      const paymentResponse = await submitPayment(token, paydata);
      setloading(false);
      if (paymentResponse?.result == "Success") {
        if (paymentResponse?.refid) {
          ActivePayment(paymentResponse?.refid);
        }
      } else {
        message.error(paymentResponse?.message);
        setloading(false);
      }
    } catch (error) {
      setloading(false);
    }
  };

  const paymentwithWAllet = async () => {
    try {
      setWalletLoading(true);

      if (userData?.user?.amount < RideType?.price * productDetail?.distance) {
        message.error("Insufficient wallet balance");
        throw new Error("Insufficient wallet balance");
      }

      const apiPrice = productDetail?.stop?.length
        ? changePrice(
            (RideType?.price || 0) + (productDetail?.stop?.length * 5 || 0),
          )
        : changePrice(RideType?.price || 0);

      const paymetbody = { amount: apiPrice };

      let newDate = null;

      if (productDetail?.schedule_date && productDetail?.schedule_time) {
        newDate = moment(productDetail?.schedule_date)
          .set({
            hour: parseInt(productDetail?.schedule_time.split(":")[0], 10),
            minute: parseInt(productDetail?.schedule_time.split(":")[1], 10),
          })
          .toISOString();
      }

      let FavUserId = productDetail?.FavUserId;
      let service = productDetail?.service;

      const body = {
        couponId: "",
        order_id: order_id,
        pincode: pincode,
        paymentType: "wallet",
        bookingtype: productDetail?.bookingtype,
        liability: RideType?._id || "",
        end_address: productDetail?.metaTitle,
        end_lat: productDetail?.end[1],
        end_lng: productDetail?.end[0],
        price: CabPrice ? CabPrice + apiPrice : apiPrice,
        passengerCount: PassangerCount,
        start_address: productDetail?.name,
        start_lat: productDetail?.start[1],
        start_lng: productDetail?.start[0],
        type: productDetail?.type,
        distance: productDetail?.distance,
        stops: productDetail?.stop,
        color: productDetail?.color || "",
        size: productDetail?.size || "",
        quantity: productDetail?.qty,
        ...(service ? { service } : {}),
        ...(FavUserId ? { FavUserId } : {}),
        ...(productDetail?.bookingtype === "schedule" && {
          schedule_time: newDate,
          schedule_date: productDetail?.schedule_date,
        }),
        ...(productDetail?.travlers > 0 && {
          travelers: productDetail?.travlers,
          subcatId: productDetail?.subcatId,
        }),
      };

      const res = await putData(
        "users/order-wallet-payment",
        paymetbody,
        header1,
      );

      const responseBody = {
        token: userData?.token,
        success: true,
        newUser: false,
        user: res?.user,
      };

      dispatch(setUser(responseBody));

      if (!res?.success) {
        throw new Error(res?.message || "Payment failed");
      }

      if (socket) {
        socket.emit("send-request-customer", body, (res) => {
          message.success(res?.message);
          if (res?.success) {
            setRequestId(res?.request?._id);
            setShow(false);
            setTimeout(() => setShow1(true), 500);
          }
        });
      }
    } catch (error) {
      message.error(error.message || "Something went wrong");
    } finally {
      setWalletLoading(false);
    }
  };

  const cashPayment = async () => {
    try {
      setWalletLoading(true);
      const apiPrice = productDetail?.stop?.length
        ? changePrice(
            (RideType?.price || 0) + (productDetail?.stop?.length * 5 || 0),
          )
        : changePrice(RideType?.price || 0);

      let newDate = null;

      if (productDetail?.schedule_date && productDetail?.schedule_time) {
        newDate = moment(productDetail?.schedule_date)
          .set({
            hour: parseInt(productDetail?.schedule_time.split(":")[0], 10),
            minute: parseInt(productDetail?.schedule_time.split(":")[1], 10),
          })
          .toISOString();
      }

      let FavUserId = productDetail?.FavUserId;
      let service = productDetail?.service;

      const body = {
        couponId: "",
        order_id: order_id,
        paymentType: "cash",
        pincode: pincode,
        bookingtype: productDetail?.bookingtype,
        liability: RideType?._id || "",
        end_address: productDetail?.metaTitle,
        end_lat: productDetail?.end[1],
        end_lng: productDetail?.end[0],
        price: CabPrice ? CabPrice + apiPrice : apiPrice,
        passengerCount: PassangerCount,
        start_address: productDetail?.name,
        start_lat: productDetail?.start[1],
        start_lng: productDetail?.start[0],
        type: productDetail?.type,
        distance: productDetail?.distance,
        stops: productDetail?.stop,
        color: productDetail?.color || "",
        size: productDetail?.size || "",
        quantity: productDetail?.qty,
        ...(service ? { service } : {}),
        ...(FavUserId ? { FavUserId } : {}),
        ...(productDetail?.bookingtype === "schedule" && {
          schedule_time: newDate,
          schedule_date: productDetail?.schedule_date,
        }),
        ...(productDetail?.travlers > 0 && {
          travelers: productDetail?.travlers,
          subcatId: productDetail?.subcatId,
        }),
      };

      if (socket) {
        socket.emit("send-request-customer", body, (res) => {
          message.success(res?.message);
          if (res?.success) {
            setRequestId(res?.request?._id);
            setShow(false);
            setTimeout(() => setShow1(true), 500);
          }
        });
      }
    } catch (error) {
      console.log(error);

      message.error(error.message || "Something went wrong");
    } finally {
      setWalletLoading(false);
    }
  };

  const onChangeSchedule = (e) => {
    setPassanger(e.target.checked);
  };

  useEffect(() => {
    const finalAdditionalPrice = AdditionalPrice * PassangerCount.trim("");
    setCabPrice(finalAdditionalPrice);
  }, [PassangerCount, AdditionalPrice]);

  const getProfile = async () => {
    try {
      const response = await getData("/users/me", header1);
      dispatch(setUser(response));
    } catch (error) {}
  };

  const changePrice = (baseRate) => {
    if (!productDetail) return baseRate;

    const currentHour = new Date().getHours();
    const perKmRate = 3.246;
    const distanceCost = productDetail?.distance * perKmRate;
    const plusPrice = baseRate + distanceCost;
    const onePercent = plusPrice / 100;
    let totalIncrement = 0;

    if (currentHour >= 22 || currentHour < 2) {
      totalIncrement = onePercent * 25;
    } else if (currentHour >= 2 && currentHour < 5) {
      totalIncrement = onePercent * 30;
    }

    totalIncrement = parseFloat(totalIncrement.toFixed(2));

    let finalPrice = plusPrice;

    if (productDetail.perPersonPrice && productDetail.travlers) {
      finalPrice +=
        Number(productDetail.travlers) *
        parseFloat(productDetail.perPersonPrice);
    }

    if (productDetail.tourPrice) {
      finalPrice += parseFloat(productDetail.tourPrice);
    }

    if (productDetail.servicePrice) {
      finalPrice += parseFloat(productDetail.servicePrice);
    }

    if (productDetail.productPrice) {
      finalPrice += parseFloat(productDetail.productPrice);
    }

    if (totalIncrement > 0) {
      finalPrice += totalIncrement;
    }

    return parseFloat(finalPrice.toFixed(2));
  };

  useEffect(() => {
    const calculatedPrices = ProductData.map((item) =>
      changePrice(item.price, productDetail?.distance),
    );
    setPrices(calculatedPrices);
  }, [ProductData, productDetail?.distance]);

  const handleRideSelection = (item, price) => {
    const addinalPrice = price / item?.passenger;
    setAdditionalPrice(addinalPrice);
    setRideType({ ...item, selectedPrice: price });
  };

  const HandleCategory = () => {
    const apiGet = `https://api.cabkn.com/api/users/liabilty/1`;
    getData(apiGet, header1)
      .then((res) => {
        if (res?.success && res?.liabilties?.length > 0) {
          setProductData(res?.liabilties);
          setRideType(res?.liabilties[0]);
          setCount(res?.count?.totalPage);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    HandleCategory();
  }, [""]);

  const onSelectCard = (data) => {
    setCardDetails({
      cvc: "",
      expiry: data?.cardexpmonth + "/" + data?.cardexpyear,
      name: data?.name,
      number: data?.cardnumber,
      email: data?.email,
      phone: data?.phone,
    });
  };

  const selectMethod = (data) => {
    setPaymentMethod(data);
  };

  return (
    <>
      <Container>
        <div className=" mx-auto w-full grid grid-cols-12 gap-4 p-4">
          <div className="RideForm col-span-12">
            <h1 className="rideHeader font-family-bold">Book a ride</h1>
            <div className="  mt-4 mb-4">
              <div>
                <p
                  className="font-family-medium"
                  style={{ color: "#8A8A8A", fontSize: 15 }}
                >
                  Distance
                </p>
                <h3
                  className="font-family-medium"
                  style={{ color: "#8A8A8A" }}
                >{`${productDetail?.distance} Km`}</h3>
              </div>
              {productDetail?.rideType == "parcel" ? (
                <div>
                  <p
                    className="font-family-medium mt-2"
                    style={{ color: "#8A8A8A", fontSize: 15 }}
                  >
                    Fare Price
                  </p>

                  {productDetail?.stop.length > 0 ? (
                    <h3
                      className="font-family-medium"
                      style={{ color: "#8A8A8A" }}
                    >
                      {`XCD ${
                        changePrice(RideType?.price) +
                        productDetail?.stop.length * 5
                      }`}{" "}
                      {`$ ${(
                        changePrice(RideType?.price) / 2.7 +
                        productDetail?.stop.length * 5
                      )?.toFixed(2)}`}
                    </h3>
                  ) : (
                    <h3
                      className="font-family-medium"
                      style={{ color: "#8A8A8A" }}
                    >
                      {`XCD ${changePrice(RideType?.price)}`}
                      {`$ ${(changePrice(RideType?.price) / 2.7).toFixed(2)}`}
                    </h3>
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex items-center  mt-4 mb-4">
              <div className="flex flex-col items-center">
                <MdOutlineMyLocation color="#004a70" size={30} />

                <div
                  style={{
                    height: "50px",
                    border: "1px solid #000",
                    width: 2,
                    borderStyle: "dashed",
                  }}
                ></div>
                <FaLocationDot color="#004a70" size={30} />
              </div>
              <div className="ms-2">
                <h5 className="font-family-medium mb-2"> Start location</h5>
                <p className="font-family-regular" style={{ color: "#8A8A8A" }}>
                  {productDetail?.name}
                </p>
                <h5 className="font-family-medium mt-4">End location</h5>

                <p className="font-family-regular" style={{ color: "#8A8A8A" }}>
                  {productDetail?.metaTitle}
                </p>
              </div>
            </div>

            {productDetail?.rideType == "driver" ? (
              <div className="mt-4 w-100">
                {ProductData?.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleRideSelection(item, prices[i])}
                    className={`border-2 rounded-lg p-4 mb-4 w-100 ${
                      RideType?._id === item?._id
                        ? "border-violet-950"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-family-bold text-black text-lg">
                        {item.title} - {prices[i]?.toFixed(2)} XCD
                      </span>
                      <Tooltip title={item?.tooltip}>
                        <Image
                          src={item?.image}
                          width={20}
                          height={20}
                          alt="No data available"
                        />
                      </Tooltip>

                      {increasedPrice > 0 && (
                        <div className="flex items-center">
                          <i className="feather-icon trending-up text-green-500"></i>
                          <span className="text-green-500 font-family-bold text-sm ml-2">
                            XCD {increasedPrice} inc.
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <i className="entypo-icon man text-lg"></i>
                        <span className="text-gray-500 text-md font-family-regular">
                          {item?.passenger} Up to Passengers
                        </span>
                      </div>
                      <span className="font-family-semibold">
                        {(prices[i] / 2.7)?.toFixed(2)} USD
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {productDetail?.rideType == "driver" && (
              <>
                <Checkbox
                  className="mt-2 mb-2 font-family-medium"
                  onChange={onChangeSchedule}
                >
                  Do you have Additional Passenger
                </Checkbox>

                {Passanger && (
                  <div className="mt-2 mb-2">
                    <Label className="font-family-medium">
                      How Many Additional Passengers{" "}
                    </Label>
                    <Input
                      value={PassangerCount}
                      onChange={handleChange}
                      type="number"
                      placeholder=""
                      className="w-full p-3 border rounded-lg hideFocus2"
                    />
                  </div>
                )}
              </>
            )}

            {Passanger && (
              <div className="mt-4 w-100">
                <button
                  className={`border-2 rounded-lg p-4 mb-4 w-100 ${"border-gray-200"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-family-bold text-black text-lg">
                      {"Additional Cost"} - {Number(CabPrice)?.toFixed(2)} XCD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-family-semibold">
                      {(CabPrice / 2.7)?.toFixed(2)} USD
                    </span>
                  </div>
                </button>
              </div>
            )}

            <h5 className="font-family-medium mt-4">Pay With</h5>
            <div
              className="paywith cursor-pointer"
              style={{
                backgroundColor:
                  PaymentMethod == "jad" ? "#004a70" : "transparent",
              }}
              onClick={() => selectMethod("jad")}
            >
              <h6
                style={{
                  color: PaymentMethod == "jad" ? "#fff" : "#004a70",
                }}
                className="font-family-medium"
              >
                Credit/Debit
              </h6>
            </div>
            <div
              className="paywith cursor-pointer"
              style={{
                backgroundColor:
                  PaymentMethod == "wallet" ? "#004a70" : "transparent",
              }}
              onClick={() => selectMethod("wallet")}
            >
              <FaWallet
                size={30}
                color={PaymentMethod == "wallet" ? "#fff" : "#004a70"}
              />

              <h6
                className="font-family-medium"
                style={{
                  color: PaymentMethod == "wallet" ? "#fff" : "#004a70",
                }}
              >
                Wallet
              </h6>
            </div>
            <div
              className="paywith cursor-pointer"
              style={{
                backgroundColor:
                  PaymentMethod == "cash" ? "#004a70" : "transparent",
              }}
              onClick={() => selectMethod("cash")}
            >
              <BsCashCoin
                size={30}
                color={PaymentMethod == "cash" ? "#fff" : "#004a70"}
              />

              <h6
                className="font-family-medium"
                style={{
                  color: PaymentMethod == "cash" ? "#fff" : "#004a70",
                }}
              >
                Cash
              </h6>
            </div>

            {RefIdPayement ? (
              <button
                onClick={CancelRequest}
                className={`w-full h-14 mt-4 px-4 py-2 rounded-lg text-white bg-[#FF3700] hover:bg-[#FF3700] font-family-medium`}
              >
                Cancel request
              </button>
            ) : (
              <>
                {PaymentMethod && (
                  <Button
                    className="findDriver mt-5 font-family-medium"
                    disabled={WalletLoading}
                    // style={{ position: "absolute", bottom: 20, width: "90%" }}
                    onClick={handleShow}
                  >
                    {WalletLoading ? <Spinner /> : "Make Payment"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
      <Modal centered size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="font-family-medium">Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentCards?.length ? (
            <div className="font-family-bold text-2xl mb-2.5">Saved Cards</div>
          ) : null}

          {paymentCards?.map((item, i) => (
            <div
              onClick={() => onSelectCard(item)}
              key={i}
              className="bg-white p-4 mb-4 rounded-lg shadow-md cursor-pointer"
            >
              <div className="flex justify-between items-center mb-1.5">
                <div className="text-gray-500 text-sm mr-2 font-family-regular">
                  Email
                </div>
                <div className="font-family-bold text-lg">{`${item?.email}`}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-500 text-sm mr-2 font-family-regular">
                  Number
                </div>
                <div className="font-family-bold text-lg">
                  {item?.cardnumber}
                </div>
              </div>
            </div>
          ))}

          {/* <form> */}
          <h2 className="text-2xl font-family-bold mb-6">Price</h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
            <div className="md:col-span-6">
              <Cards
                className="cardStyle"
                cvc={cardDetails.cvc}
                expiry={cardDetails.expiry}
                name={cardDetails.name}
                number={cardDetails.number}
              />
            </div>

            <div className="md:col-span-6">
              <input
                className="w-full p-3 border rounded-lg mb-2 mt-2"
                type="text"
                name="number"
                placeholder="Card Number"
                value={cardDetails.number}
                onChange={handleInputChange}
                maxLength="16"
                required
              />
              <input
                className="w-full p-3 border rounded-lg mb-2 mt-2"
                type="text"
                name="name"
                placeholder="Cardholder Name"
                value={cardDetails.name}
                onChange={handleInputChange}
                required
              />
              <input
                className="w-full p-3 border rounded-lg mb-2 "
                type="text"
                name="expiry"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length >= 3) {
                    value = value.slice(0, 2) + "/" + value.slice(2, 4);
                  }
                  e.target.value = value.slice(0, 5);
                  handleInputChange(e);
                }}
                maxLength="5"
                required
              />
              <input
                className="w-full p-3 border rounded-lg mb-2 "
                type="text"
                name="cvc"
                placeholder="CVC"
                value={cardDetails.cvc}
                onChange={handleInputChange}
                maxLength="3"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
            <div className="md:col-span-6">
              <input
                className="w-full p-3 border rounded-lg mb-2 mt-2"
                type="text"
                name="email"
                placeholder="Email"
                value={cardDetails.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="md:col-span-6">
              <input
                className="w-full p-3 border rounded-lg mb-2 mt-2"
                type="text"
                name="phone"
                placeholder="Phone"
                value={cardDetails.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={jadAPiFunction}
              disabled={!areAllFieldsFilled()}
              className={`w-full h-14 px-4 py-2 rounded-lg text-white hover:bg-[#234670] font-family-medium ${
                !areAllFieldsFilled() ? "bg-[#d3d3d3]" : "bg-[#1e3a5f]"
              }`}
            >
              {loading ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden font-family-regular">
                    Loading...
                  </span>
                </Spinner>
              ) : (
                " Add Payment Method"
              )}
            </button>
          </div>

          {/* </form> */}
        </Modal.Body>
      </Modal>

      <Modal show={show1} onHide={() => setShow1(false)} centered>
        <Modal.Body className="p-6">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-10 h-10 text-green-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-Bold mb-2 font-family-bold">
              Payment Success
            </h2>
            <p className="font-family-medium text-gray-500 text-center mb-4">
              Your money has been successfully
            </p>

            <Button
              className="findDriver mt-5 font-family-medium"
              // style={{ position: "absolute", bottom: 20, width: "90%" }}
              onClick={() => {
                setShow1(false);
                router.push("/");
              }}
            >
              Back to Home
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

const page = () => {
  return (
    <Suspense fallback={<Spinner animation="border" />}>
      <CreateRide />
    </Suspense>
  );
};

export default page;
