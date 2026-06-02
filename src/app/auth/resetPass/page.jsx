/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client";

import { React, Suspense, useEffect, useState } from "react";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";

import { message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import ApiFile from "@/components/ApiFunction/ApiFile";
import { Eye, EyeOff, forgotpass } from "@/components/assets/Images";
import Image from "next/image";

const Reset = () => {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");

  const [loading, setLoading] = useState(false);
  const [Rowdata, setRowdata] = useState("");
  const router = useRouter();
  const [inputType, setInputType] = useState("password");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [inputType1, setInputType1] = useState("password");
  const [passwordVisible1, setPasswordVisible1] = useState(false);

  const dispatch = useDispatch();
  const api = ApiFunction();
  const { postData, header3, header1 } = api;
  const { loginApi } = ApiFile;
  const initialValues = {
    npassword: "",
    cpassword: "",
  };

  const validationSchema = Yup.object().shape({
    npassword: Yup.string().required("Passowrd is required"),
    cpassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("npassword")], "Passwords must match"),
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setInputType(passwordVisible ? "password" : "text");
  };

  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
    setInputType1(passwordVisible1 ? "password" : "text");
  };

  useEffect(() => {
    const row = JSON?.parse(encodedData);
    if (row) {
      setRowdata(row);
    }
  }, [location.search]);

  const handleSubmit = async (values) => {
    const body = {
      token: Rowdata?.token,
      password: values.npassword,
      code: Rowdata?.code,
      type: "customer",
    };

    try {
      setLoading(true);
      const res = await postData("users/forget-password", body, header3);
      router.push("/auth/login");
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
              src={forgotpass}
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
                }) => (
                  <>
                    <Form onSubmit={handleSubmit}>
                      <h5 className="loginHead mt-4 mb-4">Change Password</h5>
                      <h5 className="loginsbHead mb-3">Update Your Password</h5>
                      <section>
                        <Form.Group
                          className="mb-2 hideFocus2"
                          controlId="formGroupPassword"
                        >
                          <Form.Label className="lableHead">
                            New Password
                          </Form.Label>
                          <div className="d-flex align-items-center position-relative">
                            <Form.Control
                              className="radius_12"
                              type={inputType}
                              placeholder="Password"
                              value={values.password}
                              onChange={handleChange}
                              name="npassword"
                            />
                            <Image
                              className="pass_img"
                              src={passwordVisible ? Eye : EyeOff}
                              alt=""
                              onClick={togglePasswordVisibility}
                            />
                          </div>
                          {touched.npassword && errors.npassword && (
                            <div className="errorMsg">{errors.npassword}</div>
                          )}
                        </Form.Group>

                        <Form.Group
                          className="mb-2 hideFocus2"
                          controlId="formGroupPassword"
                        >
                          <Form.Label className="lableHead">
                            Confirm Password
                          </Form.Label>
                          <div className="d-flex align-items-center position-relative">
                            <Form.Control
                              className="radius_12"
                              type={inputType1}
                              placeholder="Password"
                              value={values.password}
                              onChange={handleChange}
                              name="cpassword"
                            />
                            <Image
                              className="pass_img"
                              src={passwordVisible1 ? Eye : EyeOff}
                              alt=""
                              onClick={togglePasswordVisibility1}
                            />
                          </div>
                          {touched.cpassword && errors.cpassword && (
                            <div className="errorMsg">{errors.cpassword}</div>
                          )}
                        </Form.Group>

                        <div className="d-flex flex-column">
                          <button
                            disabled={loading}
                            className={`loginBtn mt-3 ${
                              loading ? "disbalebtn" : ""
                            }`}
                          >
                            {loading ? (
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
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </Spinner>
                            ) : (
                              "Update"
                            )}
                          </button>
                        </div>
                      </section>
                    </Form>
                  </>
                )}
              </Formik>
            </div>
          </Col>
        </Row>
    </>
  );
};

const page = () => {
  return (
    <Suspense fallback={<Spinner animation="border" />}>
      <Reset />
    </Suspense>
  );
};

export default page;
