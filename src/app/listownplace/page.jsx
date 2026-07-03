"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Select from "react-select";
import {
  Label,
  Input,
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

const apiKey = "0FGR7.1720815360";
const apiSecret = "6EF4CAFCD82E689DECA28EDFDE15ADB35D12BF5982B182E468758A9F8DD072DF";
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
  useEffect(() => {
    setMounted(true);
  }, []);

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
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
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
            setNoData(true);
          }
          setPridicLoading(false);
        },
      );
    } catch (error) {
      setNoData(true);
      setPridicLoading(false);
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

      dispatch(setPaymentCards(paydata));

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
      lat: locationDetails.lat,
      lng: locationDetails.lng,
      category: selectedCategory.id,
      title: paymentData?.title,
      description: paymentData?.description,
      highlights: paymentData?.highlights,
      ...(selectedCategory.name === "Excursion" && {
        travelers: paymentData?.trevelers,
        duration: paymentData?.duration,
        time: paymentData?.time,
        location_price: paymentData?.location_price,
      }),
    };

    try {
      const response = await postData("websubcat/create", apiData, header1);
      setIsLoading(false);
      if (response && response.success) {
        clearPaymentData();
        setShow1(true);
      } else {
        message.error(response?.message);
      }
    } catch (error) {
      setIsLoading(false);
      message.error("An error occurred during submission.");
    }
  };

  const dispatch = useDispatch();
  const isMobile = false;

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      category: "",
      title: "",
      description: "",
      highlights: [""],
      trevelers: "",
      duration: "",
      time: "",
      location_price: "",
    },
  });

  const {
    fields: highlightFields,
    append: addHighlight,
    remove: removeHighlight,
  } = useFieldArray({
    control,
    name: "highlights",
  });

  return (
    <div className={`min-h-screen bg-slate-50/50 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
      <style>{`
        .modern-list-form input:not([class*="-Input"]):not([id*="react-select"]),
        .modern-list-form textarea {
          background-color: #f8fafc80 !important;
          border: 2px solid #f1f5f9 !important;
          border-radius: 12px !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
          color: #0f172a !important;
          font-weight: 500 !important;
          outline: none !important;
          box-shadow: none !important;
          transition: all 0.2s ease-in-out !important;
        }
        .modern-list-form input:focus,
        .modern-list-form textarea:focus {
          background-color: #ffffff !important;
          border-color: #004a70 !important;
          box-shadow: 0 10px 15px -3px rgba(0, 74, 112, 0.05) !important;
        }
        .modern-list-form label {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #334155 !important;
          margin-bottom: 8px !important;
        }
      `}</style>

      {/* ===== HERO BANNER ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 !pt-28 !pb-28">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }} />
        
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: "12s" }} />
        
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-family-medium !mb-4">
            <a href="/" className="text-slate-400 hover:text-white transition-colors">Home</a>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">List Your Place</span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                </svg>
              </div>
              <div>
                <h1 className="text-white text-3xl font-family-bold tracking-tight !m-0 leading-tight">
                  List Your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-sky-300 to-indigo-200">
                    Place
                  </span>
                </h1>
                <p className="text-slate-400 text-sm !mt-1 !m-0 font-family-regular">
                  Register your property or service with us
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT LAYOUT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 !-mt-12 !pb-24">
        <Form onSubmit={handleSubmit(onSubmit)} className="modern-list-form">
          <div className={`bg-white/95 backdrop-blur-xl rounded-3xl !border !border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "150ms" }}>

            {/* Images - Top */}
            <div className="!mb-6">
              <p className="font-family-semibold text-sm text-slate-800 flex items-center gap-2 !m-0">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Images
              </p>
              <p className="text-xs text-slate-400 !mt-1 !mb-4 font-family-regular">
                Upload images of your place or service
              </p>
              
              <div
                onClick={() => document.getElementById("image-upload-input").click()}
                className="w-full max-w-sm px-6 py-8 bg-slate-50/50 hover:bg-brand-50/20 !border-2 !border-dashed !border-slate-200 hover:!border-brand-600 rounded-3xl text-center cursor-pointer transition-all duration-200"
              >
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={1.5} className="mx-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
                <p className="font-family-semibold text-xs text-slate-700 !mt-3 !mb-1">
                  {imageLoading ? "Uploading..." : "Click or drag images here"}
                </p>
                <p className="text-[10px] text-slate-400 !m-0 font-family-regular">
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
                <div className="flex flex-wrap gap-3 !mt-5">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden !border !border-slate-100 shadow-sm">
                      <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-slate-900/60 text-white flex items-center justify-center !border-none cursor-pointer transition-colors hover:bg-rose-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="!my-6 !border-t !border-slate-100" />

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Category */}
              <div>
                <Label for="category">
                  Category <span className="text-rose-500">*</span>
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
                        <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                          {errors.category.message}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Sub Category */}
              <div>
                <Label for="sucat">
                  Sub Category <span className="text-rose-500">*</span>
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
                        <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                          {errors.sucat.message}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Title */}
              <div>
                <Label>
                  Title <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter title"
                      invalid={errors.title && true}
                    />
                  )}
                />
                {errors.title && (
                  <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                    {errors.title.message}
                  </span>
                )}
              </div>

              {/* Location */}
              <div>
                <Label>
                  Location / Address
                </Label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Enter location"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        invalid={errors.location && true}
                      />
                      {PridicLoading && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-family-medium">
                          Loading...
                        </span>
                      )}
                      {predictions.length > 0 && (
                        <ListGroup className="absolute z-20 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl !border !border-slate-100 max-h-[200px] overflow-y-auto !mt-2.5">
                          {predictions.map((prediction) => (
                            <ListGroupItem
                              key={prediction.place_id}
                              onClick={() => handlePredictionPress(prediction)}
                              className="px-4 py-3 text-xs text-slate-700 font-family-medium cursor-pointer hover:bg-slate-50 hover:text-slate-950 transition-colors !border-b !border-slate-100 last:!border-none"
                            >
                              {prediction.description}
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                      )}
                      {noData && (
                        <span className="text-xs text-slate-400 block !mt-1.5 font-family-medium">
                          No results found
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <div className="!mt-6">
              <p className="font-family-semibold text-sm text-slate-800 flex items-center gap-2 !m-0 !mb-3">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Description <span className="text-rose-500">*</span>
              </p>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    type="textarea"
                    {...field}
                    placeholder="Describe your place..."
                    className="min-h-[120px] resize-y"
                    invalid={errors.description && true}
                  />
                )}
              />
              {errors.description && (
                <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                  {errors.description.message}
                </span>
              )}
            </div>

            <div className="!my-6 !border-t !border-slate-100" />

            {/* Highlights */}
            <div>
              <p className="font-family-semibold text-sm text-slate-800 flex items-center gap-2 !m-0 !mb-4">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Highlights
              </p>
              <div className="space-y-3 !mb-4 max-w-xl">
                {highlightFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2.5">
                    <Controller
                      name={`highlights.${index}`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter highlight"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex-grow px-4 py-3 bg-slate-50/50 !border-2 !border-slate-100 rounded-xl text-sm font-family-medium text-slate-900 focus:bg-white focus:!border-brand-600 outline-none transition-all duration-200"
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="w-11 h-11 rounded-xl !border !border-rose-100 bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addHighlight("")}
                className="px-5 py-2.5 rounded-full !border !border-dashed !border-brand-600 bg-brand-50/20 text-brand-750 font-family-semibold text-xs hover:bg-brand-50 transition-colors cursor-pointer"
              >
                + Add Highlight
              </button>
            </div>

            {/* Excursion Section */}
            {selectedCategory?.name === "Excursion" && (
              <>
                <div className="!my-6 !border-t !border-slate-100" />
                <p className="font-family-semibold text-sm text-slate-800 flex items-center gap-2 !m-0 !mb-4">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Excursion Details
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 !mb-4">
                  <div>
                    <Label>Max Travelers</Label>
                    <Controller
                      name="trevelers"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} required placeholder="e.g. 10" invalid={errors.trevelers && true} />
                      )}
                    />
                    {errors.trevelers && (
                      <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                        {errors.trevelers.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <Label>Duration</Label>
                    <Controller
                      name="duration"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} required placeholder="e.g. 3 Hours" invalid={errors.duration && true} />
                      )}
                    />
                    {errors.duration && (
                      <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                        {errors.duration.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <Label>Departure Time</Label>
                    <Controller
                      name="time"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} required placeholder="e.g. 09:00 AM" invalid={errors.time && true} />
                      )}
                    />
                    {errors.time && (
                      <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                        {errors.time.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <Label>Location / Entry Price ($)</Label>
                    <Controller
                      name="location_price"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} required type="number" placeholder="Price per traveler" invalid={errors.location_price && true} />
                      )}
                    />
                    {errors.location_price && (
                      <span className="text-xs text-rose-500 block !mt-1.5 font-family-medium">
                        {errors.location_price.message}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="!my-6 !border-t !border-slate-100" />

            {/* Payment Method */}
            <div>
              <p className="font-family-semibold text-sm text-slate-800 flex items-center gap-2 !m-0">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#004a70" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Payment Method
              </p>
              <p className="text-xs text-slate-400 !mt-1.5 !mb-5 font-family-regular flex items-center gap-1.5">
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Listing Registration Fee: <strong className="font-family-bold text-brand-650">$40.00</strong>
              </p>

              <div className="flex gap-4 flex-wrap max-w-2xl">
                {/* Card Payment option */}
                <div
                  onClick={() => selectMethod("jad")}
                  className={`flex-1 min-w-[180px] max-w-[240px] p-3.5 rounded-2xl cursor-pointer flex items-center gap-3 transition-all duration-200 border-2 ${
                    PaymentMethod === "jad"
                      ? "bg-brand-50/20 border-brand-900 shadow-sm shadow-brand-900/5"
                      : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    PaymentMethod === "jad" ? "bg-brand-900 text-white" : "bg-slate-50 text-slate-500"
                  }`}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 6h12v2H6v-2zm0-3h12v2H6V9zm0 6h8v2H6v-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-family-semibold text-xs text-slate-800 !m-0">Credit / Debit</h4>
                    <span className="text-[10px] text-slate-400 font-family-regular !mt-0.5 block">Pay with card</span>
                  </div>
                </div>

                {/* Wallet Payment option */}
                <div
                  onClick={() => selectMethod("wallet")}
                  className={`flex-1 min-w-[180px] max-w-[240px] p-3.5 rounded-2xl cursor-pointer flex items-center gap-3 transition-all duration-200 border-2 ${
                    PaymentMethod === "wallet"
                      ? "bg-brand-50/20 border-brand-900 shadow-sm shadow-brand-900/5"
                      : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    PaymentMethod === "wallet" ? "bg-brand-900 text-white" : "bg-slate-50 text-slate-500"
                  }`}>
                    <FaWallet size={14} />
                  </div>
                  <div>
                    <h4 className="font-family-semibold text-xs text-slate-800 !m-0">Wallet</h4>
                    <span className="text-[10px] text-slate-400 font-family-regular !mt-0.5 block">
                      Balance: ${userData?.amount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end !mt-8">
              <CustomButton
                type="submit"
                loading={isLoading}
                disabled={imageLoading}
                className="px-8 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-family-semibold rounded-full shadow-lg shadow-brand-600/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border-none"
              >
                Submit Listing
              </CustomButton>
            </div>

          </div>
        </Form>
      </div>

      {/* Credit Card Modal */}
      <Modal centered show={show} onHide={handleClose} style={{ borderRadius: 20, overflow: "hidden" }} size="lg">
        <div className="bg-gradient-to-br from-slate-900 via-brand-900 to-brand-950 p-6 md:p-8 text-center relative">
          <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white border-none text-base flex items-center justify-center cursor-pointer transition-colors">✕</button>
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto !mb-3">
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
          <h2 className="font-family-bold text-lg text-white !m-0">Pay with Card</h2>
          <p className="text-xs text-slate-400 !m-0 !mt-1">Amount: $40.00</p>
        </div>
        <div className="p-6 md:p-8">
          {paymentCards?.length > 0 && (
            <div className="!mb-6">
              <p className="text-xs text-slate-700 block !mb-2.5 font-family-semibold">Saved Cards</p>
              <div className="space-y-2 max-w-md">
                {paymentCards?.map((item, i) => (
                  <div key={i} onClick={() => onSelectCard(item)} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-brand-50/20 !border !border-slate-100 rounded-xl cursor-pointer transition-all duration-200">
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="#004a70"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 6h12v2H6v-2zm0-3h12v2H6V9zm0 6h8v2H6v-2z" /></svg>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-family-semibold text-xs text-slate-800 !m-0">{item?.cardfirstname} {item?.cardlastname}</h4>
                      <span className="text-[10px] text-slate-400 block !mt-0.5">**** {item?.cardnumber?.slice(-4)}</span>
                    </div>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="#059669"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div><Cards className="cardStyle" cvc={cardDetails.cvc} expiry={cardDetails.expiry} name={cardDetails.name} number={cardDetails.number} /></div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">Card Number</label>
                <input type="text" name="number" placeholder="1234 5678 9012 3456" value={cardDetails.number} onChange={handleInputChange} maxLength="16" required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">Cardholder Name</label>
                <input type="text" name="name" placeholder="John Doe" value={cardDetails.name} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">Expiry</label>
                  <input type="text" name="expiry" placeholder="MM/YY" value={cardDetails.expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2, 4);
                      e.target.value = value.slice(0, 5);
                      handleInputChange(e);
                    }} maxLength="5" required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">CVC</label>
                  <input type="text" name="cvc" placeholder="123" value={cardDetails.cvc} onChange={handleInputChange} maxLength="3" required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 !mt-6">
            <div><label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">First Name</label><input type="text" name="firstName" placeholder="John" value={cardDetails.firstName} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" /></div>
            <div><label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">Last Name</label><input type="text" name="lastName" placeholder="Doe" value={cardDetails.lastName} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" /></div>
            <div><label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">Address</label><input type="text" name="address" placeholder="Address" value={cardDetails.address} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" /></div>
            <div><label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">Postal Code</label><input type="text" name="postalCode" placeholder="Postal code" value={cardDetails.postalCode} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" /></div>
            <div><label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">Country</label><input type="text" name="countary" placeholder="Country" value={cardDetails.countary} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" /></div>
            <div><label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">City</label><input type="text" name="city" placeholder="City" value={cardDetails.city} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" /></div>
            <div><label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">State</label><input type="text" name="state" placeholder="State" value={cardDetails.state} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" /></div>
            <div><label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">Phone</label><input type="text" name="phone" placeholder="+1 (___)-___-____" value={cardDetails.phone} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" /></div>
            <div className="col-span-2"><label className="text-[11px] font-family-semibold text-slate-500 block !mb-1">Email</label><input type="text" name="email" placeholder="email@example.com" value={cardDetails.email} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-slate-50/50 !border !border-slate-200 rounded-xl text-xs font-family-medium text-slate-900 focus:bg-white outline-none" /></div>
          </div>
          <CustomButton
            onClick={jadAPiFunction}
            className="w-full !mt-6 h-12 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-family-semibold rounded-full shadow-lg shadow-brand-600/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border-none"
            loading={loading}
            disabled={!areAllFieldsFilled()}
          >
            Pay $40.00
          </CustomButton>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal show={show1} onHide={() => setShow1(false)} centered style={{ borderRadius: 20, overflow: "hidden" }} size="sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto !mb-4">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-family-bold text-lg text-slate-900 !mb-1">Payment Successful!</h2>
          <p className="text-xs text-slate-400 font-family-regular !mb-6">Your listing has been submitted</p>
          <CustomButton
            onClick={() => { setShow1(false); router.push("/") }}
            className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-family-semibold text-xs rounded-full shadow-md transition-colors"
          >
            Back to Home
          </CustomButton>
        </div>
      </Modal>
    </div>
  );
};

const selectStyles = (error) => ({
  control: (base, state) => ({
    ...base,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: error ? "#fca5a5" : (state.isFocused ? "#004a70" : "#f1f5f9"),
    backgroundColor: state.isFocused ? "#ffffff" : "#f8fafc80",
    minHeight: 46,
    fontSize: 14,
    fontFamily: "Inter, sans-serif",
    fontWeight: "500",
    boxShadow: state.isFocused ? "0 10px 15px -3px rgba(0, 74, 112, 0.05)" : "none",
    transition: "all 0.2s ease-in-out",
    "&:hover": { borderColor: "#004a70" },
  }),
  placeholder: (base) => ({ ...base, fontSize: 14, color: "#9ca3af" }),
  multiValue: (base) => ({ ...base, borderRadius: 8, background: "#f0f7ff" }),
  multiValueLabel: (base) => ({ ...base, color: "#004a70", fontSize: 12 }),
  multiValueRemove: (base) => ({ ...base, color: "#004a70", "&:hover": { background: "#e0edf7", color: "#004a70" } }),
});

const inputStyle = (error) => ({
  borderRadius: 12,
  border: error ? "2px solid #fca5a5" : "2px solid #f1f5f9",
  padding: "12px 16px",
  fontSize: 14,
  marginTop: 0,
  width: "100%",
  backgroundColor: "#f8fafc80",
  color: "#0f172a",
  fontFamily: "Inter, sans-serif",
  fontWeight: "500",
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
