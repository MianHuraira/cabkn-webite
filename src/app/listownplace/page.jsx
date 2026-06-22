"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Select from "react-select";
import {
  Label,
  Input,
  Button,
  FormFeedback,
  Spinner,
  Badge,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { Container, Form } from "react-bootstrap";
import CustomButton from "@/components/CustomButton";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { Loader } from "@googlemaps/js-api-loader";
import { message } from "antd";
// const apiKey = "W37LQ.1656598462";
// const apiSecret =
//   "CD6EC7536CE85FFB2A2342C9904DBC97B50EB337D6868AAE7D92F5D575B27DE3";
// const tokenUrl = "https://jad.cash/HAPI/token";
// const paymentUrl = "https://jad.cash/HAPI/cardpayment";
// const apiKey = "0FGR7.1720815360";
// const apiSecret =
//   "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
// const tokenUrl = "https://jad.cash/HAPI/token";
// const paymentUrl = "https://jad.cash/HAPI/cardpayment";

const apiKey = "0FGR7.1720815360";
const apiSecret =
  "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
const tokenUrl = "https://jad.cash/HAPI/token";
const paymentUrl = "https://jad.cash/HAPI/cardpayment";

import { FaTimesCircle, FaWallet } from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import Modal from "react-bootstrap/Modal";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPaymentCards, setUser } from "@/components/Redux/Slices/AuthSlice";
import { uploadFile } from "@/components/ApiFunction/uploadFile";
import { isValidFileType } from "@/components/ApiFunction/isValidType";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import usePaymentStore from "@/components/Redux/ZustansStore";

