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

  return (
    <>
      <div className="bread">
        <h5 className="medium-font">Home/List Own Place</h5>
        <h3 className="medium-font">List Own Place</h3>
      </div>
      <Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="row gy-1">
            {/* Other fields */}
            <div className="col-md-12">
              <Label for="category">Category</Label>
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
                      className={errors.category ? "is-invalid" : ""}
                    />
                    {errors.category && (
                      <FormFeedback className="text-danger">
                        {errors.category.message}
                      </FormFeedback>
                    )}
                  </>
                )}
              />
            </div>

            <div className="col-md-12">
              <Label for="sucat">Sub Category Name</Label>
              <Controller
                name="sucat"
                control={control}
                rules={{
                  validate: (value) =>
                    value && value.length > 0 ? true : "Category is required",
                }}
                render={({ field: { onChange, value, ref } }) => (
                  <>
                    <Select
                      ref={ref}
                      isMulti
                      placeholder="Select Category"
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
                    />
                    {errors.sucat && (
                      <div className="invalid-feedback">
                        {errors.sucat.message}
                      </div>
                    )}
                  </>
                )}
              />
            </div>

            {/* <div className="col-md-12 mt-3">
              <Label for="sucat">Sub Category Name</Label>
              <Controller
                id="sucat"
                name="sucat"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Name"
                    invalid={errors.sucat && true}
                  />
                )}
              />
              {errors.sucat && (
                <FormFeedback>{errors.sucat.message}</FormFeedback>
              )}
            </div> */}

            <div className="col-md-12 mt-3">
              <Label for="location">Start Location</Label>
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
                      invalid={errors.location && true}
                    />
                    {errors.location && (
                      <FormFeedback>{errors.location.message}</FormFeedback>
                    )}
                    {PridicLoading && <div>Loading...</div>}
                    {predictions.length > 0 && (
                      <ListGroup
                        style={{
                          position: "absolute",
                          zIndex: 10,
                          width: "100%",
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                      >
                        {predictions.map((prediction) => (
                          <ListGroupItem
                            key={prediction.place_id}
                            onClick={() => handlePredictionPress(prediction)}
                            style={{ cursor: "pointer" }}
                          >
                            {prediction.description}
                          </ListGroupItem>
                        ))}
                      </ListGroup>
                    )}
                    {noData && <div>No results found</div>}
                  </div>
                )}
              />
            </div>

            <div className="mb-1 w-100">
              {highlightFields.map((field, index) => (
                <div
                  key={field.id}
                  className="d-flex align-items-center gap-2 mt-2"
                >
                  <Controller
                    name={`highlights.${index}`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        invalid={errors?.highlights?.[index] && true}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  <Button color="danger" onClick={() => removeHighlight(index)}>
                    X
                  </Button>
                </div>
              ))}

              <Button
                color="secondary"
                className="mt-2"
                onClick={() => addHighlight("")}
              >
                Add Highlights
              </Button>
            </div>

            {selectedCategory?.name === "Excursion" && (
              <>
                <div className="mb-1 w-100">
                  {timeFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="d-flex align-items-center gap-2 mt-2"
                    >
                      {/* Time Picker */}
                      <Controller
                        name={`timeSlots.${index}`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="time"
                            invalid={errors?.timeSlots?.[index] && true}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      />
                      <Button color="danger" onClick={() => removeTime(index)}>
                        X
                      </Button>
                    </div>
                  ))}

                  <Button
                    color="secondary"
                    className="mt-2"
                    onClick={() => addTime("")} // Append only time strings
                  >
                    Add Time
                  </Button>
                </div>

                <div className="col-md-12 mt-3">
                  <Label for="title">Trevelers</Label>
                  <Controller
                    id="trevelers"
                    name="trevelers"
                    control={control}
                    render={({ field }) => (
                      <Input
                        required
                        {...field}
                        placeholder="Enter Persons"
                        invalid={errors.trevelers && true}
                      />
                    )}
                  />
                  {errors.trevelers && (
                    <FormFeedback>{errors.trevelers.message}</FormFeedback>
                  )}
                </div>

                <div className="col-md-12 mt-3">
                  <Label for="title">Price Per Person</Label>
                  <Controller
                    id="price_per_person"
                    name="price_per_person"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        required
                        type="number"
                        placeholder="Enter Price"
                        invalid={errors.price_per_person && true}
                      />
                    )}
                  />
                  {errors.price_per_person && (
                    <FormFeedback>
                      {errors.price_per_person.message}
                    </FormFeedback>
                  )}
                </div>
              </>
            )}

            {selectedCategory?.name !== "Excursion" && (
              <div className="col-md-12 mt-3">
                <Label for="location_price">Location Price</Label>
                <Controller
                  id="location_price"
                  name="location_price"
                  control={control}
                  render={({ field }) => (
                    <Input
                      required
                      {...field}
                      placeholder="Enter Price"
                      invalid={errors.location_price && true}
                    />
                  )}
                />
                {errors.location_price && (
                  <FormFeedback>{errors.location_price.message}</FormFeedback>
                )}
              </div>
            )}

            <div className="col-md-12 mt-3">
              <Label for="title">Title</Label>
              <Controller
                id="title"
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
                <FormFeedback>{errors.title.message}</FormFeedback>
              )}
            </div>

            <div className="col-md-12 mt-3">
              <Label for="description">Description</Label>
              <Controller
                id="description"
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    type="textarea"
                    {...field}
                    placeholder="Enter Name"
                    invalid={errors.sucat && true}
                  />
                )}
              />
              {errors.description && (
                <FormFeedback>{errors.description.message}</FormFeedback>
              )}
            </div>

            <div className="col-md-12 mt-3">
              <Label for="images">Image Upload</Label>
              <Input
                className="uploadFeild"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesChange}
                disabled={imageLoading}
              />
              {errors.images && (
                <FormFeedback>{errors.images.message}</FormFeedback>
              )}
            </div>

            <div className="col-md-12  d-flex mt-3">
              {imageLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  {imageUrls.map((preview, index) => (
                    <div
                      key={index}
                      style={{ width: "fit-content" }}
                      className="position-relative me-2 mb-2 "
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100px",
                          maxHeight: "100px",
                          objectFit: "cover",
                        }}
                      />
                      <FaTimesCircle
                        className="position-absolute"
                        style={{
                          top: "-10px",
                          right: "-10px",
                          cursor: "pointer",
                          color: "red",
                        }}
                        onClick={() => handleRemoveImage(index)}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className="col-md-12">
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
                  className="medium-font"
                >
                  Credit/Debit
                </h6>
              </div>
            </div>
            <div className="col-md-12">
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
                  className="medium-font"
                  style={{
                    color: PaymentMethod == "wallet" ? "#fff" : "#004a70",
                  }}
                >
                  Wallet
                </h6>
              </div>
            </div>

            <div className="col-md-12 mt-3 mb-5">
              <Button
                className="btnForm mt-3"
                type="submit"
                color="primary"
                disabled={isLoading || imageLoading}
              >
                {isLoading ? <Spinner size="sm" /> : "Submit"}
              </Button>
            </div>
          </div>
        </Form>

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
                  <div className="text-gray-500 text-sm mr-2">Name</div>
                  <div className="font-bold text-lg">
                    {`${item?.cardfirstname} ${item?.cardlastname}`}
                  </div>
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
                  name="firstName"
                  placeholder="First Name"
                  value={cardDetails.firstName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="w-full p-3 border rounded-lg mb-2 mt-2"
                  type="text"
                  name="address"
                  placeholder="Address line 1"
                  value={cardDetails.address}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="w-full p-3 border rounded-lg mb-2 mt-2"
                  type="text"
                  name="countary"
                  placeholder="Country"
                  value={cardDetails.countary}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="w-full p-3 border rounded-lg mb-2 mt-2"
                  type="text"
                  name="city"
                  placeholder="City"
                  value={cardDetails.city}
                  onChange={handleInputChange}
                  required
                />
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
                  name="lastName"
                  placeholder="Last Name"
                  value={cardDetails.lastName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="w-full p-3 border rounded-lg mb-2 mt-2"
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code (optional)"
                  value={cardDetails.postalCode}
                  onChange={handleInputChange}
                  required
                />
                <input
                  className="w-full p-3 border rounded-lg mb-2 mt-2"
                  type="text"
                  name="state"
                  placeholder="State"
                  value={cardDetails.state}
                  onChange={handleInputChange}
                  required
                />
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
                Your money has been successfully
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
      </Container>
    </>
  );
};

export default page;
