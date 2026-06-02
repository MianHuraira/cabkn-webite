/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client";
import { React, useEffect, useState } from "react";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { message } from "antd";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Link from "next/link";
import { Eye, EyeOff, Google, LoginImg } from "@/components/assets/Images";
import Image from "next/image";
import ApiFile from "@/components/ApiFunction/ApiFile";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { setAuthenticated, setUser } from "@/components/Redux/Slices/AuthSlice";
import { useRouter } from "next/navigation";

const page = () => {
  const [inputType, setInputType] = useState("password");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userdata, setUserdata] = useState([]);
  const [GoogleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const [profile, setProfile] = useState([]);

  const dispatch = useDispatch();
  const api = ApiFunction();
  const { postData, header3 } = ApiFunction();
  const { loginApi } = ApiFile;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setInputType(passwordVisible ? "password" : "text");
  };

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .email("Invalid email")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
  });

  const googlLogin = useGoogleLogin({
    onSuccess: (codeResponse) => setUserdata(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (userdata && userdata.access_token) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${userdata.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${userdata.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          loginWithGoogle(res.data); // Define this function to handle user data
        })
        .catch((err) => console.log("Error fetching user info:", err));
    }
  }, [userdata]);

  const loginWithGoogle = (user) => {
    setGoogleLoading(true);
    const body = {
      name: user?.given_name + " " + user?.family_name,
      email: user?.email,
      type: "customer",
    };

    postData("auth/social-login", body, header3)
      .then((res) => {
        if (res?.success) {
          dispatch(setUser(res));
          dispatch(setAuthenticated(true));
          localStorage.setItem("isLogin", true);
          localStorage.setItem("Cabkn-token", res?.token);
          message.success("Log in Sucessfully");
          setGoogleLoading(false);
        } else {
          message.error(res?.message);
          setGoogleLoading(false);
        }
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred";
        console.log(errorMessage);

        message.error(error);
        setGoogleLoading(false);
      });
  };

  const handleSubmit = (values) => {
    // setLoading(true);
    const apiData = {
      email: values?.email,
      password: values?.password,
      fcmtoken: "",
      type: "customer",
    };

    const encodedData = encodeURIComponent(JSON.stringify(apiData));
    router.push(`/auth/signup?data=${encodedData}`);

    //  const queryParams = queryString.stringify({
    //       data: JSON.stringify(apiData),
    //     });

    //     navigate(`${"/Signup"}?${queryParams}`);
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
              }) => (
                <>
                  <Form onSubmit={handleSubmit}>
                    <h5 className="loginHead mt-4 mb-4">Create your account</h5>
                    <section>
                      <Form.Group
                        className="mb-2 hideFocus2"
                        controlId="formGroupEmail"
                      >
                        <Form.Label className="lableHead">
                          Email address
                        </Form.Label>
                        <Form.Control
                          className="radius_12"
                          type="email"
                          placeholder="Enter email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                        />
                        {touched.email && errors.email && (
                          <div className="errorMsg">{errors.email}</div>
                        )}
                      </Form.Group>
                      <Form.Group
                        className="mb-2 hideFocus2"
                        controlId="formGroupPassword"
                      >
                        <Form.Label className="lableHead">Password</Form.Label>
                        <div className="d-flex align-items-center position-relative">
                          <Form.Control
                            className="radius_12"
                            type={inputType}
                            placeholder="Password"
                            value={values.password}
                            onChange={handleChange}
                            name="password"
                          />
                          <Image
                            className="pass_img"
                            src={passwordVisible ? Eye : EyeOff}
                            alt=""
                            onClick={togglePasswordVisibility}
                          />
                        </div>
                        {touched.password && errors.password && (
                          <div className="errorMsg">{errors.password}</div>
                        )}
                      </Form.Group>
                      <div className="d-flex flex-column">
                        <Link
                          href={"/forgetPass"}
                          className="text-end cursorP mt-3 forgettetx"
                        >
                          Forgot Password?
                        </Link>
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
                            "Continue"
                          )}
                        </button>

                        <Link
                          href={"/forgetPass"}
                          className="text-center cursorP mt-3 forgettetx"
                        >
                          Or login with
                        </Link>
                      </div>
                    </section>
                  </Form>

                  <button
                    onClick={googlLogin}
                    disabled={GoogleLoading}
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
                        <Image
                          src={Google}
                          style={{ height: 30, width: 30, marginRight: 10 }}
                          alt=""
                        />
                        <span>Login with Google</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </Formik>

            <Link
              href={"/auth/login"}
              className="text-center cursorP mt-3 forgettetx"
            >
              Already have an Account?
              <span style={{ marginLeft: 5, color: "#004A70" }}>Login</span>
            </Link>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default page;
