/* eslint-disable no-empty-pattern */
/* eslint-disable no-unused-vars */
"use client"

import { React, useEffect, useState } from "react";
import { Col, Form, Row, Spinner } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { message } from "antd";
import axios from "axios";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import ApiFile from "@/components/ApiFunction/ApiFile";
import { forgotpass } from "@/components/assets/Images";
import Image from "next/image";
import { useRouter } from "next/navigation";

const page = () => {
  const [loading, setLoading] = useState(false); 
  const router = useRouter();
  const dispatch = useDispatch();
  const api = ApiFunction();
  const { postData, header3, header1 } = api;
  const { loginApi } = ApiFile;
  const initialValues = {
    email: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .email("Invalid email")
      .required("Email is required"),
  });

   const handleSubmit = async (values) => {
     const body = {
       email: values?.email,
       type: "customer",
     };
     try {
       setLoading(true);
       const res = await postData("users/forget-password", body, header1);
       const resData = {
           token : res?.token,
          isForgot: "true",
       }

       const encodedData = encodeURIComponent(JSON.stringify(resData));
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
                    <h5 className="loginHead mt-4 mb-4">Forgot Password</h5>
                    <h5 className="loginsbHead mb-3">Send otp to you emai!</h5>
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
                            "Send"
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

export default page;
