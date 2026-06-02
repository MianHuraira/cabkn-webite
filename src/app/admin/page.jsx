/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useEffect, useState } from "react";
import moment from "moment/moment";
import { FaEye } from "react-icons/fa";
import { Container, Spinner, Tab, Tabs } from "react-bootstrap";
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineMyLocation } from "react-icons/md";
import Image from "next/image";
import { tableMap } from "@/components/assets/Images";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import ProductTable from "@/components/dataTable/productTable";
import { useRouter } from "next/navigation";
import { Button, message } from "antd";
import { Check, X } from "react-feather";
import Modal from "react-bootstrap/Modal";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/components/ApiFunction/SoketProvider";
import { setPaymentCards, setUser } from "@/components/Redux/Slices/AuthSlice";
import axios from "axios";
const apiKey = "0FGR7.1720815360";
const apiSecret =
  "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
const tokenUrl = "https://jad.cash/HAPI/token";
const paymentUrl = "https://jad.cash/HAPI/cardpayment";
function Page() {
  const router = useRouter();
  const socket = useSocket();

  const [lastId, setLastId] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const { putData, postData, getData, header1, userData } = ApiFunction();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [tipAmount, setTipAmount] = useState("2");
  const paymentCards = useSelector((state) => state.auth.paymentCards);
  const userDataStore = useSelector((state) => state.auth.user?.user);
  const token = userData?.token;

  const [Loading, setLoading] = useState(false);
  const [TipOrderId, setTipOrderId] = useState("");
  const dispatch = useDispatch();
  const [loading, setloading] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    price: tipAmount || "",
    cvc: "",
    expiry: "",
    name: "",
    number: "",
    email: "",
    phone: "",
  });

  const handleTipSelection = (amount) => {
    setTipAmount(amount);
  };

  const ActivePayment = async (red_id) => {
    try {
      const body = {
        paymentId: red_id,
        amount: tipAmount,
      };
      const res = await putData("users/tip-card-payment", body, header1);
      if (res?.success) {
        const responseBody = {
          token: token,
          success: true,
          newUser: false,
          user: res?.user,
        };
        dispatch(setUser(responseBody));
        if (socket) {
          socket.emit("tip-order-customer", data, (data) => {
            if (data?.success) {
              setIsModalOpen(false);
              setTimeout(() => {
                setShow1(true);
              }, 500);
              message.success("Add Tip Successfully");
            }
          });
        }
      } else {
        message.success("Add Not Added");
      }
    } catch (error) {
      console.log(res?.data?.response?.message , "error");
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
        `Failed to obtain token: ${JSON.stringify(tokenResponse)}`
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const [count, setCount] = useState(0);

  const [Orders, setOrders] = useState([]);

  const [ReFresh, setReFresh] = useState(true);
  const [CustomAmount, setCustomAmount] = useState(false);

  const handleChangeCustom = () => {
    setCustomAmount(true);
  };

  const [Price, setPrice] = useState("");
  const handleTabSelect = async (key) => {
    setActiveTab(key);
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
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);

  const handleClose = () => setShow(false);

  const getOrders = async () => {
    setIsLoading(true);
    try {
      const body = {
        bookingtype: activeTab == "upcoming" ? "schedule" : "live",
      };

      const endpoint =
        activeTab === "completed" || activeTab === "cancelled"
          ? `order/customer/${activeTab}/${lastId}`
          : activeTab === "upcoming" || activeTab === "active"
          ? `order/customer/accepted/${lastId}`
          : activeTab === "requested"
          ? `order/customer/pending/${lastId}`
          : `order/customer/${activeTab}/${lastId}`;

      const res = await postData(endpoint, body, header1);
      setCount(res?.count?.totalPage);
      setOrders(res?.orders);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const gotoDetails = (data) => {
    const encodedData = encodeURIComponent(JSON.stringify(data));
    router.push(`/ridedetails?data=${encodedData}`);
  };

  useEffect(() => {
    getOrders();
  }, [activeTab, lastId]);

  const handlePay = async () => {
    try {
      setLoading(true);

      if (Number(tipAmount) > userDataStore?.amount) {
        message.error("Insufficient wallet balance");
        setLoading(false);
        return;
      }

      const body = {
        amount: tipAmount,
      };

      const res = await putData("users/tip-wallet-payment", body, header1);

      if (res?.success) {
        const responseBody = {
          token: token,
          success: true,
          newUser: false,
          user: res?.user,
        };
        dispatch(setUser(responseBody));
        if (socket) {
          const data = {
            orderId: TipOrderId,
            amount: tipAmount,
          };
          socket.emit("tip-order-customer", data, (socketRes) => {
            if (socketRes?.success) {
              message.success("Tip added successfully");
              setIsModalOpen(false);
              setTimeout(() => {
                setShow1(true);
              }, 500);
            } else {
              message.error("Failed to process tip via socket");
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } else {
        message.error(res?.data?.message || "Payment failed");
        setLoading(false);
      }
    } catch (error) {
      console.log(
        "======error",
        error?.response?.data?.message || error.message
      );
      message.error(error?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "#",
      sortable: true,
      selector: (row, index) => index + 1,
      minWidth: "20px",
    },
    {
      name: "Ride",
      sortable: true,
      minWidth: "280px",
      cell: (row) => (
        <div className="flex gap-1 p-1 items-center ">
          <div className="flex items-center  ">
            <Image
              alt=""
              width={56}
              height={53}
              src={tableMap}
              style={{
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <FaLocationDot color="#004a70" />

                <div
                  style={{
                    height: "20px",
                    border: "1px solid #000",
                    width: 2,
                    borderStyle: "dashed",
                  }}
                ></div>
                <MdOutlineMyLocation color="#004a70" />
              </div>
              <div className="ms-2">
                <p className="Tablelocations">{row?.start_address}</p>
                <p className="Tablelocations1">{row?.end_address}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Pincode",
      sortable: true,
      selector: (row) => row?.pincode,
      minWidth: "200px",
    },

    {
      name: "Driver",
      sortable: true,
      minWidth: "300px",
      cell: (row) => (
        <div className="flex gap-1 p-1 items-center">
          <div className="flex items-center gap-2">
            <img
              alt=""
              width={50}
              height={60}
              src={row?.to_id?.image}
              style={{
                height: "60px",
                width: "50px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <div>
              <p>{row?.to_id?.name}</p>
              <p>{row?.to_id?.email}</p>
            </div>
          </div>
        </div>
      ),
    },

    {
      name: "Date & time",
      sortable: true,
      selector: (row) => moment(row?.createdAt).format("DD MMM,YYYY"),
      minWidth: "200px",
    },

    {
      name: "Fare",
      sortable: true,
      selector: (row) => "$" + (row?.price || 0),
      minWidth: "150px",
    },
    {
      name: "Status",
      sortable: true,
      selector: (row) => (
        <div
          className="px-3 py-1 text-xs medium-font rounded-5 capitalize"
          style={{ border: "1.32px solid #26A4FF", color: "#26A4FF" }}
        >
          {row.status}
        </div>
      ),
      minWidth: "180px",
    },

    {
      name: "Add Tip",
      width: "200px",
      cell: (row) => (
        <>
          <Button
            disabled={row?.tip === 1}
            className="primbtn mt-0"
            style={{ width: 100 }}
            onClick={() => {
              openModal(true), setTipOrderId(row?._id);
            }}
          >
            Tip
          </Button>
        </>
      ),
      minWidth: "50px",
    },

    {
      name: "Action",
      cell: (row) => (
        <>
          <button
            className="btn-view-details ms-3 bg_light rounded-2 p-2"
            onClick={() => gotoDetails(row)}
          >
            <FaEye size={18} />
          </button>
        </>
      ),
      minWidth: "50px",
    },
  ];

  return (
    <>
      <div className="bread">
        <h5 className="medium-font">Home/Bookings</h5>
        <h3 className="medium-font">Bookings</h3>
      </div>

      <Container className="mb-5">
        <Tabs
          activeKey={activeTab}
          onSelect={handleTabSelect}
          defaultActiveKey="all"
          id="uncontrolled-tab-example"
          className="mb-3 tabHead00 mt-3"
        >
          <Tab eventKey="all" title="All bookings">
            <div className="TableCard mt-4">
              <h1 className="font-medium text-2xl ms-3 mt-2 mb-2">
                All Bookings
              </h1>
              <ProductTable
                loading={isLoading}
                columns={columns}
                setLastId={setLastId}
                count={count}
                data={Orders}
              />
            </div>
          </Tab>
          <Tab eventKey="requested" title="Requested">
            <div className="TableCard mt-4">
              <h1 className="font-medium text-2xl ms-3 mt-2 mb-2">Requested</h1>
              <ProductTable
                loading={isLoading}
                columns={columns}
                setLastId={setLastId}
                count={count}
                data={Orders}
              />
            </div>
          </Tab>
          <Tab eventKey="upcoming" title="Upcoming">
            <div className="TableCard mt-4">
              <h1 className="font-medium text-2xl ms-3 mt-2 mb-2">Upcoming</h1>
              <ProductTable
                loading={isLoading}
                columns={columns}
                setLastId={setLastId}
                count={count}
                data={Orders}
              />
            </div>
          </Tab>
          <Tab eventKey="accepted" title="Accepted">
            <div className="TableCard mt-4">
              <h1 className="medium-font ms-3 mt-2  text-2xl  mb-2">
                Accepted
              </h1>
              <ProductTable
                loading={isLoading}
                columns={columns}
                setLastId={setLastId}
                count={count}
                data={Orders}
              />
            </div>
          </Tab>
          <Tab eventKey="completed" title="Completed">
            <div className="TableCard mt-4">
              <h1 className="medium-font ms-3 mt-2 text-2xl  mb-2">
                Completed
              </h1>
              <ProductTable
                loading={isLoading}
                columns={columns}
                setLastId={setLastId}
                count={count}
                data={Orders}
              />
            </div>
          </Tab>
          <Tab eventKey="cancelled" title="Cancelled">
            <div className="TableCard mt-4">
              <h1 className="medium-font ms-3 mt-2 text-2xl  mb-2">
                Cancelled
              </h1>
              <ProductTable
                loading={isLoading}
                columns={columns}
                setLastId={setLastId}
                count={count}
                data={Orders}
              />
            </div>
          </Tab>
        </Tabs>
      </Container>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
            </div>

            {/* Tip Section */}
            <div className="mb-6">
              <p className="text-center text-lg mb-4 font-medium">
                Give some tips to Cameron Williamson
              </p>

              {CustomAmount && (
                <input
                  className="w-full p-3 border rounded-lg mb-2 mt-2"
                  type="text"
                  name="price"
                  placeholder="Enter Price"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  maxLength="16"
                  required
                />
              )}
              {!CustomAmount && (
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {["1", "2", "5", "10", "20"].map((amount) => (
                    <button
                      key={amount}
                      className={`  border rounded-lg p-2 flex items-center justify-center font-Regular ${
                        tipAmount === amount
                          ? "border-blue-500 text-blue-500"
                          : "border-gray-300"
                      }`}
                      onClick={() => handleTipSelection(amount)}
                    >
                      {`$ ${amount}`}
                    </button>
                  ))}
                </div>
              )}

              {!CustomAmount && (
                <Button
                  onClick={handleChangeCustom}
                  className="w-full mb-4 border-0 border-b-0"
                >
                  Enter other amount
                </Button>
              )}
            </div>

            <Button
              onClick={() => {
                setShow(true), openModal(false);
              }}
              className="primbtn w-full text-white py-4 box-shadow-none"
              s
              style={{ width: "100%" }}
            >
              Credit/Debit
            </Button>

            <Button
              onClick={handlePay}
              className="primbtn w-full text-white py-4 box-shadow-none"
              style={{ width: "100%" }}
            >
              {Loading ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                "Wallet"
              )}
            </Button>
          </div>
        </div>
      )}

      <Modal centered size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
                <div className="font-bold text-lg">{`${item?.email}`}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-500 text-sm mr-2">Number</div>
                <div className="font-bold text-lg">{item?.cardnumber}</div>
              </div>
            </div>
          ))}

          {/* <form> */}
          <h2 className="text-2xl font-bold mb-6">Price</h2>

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
              className={`w-full h-14 px-4 py-2 rounded-lg text-white hover:bg-[#234670] ${
                !areAllFieldsFilled() ? "bg-[#d3d3d3]" : "bg-[#1e3a5f]"
              }`}
            >
              {loading ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
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
            <h2 className="text-xl font-Bold mb-2">Payment Success</h2>
            <p className="font-medium text-gray-500 text-center mb-4">
              Your Transection has been successfully
            </p>

            <Button
              className="findDriver mt-5"
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
}

export default Page;
