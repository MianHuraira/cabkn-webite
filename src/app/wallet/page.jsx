"use client";
import React, { useEffect, useState } from "react";
import { FaWallet, FaHistory } from "react-icons/fa";
import { Spinner } from "reactstrap";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import axios from "axios";
import { Container } from "react-bootstrap";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import moment from "moment";
import { setPaymentCards, setUser } from "@/components/Redux/Slices/AuthSlice";
import { useSocket } from "@/components/ApiFunction/SoketProvider";
const apiKey = "0FGR7.1720815360";
const apiSecret =
  "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
const tokenUrl = "https://jad.cash/HAPI/token";
const paymentUrl = "https://jad.cash/HAPI/cardpayment";
const page = () => {
  const { header1, putData, getData } = ApiFunction();
  const fullData = useSelector((state) => state.auth.user);
  const userData = useSelector((state) => state.auth.user?.user);
  
  const [Tab, setTab] = useState("Topup");
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [TransLoading, setTransLoading] = useState(false);
  const [TransectionData, setTransectionData] = useState([]);

  const dispatch = useDispatch();
  const [cardDetails, setCardDetails] = useState({
    price: "",
    cvc: "",
    expiry: "",
    name: "",
    number: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const paymentCards = useSelector((state) => state.auth.paymentCards);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };
      return updatedDetails;
    });
  };

  const TransectionHistory = async (Id) => {
    setTransLoading(true);
    try {
      const response = await getData("/users/transactions/1", header1);
      if (response?.success) {
        setTransectionData(response?.transactions);
        setTransLoading(false);
      } else {
        setTransLoading(false);
        message.error(response?.message);
      }
    } catch (error) {
      setTransLoading(false);
      message.error(error.response?.message);
    }
  };

  useEffect(() => {
    if (Tab === "History") {
      TransectionHistory();
    }
  }, [Tab]);

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

  const submitPayment = async (token, paydata) => {
    try {
      const postData = new URLSearchParams({
        token: token,
        paydata: JSON.stringify(paydata),
      }).toString();

      dispatch(setPaymentCards(paydata));

      const response = await axios.post(paymentUrl, postData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data;
    } catch (error) {
      setLoading(false);
      throw error;
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

  const jadAPiFunction = async () => {
    setLoading(true);
    const tokenResponse = await getToken();
    if (tokenResponse.result !== "Success") {
      throw new Error(
        `Failed to obtain token: ${JSON.stringify(tokenResponse)}`
      );
    }

    const token = tokenResponse.data.token;

    const dateString = cardDetails?.expiry;
    const [month, year] = dateString.split("/");
    const finalPrice = cardDetails?.price * 2.7;

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
      setLoading(false);
      if (paymentResponse?.result == "Success") {
        if (paymentResponse?.refid) {
          handleUpdateUser(paymentResponse?.refid);
        }
      } else {
        message.error(paymentResponse?.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (Id) => {
    setLoading(true);
    try {
      const body = {
        amount: cardDetails?.price,
        refId: Id,
      };
      const response = await putData("/users/add-amount", body, header1);
      if (response?.success) {
        getProfile();
        message.success(response?.message);
        setLoading(false);
      } else {
        setLoading(false);
        message.error(response?.message);
      }
    } catch (error) {
      setLoading(false);

      message.error(error.response?.message);
    }
  };

  const getProfile = async () => {
    try {
      const response = await getData("/users/me", header1);
      const responseBody = {
        token: fullData?.token,
        success: true,
        newUser: false,
        user: response?.user,
      };
      dispatch(setUser(responseBody));
      setCardDetails({
        cvc: "",
        expiry: "",
        name: "",
        number: "",
        address: "",
        postalCode: "",
        firstName: "",
        lastName: "",
        city: "",
        state: "",
        email: "",
        phone: "",
        countary: "",
      });
    } catch (error) {}
  };



  return (
    <>
      <div className="bread">
        <h5 className="medium-font">Home/Wallet</h5>
        <h3 className="medium-font">Wallet</h3>
      </div>

      <Container>
        <div className="flex  p-4 mt-5">
          <div className="w-full lg:grid lg:grid-cols-12 gap-8">
            {/* Left Section - Balance and Actions */}
            <div className="space-y-4 col-span-4">
              {/* Balance Card */}
              <div className="bg-[#1e3a5f] text-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-4xl font-bold mb-2">
                  ${userData?.amount?.toFixed(2)}
                </h2>
                <p className="text-gray-300">Available Balance</p>
              </div>

              <div
                onClick={() => setTab("Topup")}
                className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  Tab === "Topup"
                    ? "bg-[#1e3a5f] hover:bg-[#234670]"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#1e3a5f] p-3 rounded-full">
                    <FaWallet className="text-white text-xl" />
                  </div>
                  <span
                    className={`text-lg font-medium ${
                      Tab === "Topup" ? "text-white" : "text-black"
                    }`}
                  >
                    Topup
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </div>

              <div
                onClick={() => setTab("History")}
                className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                  Tab === "History"
                    ? "bg-[#1e3a5f] hover:bg-[#234670]"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#1e3a5f] p-3 rounded-full">
                    <FaHistory className="text-white text-xl" />
                  </div>
                  <span
                    className={`text-lg font-medium ${
                      Tab === "History" ? "text-white" : "text-black"
                    }`}
                  >
                    History
                  </span>
                </div>
                <span className="text-white">→</span>
              </div>
            </div>
            {Tab == "Topup" ? (
              <div className="bg-white rounded-2xl p-6 shadow-lg col-span-8">
                {paymentCards?.length ? (
                  <div className="font-bold text-2xl mb-2.5">Saved Cards</div>
                ) : null}

                {paymentCards?.map((item, i) => (
                  <div
                    onClick={() => onSelectCard(item)}
                    key={i}
                    className="bg-white p-4 mb-4 rounded-lg shadow-md cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="text-gray-500 text-sm mr-2">Email</div>
                      <div className="font-bold text-lg">
                        {`${item?.email}`}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-gray-500 text-sm mr-2">Number</div>
                      <div className="font-bold text-lg">
                        {item?.cardnumber}
                      </div>
                    </div>
                  </div>
                ))}
                <h2 className="text-2xl font-bold mb-6">Topup</h2>

                <input
                  type="text"
                  name="price"
                  placeholder="Enter amount"
                  value={cardDetails.price}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg mb-4 mt-2"
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                  <div className="md:col-span-6">
                    <Cards
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
                      placeholder="Card holder Name"
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
                  <div className="col-span-6">
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

                  <div className="col-span-6">
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
                    type="submit"
                    className="w-full h-14 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#234670]"
                  >
                    {loading ? (
                      <Spinner color="#fff">Loading...</Spinner>
                    ) : (
                      "  Add Payment"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-6 shadow-lg col-span-8">
                  <h1 className="text-xl font-bold mb-6">
                    Transaction History
                  </h1>

                  {TransLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Spinner color="#fff">Loading...</Spinner>
                    </div>
                  ) : (
                    <>
                      {TransectionData?.map((section, index) => (
                        <div key={index}>
                          <div>
                            <div className="flex items-center justify-between py-4 border-b">
                              <div className="flex items-center">
                                <div>
                                  <h4 className="font-semibold text-base capitalize">
                                    {section?.type}
                                  </h4>
                                </div>
                              </div>
                              <div className="text-red-500 font-medium">
                                {`${section?.amount} $`}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </>
  );
};

export default page;
