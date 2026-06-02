/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client";

import { React, Suspense, useEffect, useState } from "react";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";

import { useDispatch } from "react-redux";
import { DatePicker, message } from "antd";

import ApiFile from "@/components/ApiFunction/ApiFile";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Image1, LoginImg } from "@/components/assets/Images";

const Signup = () => {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const { postData, header1, putData, header2, getData, header3 } =
    ApiFunction();
  const [inputType, setInputType] = useState("password");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [userdata, setUserdata] = useState([]);
  const [GoogleLoading, setGoogleLoading] = useState(false);
  const [Rowdata, setRowdata] = useState([]);

  const router = useRouter();

  const handleDateChange = (date, dateString) => {
    setFieldValue("date", dateString);
  };

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    try {
      formData.append("image", file);
      const res = await postData("image/upload", formData, header2);
      setImage(res?.image);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const dispatch = useDispatch();
  const api = ApiFunction();
  const { loginApi } = ApiFile;
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setInputType(passwordVisible ? "password" : "text");
  };

  const initialValues = {
    fullname: "",
    date: "",
    address: "",
    phone: "",
    code: "", // Referral Code
  };

  const validationSchema = Yup.object().shape({
    fullname: Yup.string().required("Full Name is required"),
    date: Yup.string().required("Date is required"),
    address: Yup.string().required("Address  is required"),
    phone: Yup.string().required("Phone  is required"),
  });

  useEffect(() => {
    const row = encodedData;

    if (row) {
      const data = JSON.parse(row);
      setRowdata(data);
    }
  }, []);

  // handle submit

  const handleSubmit = async (values) => {
    const body = {
      email: Rowdata?.email,
      type: "customer",
    };
    try {
      setLoading(true);
      const res = await postData("users/send-code", body, header1);
      const apiData = {
        ...Rowdata,
        image,
        code: res?.verificationCode,
        signupData: JSON.stringify(values),
      };

      const encodedData = encodeURIComponent(JSON.stringify(apiData));
      router.push(`/auth/optCode?data=${encodedData}`);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error(error?.response?.data?.message);
      console.log("==========error: ", error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Row>
        <Col lg="6" md="6" className="d-none d-sm-block">
          <Image
            style={{ objectFit: "cover", height: "100vh", width: "100%" }}
            src={LoginImg}
            alt="Login Cover"
          />
        </Col>
        <Col lg="6" md="6">
          <div
            style={{ width: "90%", height: "100vh", marginLeft: "5%" }}
            className="d-flex justify-content-center algin-items-center flex-column"
          >
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={(values, { setSubmitting }) => {
                handleSubmit(values);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
              }) => (
                <>
                  <Form onSubmit={handleSubmit}>
                    <h5 className="loginHead mt-4 mb-4">Sign Up</h5>
                    <h5 className="loginsbHead mb-3">Create your account</h5>

                    <div className="mt-2 flex flex-col md:flex-row gap-6 mb-2">
                      <div className="flex-shrink-0">
                        <Image
                          src={image || Image1}
                          alt="Profile"
                          width={20}
                          height={20}
                          className="w-20 h-20 rounded-full border mx-auto md:mx-0 object-cover cursor-pointer"
                          onClick={() =>
                            document.getElementById("file-upload").click()
                          }
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="file-upload"
                        />
                      </div>
                    </div>

                    <section>
                      <div className="flex items-center justify-between gap-3">
                        <Form.Group
                          className="mb-2 hideFocus2"
                          style={{ width: "90%" }}
                        >
                          <Form.Label className="labelHead">
                            Full Name
                          </Form.Label>
                          <Form.Control
                            className="radius_12 w-full"
                            placeholder="Enter your full name"
                            name="fullname"
                            value={values.fullname}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          {touched.fullname && errors.fullname && (
                            <div className="errorMsg">{errors.fullname}</div>
                          )}
                        </Form.Group>

                        {/* Date of Birth */}
                        <Form.Group
                          className="mb-2 hideFocus2"
                          style={{ width: "90%" }}
                        >
                          <Form.Label className="labelHead">
                            Date of Birth
                          </Form.Label>
                          <DatePicker
                            style={{ width: "100%" }}
                            className="radius_12 w-full"
                            onChange={(date, dateString) =>
                              setFieldValue("date", dateString)
                            }
                            placeholder="Select your date of birth"
                            format="YYYY-MM-DD"
                          />
                          {touched.date && errors.date && (
                            <div className="errorMsg">{errors.date}</div>
                          )}
                        </Form.Group>
                      </div>
                      {/* Full Name */}

                      {/* Address */}
                      <Form.Group className="mb-2 hideFocus2">
                        <Form.Label className="labelHead">Address</Form.Label>
                        <Form.Control
                          className="radius_12"
                          placeholder="Enter your address"
                          name="address"
                          value={values.address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {touched.address && errors.address && (
                          <div className="errorMsg">{errors.address}</div>
                        )}
                      </Form.Group>

                      {/* Phone */}
                      <Form.Group className="mb-2 hideFocus2">
                        <Form.Label className="labelHead">Phone</Form.Label>
                        <Form.Control
                          className="radius_12"
                          placeholder="Enter your phone number"
                          name="phone"
                          value={values.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {touched.phone && errors.phone && (
                          <div className="errorMsg">{errors.phone}</div>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-2 hideFocus2">
                        <Form.Label className="labelHead">
                          Referral Code
                        </Form.Label>
                        <Form.Control
                          className="radius_12"
                          placeholder="(Optional)"
                          name="code"
                          value={values.code}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Group>

                      <div className="d-flex flex-column">
                        <button
                          type="submit"
                          disabled={loading}
                          className={`loginBtn mt-3 ${
                            loading ? "disablbtn" : ""
                          }`}
                        >
                          {loading ? (
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                              style={{ width: "1.2rem", height: "1.2rem" }}
                            />
                          ) : (
                            "Sign Up"
                          )}
                        </button>
                      </div>
                    </section>
                  </Form>
                </>
              )}
            </Formik>

            {/* <button
              onClick={googlLogin}
              // disabled={loading}
              className={`loginBtnGoogle mt-3`}
            >
              {GoogleLoading ? (
                <Spinner
                  style={{
                    width: "18px",
                    height: "18px",
                    marginTop: "3px",
                    borderWidth: "0.15em",
                  }}
                  animation="border"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                <>
                  <img
                    src={Google}
                    style={{ height: 30, width: 30, marginRight: 10 }}
                    alt=""
                  />
                  <span>Login with Google</span>
                </>
              )}
            </button> */}

            {/* <NavLink
              href={"/auth/login"}
              className="text-center cursorP mt-3 forgettetx"
            >
              Already have an Account?
              <span style={{ marginLeft: 5, color: "#004A70" }}>Sign in</span>
            </NavLink> */}
          </div>
        </Col>
      </Row>
    </>
  );
};

const page = () => {
  return (
    <Suspense fallback={<Spinner animation="border" />}>
      <Signup />
    </Suspense>
  );
};

export default page;