const page = () => {
  const { getData, header1, postData, putData, header2 } = ApiFunction();
  const { paymentData, setPaymentData, clearPaymentData } = usePaymentStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const paymentCards = useSelector((state) => state.auth.paymentCards);
  const userData = useSelector((state) => state.auth.user?.user);
  const [SelectedSubCategory, setSelectedSubCategory] = useState([]);

  const router = useRouter();
  const [loading, setloading] = useState(false);

  const [Category, setCategory] = useState([]);
  const [Count, setCount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState({
    id: "",
    name: "",
  });
  const [PaymentMethod, setPaymentMethod] = useState("");

  const [lastId, setlastId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [keyWordData, setKeyWordData] = useState([]);
  const [slug, setSlug] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]); // Holds preview URLs for images
  const [imageUrls, setImageUrls] = useState([]); // Holds uploaded image URLs
  const [basic, setBasic] = useState(new Date());
  const [predictions, setPredictions] = useState([]);
  const [PridicLoading, setPridicLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    address: "",
    lat: null,
    lng: null,
  });

  const [WalletLoading, setWalletLoading] = useState(false);

  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const schema = Yup.object().shape({
    category: Yup.string().required("Category is required"),
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
  });

  const [submittedData, setSubmittedData] = useState(null);

  const [cardDetails, setCardDetails] = useState({
    price: 40 || "",
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

  const handleClose = () => setShow(false);

  const handleImagesChange = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length > 0) {
      setImageLoading(true);
      const previews = [];
      const urls = [];
      try {
        for (const file of files) {
          const preview = URL.createObjectURL(file);
          previews.push(preview);
          const check = isValidFileType(file);
          if (!check) {
            toast.error(
              "!Invalid file type. Please upload a valid image file. You can only select jpg, jpeg, png, svg",
            );
            continue;
          }

          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          const formData = new FormData();
          formData.append("image", compressedFile);

          const response = await postData("image/upload", formData, header2);
          if (response && response.image) {
            urls.push(response.image);
          } else {
            throw new Error("Image upload failed");
          }
        }

        setImagePreviews((prev) => [...prev, ...previews]);
        setImageUrls((prev) => [...prev, ...urls]);
        message.success("Images uploaded successfully!");
        setValue("images", urls);
      } catch (error) {
        console.error("Image upload failed:", error);
        message.error("Image upload failed. Please try again.");
      } finally {
        setImageLoading(false);
      }
    } else {
      message.error("Please select at least one image to upload.");
    }
  };
  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setValue(
      "images",
      imageUrls.filter((_, i) => i !== index),
    );
  };

  const selectMethod = (data) => {
    setPaymentMethod(data);
  };
  const handleSearch = async (text) => {
    setSearchQuery(text);
    setPridicLoading(true);

    const loader = new Loader({
      apiKey: "AIzaSyCkw_MZd-894MZUR4g1_p2XohCWTSTR8S4",
      version: "weekly",
    });

    try {
      await loader.importLibrary("places");

      const autocompleteService = new google.maps.places.AutocompleteService();

      autocompleteService.getPlacePredictions(
        {
          input: text,
          componentRestrictions: { country: "KN" },
        },
        async (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            const placesService = new google.maps.places.PlacesService(
              document.createElement("div"),
            );
            const detailedPredictions = await Promise.all(
              predictions.map(
                (prediction) =>
                  new Promise((resolve) => {
                    placesService.getDetails(
                      { placeId: prediction.place_id },
                      (result, detailsStatus) => {
                        if (
                          detailsStatus ===
                          google.maps.places.PlacesServiceStatus.OK
                        ) {
                          resolve({
                            description: prediction.description,
                            latLng: result.geometry.location.toJSON(),
                          });
                        } else {
                          resolve(null);
                        }
                      },
                    );
                  }),
              ),
            );
            setPredictions(detailedPredictions.filter((item) => item));
            setNoData(false);
          } else {
            console.error("Error fetching place predictions:", status);
            setNoData(true);
          }
          setPridicLoading(false);
        },
      );
    } catch (error) {
      console.error("Error importing Places API library:", error);
      setNoData(true); // Handle error by showing no data
      setPridicLoading(false); // Stop loading
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

  const handleSubCategoryChange = (selectedOption) => {
    const data = selectedOption.map((cat) => ({
      category: cat._id,
      title: cat.name,
    }));

    setSelectedSubCategory(data);
  };

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
    const finalPrice = 40 * 2.7;

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
      cardfirstname: cardDetails?.firstName,
      cardlastname: cardDetails?.lastName,
      address: cardDetails?.address,
      city: cardDetails?.city,
      state: cardDetails?.state,
      postalcode: cardDetails?.postalCode,
      country: cardDetails?.countary,
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };
      return updatedDetails;
    });
  };

  const areAllFieldsFilled = () => {
    return Object.values(cardDetails).every((value) =>
      typeof value === "string" ? value.trim() !== "" : Boolean(value),
    );
  };

  const handlePredictionPress = (prediction) => {
    setLocationDetails({
      address: prediction?.description || "",
      lat: prediction?.latLng?.lat || 0,
      lng: prediction?.latLng?.lng || 0,
    });
    setValue("location", prediction?.description || "");
    setSearchQuery(prediction.description);
    setPredictions([]);
    setNoData(false);
  };

  const HandleCategory = () => {
    const apiGet = `${"webcat/admin"}/${lastId}`;
    getData(apiGet, header1)
      .then((res) => {
        if (res?.success && res?.categories?.length > 0) {
          setCategory(res?.categories);

          setCount(res?.count?.totalPage);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    HandleCategory();
  }, []);

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory({
      id: selectedOption?.value,
      name: selectedOption?.label,
    });
  };

  const onSelectCard = (data) => {
    setCardDetails({
      cvc: "",
      expiry: data?.cardexpmonth + "/" + data?.cardexpyear,
      name: data?.cardfirstname + " " + data?.cardlastname,
      number: data?.cardnumber,
      address: data?.address,
      postalCode: data?.postalcode,
      firstName: data?.cardfirstname,
      lastName: data?.cardlastname,
      city: data?.city,
      state: data?.state,
      email: data?.email,
      phone: data?.phone,
      countary: data?.country,
    });
  };

  const ActivePayment = async (RefId) => {
    // setRefId(RefId);
    try {
      const paymetbody = {
        paymentId: RefId,
        amount: 40,
      };
      const res = await putData(
        `users/listing-card-payment`,
        paymetbody,
        header1,
      );
      if (res?.success) {
        OwnLocation();
      } else {
        message.error(res?.message);
        setIsLoading(false);
      }
    } catch (error) {
      setloading(false);
      console.log(error);
      console.log("=====error", error?.response?.data);
    }
  };

  const paymentwithWAllet = async (data) => {
    try {
      setIsLoading(true);
      if (userData?.amount < 40) {
        message.error("Insufficient wallet balance");
        throw new Error("Insufficient wallet balance");
      }
      const paymetbody = { amount: 40 };
      const res = await putData(
        `users/listing-wallet-payment`,
        paymetbody,
        header1,
      );
      if (res?.success) {
        OwnLocation();
      } else {
        message.error(res?.message);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      message.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setPaymentData(data);

    if (PaymentMethod == "jad") {
      setShow(true);
    } else {
      paymentwithWAllet();
    }
  };

  const OwnLocation = async () => {
    setIsLoading(true);
    const apiData = {
      name: SelectedSubCategory,
      images: imageUrls,
      address: paymentData?.location,
      lat: locationDetails?.lat,
      lng: locationDetails?.lng,
      category: paymentData?.category,
      title: paymentData?.title,
      about: paymentData?.description,
      timeslots:
        selectedCategory?.name === "Excursion" ? paymentData?.timeSlots : "",
      price_per_person:
        selectedCategory?.name === "Excursion"
          ? paymentData?.price_per_person
          : "",
      travelers:
        selectedCategory?.name === "Excursion" ? paymentData?.trevelers : "",
      location_price: paymentData?.location_price,
      heighlights: paymentData?.highlights,
    };
    postData("websubcat/user/create", apiData, header1)
      .then((res) => {
        if (res?.success) {
          message.success(res?.message);
          setShow1(true);
          setImageUrl("");
          setImagePreview("");
          reset();
        }
        setIsLoading(false);
      })
      .catch((error) => {
        message.error(error?.response?.data?.message);
        setIsLoading(false);
      });
  };

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      category: "",
      sucat: "",
      title: "",
      description: "",
    },
  });

  const {
    fields: timeFields,
    append: addTime,
    remove: removeTime,
    replace,
  } = useFieldArray({
    control,
    name: "timeSlots", // Store only times
  });

  const {
    fields: highlightFields,
    append: addHighlight,
    remove: removeHighlight,
  } = useFieldArray({
    control,
    name: "highlights",
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={mounted ? "animate-fade-in" : "opacity-0"} style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div
        className="bg-gradient-to-br from-brand-800 to-brand-950"
        style={{
          padding: "28px 0 44px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div className="font-family-medium" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
              Home
            </a>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span className="font-family-medium" style={{ color: "rgba(255,255,255,0.8)" }}>List Your Place</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 16px)" }}>
            <div style={{ width: "clamp(40px, 6vw, 52px)", height: "clamp(40px, 6vw, 52px)", borderRadius: "clamp(12px, 2vw, 16px)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="clamp(20px, 3vw, 26px)" height="clamp(20px, 3vw, 26px)" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
              </svg>
            </div>
            <div>
              <h1 className="font-family-bold" style={{ color: "#fff", fontSize: "clamp(20px, 5vw, 30px)", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2, wordBreak: "break-word" }}>
                List Your Place
              </h1>
              <p className="font-family-regular" style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(12px, 2vw, 14px)", margin: "2px 0 0", wordBreak: "break-word" }}>
                Register your property or service with us
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "-24px auto 0", padding: "0 16px 48px" }}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div
            className={mounted ? "animate-fade-in-up" : "opacity-0"}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #f0f0f0",
              padding: "clamp(20px, 3vw, 32px)",
              animationDelay: "150ms",
            }}
          >

            {/* Images - Top */}
            <div style={{ marginBottom: 24 }}>
              <p className="font-family-semibold" style={{ fontSize: 15, color: "#1f2937", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Images
              </p>
              <p className="font-family-regular" style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 12px", marginBottom: 10 }}>
                Upload images of your place or service
              </p>
              <div
                className="hover:border-brand-700 hover:bg-blue-50"
                style={{
                  border: "2px dashed #d1d5db",
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: "#fafafa",
                  maxWidth: 300,
                }}
                onClick={() => document.getElementById("image-upload-input").click()}
              >
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
                <p className="font-family-regular" style={{ fontSize: 14, color: "#6b7280", margin: "8px 0 0" }}>
                  {imageLoading ? "Uploading..." : "Click or drag images here"}
                </p>
                <p className="font-family-regular" style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 0" }}>
                  JPG, PNG, SVG up to 1MB each
                </p>
                <Input
                  id="image-upload-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  disabled={imageLoading}
                  style={{ display: "none" }}
                />
              </div>

              {imageUrls.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                  {imageUrls.map((url, index) => (
                    <div key={index} style={{ position: "relative", width: 100, height: 100, borderRadius: 10, overflow: "hidden" }}>
                      <img src={url} alt={`Upload ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.5)",
                          border: "none",
                          color: "#fff",
                          fontSize: 12,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ height: 1, background: "#f3f4f6", marginBottom: 24 }} />

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px 20px" }}>
              {/* Category */}
              <div>
                <Label for="category" className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>
                  Category <span style={{ color: "#ef4444" }}>*</span>
                </Label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field: { onChange, value, ref } }) => (
                    <>
                      <Select
                        ref={ref}
                        placeholder="Select Category"
                        options={Category.map((cat) => ({
                          value: cat._id,
                          label: cat.name,
                        }))}
                        onChange={(selectedOption) => {
                          handleCategoryChange(selectedOption);
                          onChange(selectedOption?.value);
                        }}
                        value={
                          Category.map((cat) => ({
                            value: cat._id,
                            label: cat.name,
                          })).find((option) => option.value === value) || null
                        }
                        isClearable
                        styles={selectStyles(errors.category)}
                      />
                      {errors.category && (
                        <FormFeedback className="font-family-regular" style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>
                          {errors.category.message}
                        </FormFeedback>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Sub Category */}
              <div>
                <Label for="sucat" className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>
                  Sub Category <span style={{ color: "#ef4444" }}>*</span>
                </Label>
                <Controller
                  name="sucat"
                  control={control}
                  rules={{
                    validate: (value) =>
                      value && value.length > 0 ? true : "Sub category is required",
                  }}
                  render={({ field: { onChange, value, ref } }) => (
                    <>
                      <Select
                        ref={ref}
                        isMulti
                        placeholder="Select Sub Category"
                        getOptionLabel={(e) => e.name}
                        getOptionValue={(e) => e._id}
                        options={Category}
                        onChange={(selectedOption) => {
                          const sanitized = selectedOption || [];
                          handleSubCategoryChange(sanitized);
                          onChange(sanitized);
                        }}
                        value={value || []}
                        isClearable
                        styles={selectStyles(errors.sucat)}
                      />
                      {errors.sucat && (
                        <div className="font-family-regular" style={{ fontSize: 12, marginTop: 4, color: "#ef4444" }}>
                          {errors.sucat.message}
                        </div>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Title */}
              <div>
                <Label className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>
                  Title <span style={{ color: "#ef4444" }}>*</span>
                </Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter title"
                      style={inputStyle(errors.title)}
                      invalid={errors.title && true}
                    />
                  )}
                />
                {errors.title && (
                  <FormFeedback className="font-family-regular" style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>
                    {errors.title.message}
                  </FormFeedback>
                )}
              </div>

              {/* Location */}
              <div>
                <Label className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>
                  Start Location
                </Label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <div style={{ position: "relative" }}>
                      <Input
                        {...field}
                        placeholder="Enter start location"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ ...inputStyle(errors.location), paddingRight: 30 }}
                        invalid={errors.location && true}
                      />
                      {PridicLoading && <span className="font-family-regular" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9ca3af" }}>Loading...</span>}
                      {predictions.length > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            zIndex: 10,
                            width: "100%",
                            maxHeight: 200,
                            overflowY: "auto",
                            background: "#fff",
                            borderRadius: 10,
                            border: "1px solid #e5e7eb",
                            marginTop: 4,
                          }}
                        >
                          {predictions.map((prediction) => (
                            <div
                              key={prediction.place_id}
                              onClick={() => handlePredictionPress(prediction)}
                              className="hover:bg-gray-100"
                              style={{
                                padding: "10px 14px",
                                cursor: "pointer",
                                fontSize: 13,
                                borderBottom: "1px solid #f3f4f6",
                              }}
                            >
                              {prediction.description}
                            </div>
                          ))}
                        </div>
                      )}
                      {noData && <span className="font-family-regular" style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, display: "block" }}>No results found</span>}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: 16 }}>
              <p className="font-family-semibold" style={{ fontSize: 15, color: "#1f2937", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Description <span style={{ color: "#ef4444" }}>*</span>
              </p>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    type="textarea"
                    {...field}
                    placeholder="Describe your place..."
                    style={{ ...inputStyle(errors.description), minHeight: 100, resize: "vertical" }}
                    invalid={errors.description && true}
                  />
                )}
              />
              {errors.description && (
                <FormFeedback className="font-family-regular" style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>
                  {errors.description.message}
                </FormFeedback>
              )}
            </div>

            <div style={{ height: 1, background: "#f3f4f6", margin: "20px 0" }} />

            <p className="font-family-semibold" style={{ fontSize: 15, color: "#1f2937", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Highlights
            </p>
            {highlightFields.map((field, index) => (
              <div
                key={field.id}
                style={{ display: "flex", gap: 8, marginBottom: 8 }}
              >
                <Controller
                  name={`highlights.${index}`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter highlight"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      style={{ ...inputStyle(errors?.highlights?.[index]), flex: 1 }}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#ef4444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addHighlight("")}
              className="font-family-medium hover:bg-blue-100"
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                background: "#f0f7ff",
                border: "1px dashed #004a70",
                color: "#004a70",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              + Add Highlight
            </button>

            {/* Excursion Section */}
            {selectedCategory?.name === "Excursion" && (
              <>
                <div style={{ height: 1, background: "#f3f4f6", margin: "20px 0" }} />
                <p className="font-family-semibold" style={{ fontSize: 15, color: "#1f2937", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Excursion Details
                </p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px 20px", marginBottom: 16 }}>
                  <div>
                    <Label className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>
                      Travelers
                    </Label>
                    <Controller
                      name="trevelers"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} required placeholder="Max travelers" style={inputStyle(errors.trevelers)} invalid={errors.trevelers && true} />
                      )}
                    />
                    {errors.trevelers && <FormFeedback className="font-family-regular" style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>{errors.trevelers.message}</FormFeedback>}
                  </div>
                  <div>
                    <Label className="font-family-medium" style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>
                      Price Per Person ($)
                    </Label>
                    <Controller
                      name="price_per_person"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} required type="number" placeholder="0.00" style={inputStyle(errors.price_per_person)} invalid={errors.price_per_person && true} />
                      )}
                    />
                    {errors.price_per_person && <FormFeedback className="font-family-regular" style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>{errors.price_per_person.message}</FormFeedback>}
                  </div>
                </div>
                <p className="font-family-semibold" style={{ fontSize: 13, color: "#374151", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Time Slots
                </p>
                {timeFields.map((field, index) => (
                  <div key={field.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <Controller
                      name={`timeSlots.${index}`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="time"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          style={{ ...inputStyle(errors?.timeSlots?.[index]), flex: 1 }}
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => removeTime(index)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTime("")}
                  className="font-family-medium hover:bg-blue-100"
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    background: "#f0f7ff",
                    border: "1px dashed #004a70",
                    color: "#004a70",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  + Add Time Slot
                </button>
              </>)}

            {/* Non-Excursion Price */}
            {selectedCategory?.name !== "Excursion" && (
              <>
                <div style={{ height: 1, background: "#f3f4f6", margin: "20px 0" }} />
                <div style={{ maxWidth: 300 }}>
                  <p className="font-family-semibold" style={{ fontSize: 13, color: "#374151", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Location Price ($)
                  </p>
                  <Controller
                    name="location_price"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        required
                        placeholder="0.00"
                        style={inputStyle(errors.location_price)}
                        invalid={errors.location_price && true}
                      />
                    )}
                  />
                  {errors.location_price && (
                    <FormFeedback className="font-family-regular" style={{ fontSize: 12, marginTop: 4, color: "#ef4444", display: "block" }}>
                      {errors.location_price.message}
                    </FormFeedback>
                  )}
                </div>
              </>
            )}

            {/* Payment Method */}
            <div style={{ height: 1, background: "#f3f4f6", margin: "20px 0" }} />
            <p className="font-family-semibold" style={{ fontSize: 15, color: "#1f2937", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Payment Method
            </p>
            <p className="font-family-regular" style={{ fontSize: 13, color: "#6b7280", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Listing fee: <strong style={{ color: "#004a70" }}>$40.00</strong>
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div
                onClick={() => selectMethod("jad")}
                className="hover:shadow-md"
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: "16px 20px",
                  borderRadius: 12,
                  border: PaymentMethod === "jad" ? "2px solid #004a70" : "1px solid #e5e7eb",
                  background: PaymentMethod === "jad" ? "#f0f7ff" : "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.2s",
                  boxShadow: PaymentMethod === "jad" ? "0 2px 8px rgba(0,74,112,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: PaymentMethod === "jad" ? "#004a70" : "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "all 0.2s",
                }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill={PaymentMethod === "jad" ? "#fff" : "#6b7280"}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 6h12v2H6v-2zm0-3h12v2H6V9zm0 6h8v2H6v-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-family-semibold" style={{ fontSize: 14, color: "#1f2937", margin: 0 }}>Credit / Debit</p>
                  <p className="font-family-regular" style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Pay with card</p>
                </div>
              </div>
              <div
                onClick={() => selectMethod("wallet")}
                className="hover:shadow-md"
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: "16px 20px",
                  borderRadius: 12,
                  border: PaymentMethod === "wallet" ? "2px solid #004a70" : "1px solid #e5e7eb",
                  background: PaymentMethod === "wallet" ? "#f0f7ff" : "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.2s",
                  boxShadow: PaymentMethod === "wallet" ? "0 2px 8px rgba(0,74,112,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: PaymentMethod === "wallet" ? "#004a70" : "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  transition: "all 0.2s",
                }}>
                  <FaWallet size={18} color={PaymentMethod === "wallet" ? "#fff" : "#6b7280"} />
                </div>
                <div>
                  <p className="font-family-semibold" style={{ fontSize: 14, color: "#1f2937", margin: 0 }}>Wallet</p>
                  <p className="font-family-regular" style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>Balance: ${userData?.amount?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <CustomButton
                type="submit"
                className="font-family-medium"
                loading={isLoading}
                disabled={imageLoading}
                style={{ padding: "12px 36px" }}
                size="lg"
              >
                Submit Listing
              </CustomButton>
            </div>
          </div>
        </Form>
      </div>

      {/* Payment Modal */}
      <Modal centered show={show} onHide={handleClose} style={{ borderRadius: 20, overflow: "hidden" }} size="lg">
        <div style={{
          background: "linear-gradient(135deg, #004a70 0%, #002d47 100%)",
          padding: "clamp(20px, 3vw, 28px)",
          textAlign: "center",
          position: "relative",
        }}>
          <button onClick={handleClose} style={{
            position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 8,
            background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: 18,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
          }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
          <h2 className="font-family-bold" style={{ color: "#fff", fontSize: "clamp(18px, 3vw, 22px)", margin: 0 }}>Pay with Card</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "4px 0 0" }}>Amount: $40.00</p>
        </div>
        <div style={{ padding: "clamp(20px, 3vw, 28px)" }}>
          {paymentCards?.length > 0 && (
            <>
              <p className="font-family-semibold" style={{ fontSize: 14, color: "#1f2937", margin: "0 0 10px" }}>Saved Cards</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {paymentCards?.map((item, i) => (
                  <div key={i} onClick={() => onSelectCard(item)} className="hover:border-brand-700 hover:bg-blue-50" style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                    borderRadius: 10, border: "1px solid #f0f0f0", cursor: "pointer", transition: "all 0.15s",
                  }}
                  >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="#004a70"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 6h12v2H6v-2zm0-3h12v2H6V9zm0 6h8v2H6v-2z" /></svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="font-family-medium" style={{ fontSize: 13, color: "#374151", margin: 0 }}>{item?.cardfirstname} {item?.cardlastname}</p>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>**** {item?.cardnumber?.slice(-4)}</p>
                    </div>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="#059669"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
            <div><Cards className="cardStyle" cvc={cardDetails.cvc} expiry={cardDetails.expiry} name={cardDetails.name} number={cardDetails.number} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>Card Number</label>
                <input type="text" name="number" placeholder="1234 5678 9012 3456" value={cardDetails.number} onChange={handleInputChange} maxLength="16" required style={modalInputStyle} />
              </div>
              <div>
                <label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>Cardholder Name</label>
                <input type="text" name="name" placeholder="John Doe" value={cardDetails.name} onChange={handleInputChange} required style={modalInputStyle} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>Expiry</label>
                  <input type="text" name="expiry" placeholder="MM/YY" value={cardDetails.expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2, 4);
                      e.target.value = value.slice(0, 5);
                      handleInputChange(e);
                    }} maxLength="5" required style={modalInputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>CVC</label>
                  <input type="text" name="cvc" placeholder="123" value={cardDetails.cvc} onChange={handleInputChange} maxLength="3" required style={modalInputStyle} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, marginTop: 16 }}>
            <div><label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>First Name</label><input type="text" name="firstName" placeholder="John" value={cardDetails.firstName} onChange={handleInputChange} required style={modalInputStyle} /></div>
            <div><label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>Last Name</label><input type="text" name="lastName" placeholder="Doe" value={cardDetails.lastName} onChange={handleInputChange} required style={modalInputStyle} /></div>
            <div><label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>Address</label><input type="text" name="address" placeholder="Address" value={cardDetails.address} onChange={handleInputChange} required style={modalInputStyle} /></div>
            <div><label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>Postal Code</label><input type="text" name="postalCode" placeholder="Postal code" value={cardDetails.postalCode} onChange={handleInputChange} required style={modalInputStyle} /></div>
            <div><label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>Country</label><input type="text" name="countary" placeholder="Country" value={cardDetails.countary} onChange={handleInputChange} required style={modalInputStyle} /></div>
            <div><label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>City</label><input type="text" name="city" placeholder="City" value={cardDetails.city} onChange={handleInputChange} required style={modalInputStyle} /></div>
            <div><label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>State</label><input type="text" name="state" placeholder="State" value={cardDetails.state} onChange={handleInputChange} required style={modalInputStyle} /></div>
            <div><label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>Phone</label><input type="text" name="phone" placeholder="+1 (___)-___-____" value={cardDetails.phone} onChange={handleInputChange} required style={modalInputStyle} /></div>
            <div><label className="font-family-medium" style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 3 }}>Email</label><input type="text" name="email" placeholder="email@example.com" value={cardDetails.email} onChange={handleInputChange} required style={modalInputStyle} /></div>
          </div>
          <CustomButton
            onClick={jadAPiFunction}
            className="font-family-medium"
            loading={loading}
            disabled={!areAllFieldsFilled()}
            style={{ width: "100%", marginTop: 20 }}
            size="lg"
          >
            Pay $40.00
          </CustomButton>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal show={show1} onHide={() => setShow1(false)} centered style={{ borderRadius: 20, overflow: "hidden" }} size="sm">
        <div style={{ padding: "clamp(32px, 5vw, 48px)", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: "#ecfdf5",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-family-bold" style={{ fontSize: 20, color: "#1f2937", margin: "0 0 4px" }}>Payment Successful!</h2>
          <p className="font-family-regular" style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>Your listing has been submitted</p>
          <CustomButton
            onClick={() => { setShow1(false); router.push("/") }}
            className="font-family-medium"
            style={{ padding: "12px 32px" }}
          >
            Back to Home
          </CustomButton>
        </div>
      </Modal>
    </div>
  );
};

const selectStyles = (error) => ({
  control: (base) => ({
    ...base,
    borderRadius: 10,
    borderColor: error ? "#ef4444" : "#d1d5db",
    minHeight: 42,
    fontSize: 14,
    boxShadow: "none",
    "&:hover": { borderColor: "#004a70" },
  }),
  placeholder: (base) => ({ ...base, fontSize: 14, color: "#9ca3af" }),
  multiValue: (base) => ({ ...base, borderRadius: 6, background: "#f0f7ff" }),
  multiValueLabel: (base) => ({ ...base, color: "#004a70", fontSize: 12 }),
  multiValueRemove: (base) => ({ ...base, color: "#004a70", "&:hover": { background: "#e0edf7", color: "#004a70" } }),
});

const inputStyle = (error) => ({
  borderRadius: 10,
  border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
  padding: "10px 14px",
  fontSize: 14,
  marginTop: 0,
  width: "100%",
});

const modalInputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  outline: "none",
};


export default page;
