"use client";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form } from "react-bootstrap";
import { FormFeedback, Label } from "reactstrap";
import { message } from "antd";
import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import CustomButton from "@/components/CustomButton";

const schema = yup.object().shape({
  oldPassword: yup.string().required("Old Password is required"),
  NewPassword: yup.string().required("New Password  is required"),
  Cpass: yup
    .string()
    .required("Confirm Password is required")
    .oneOf([yup.ref("NewPassword")], "Passwords must match"),
});

const PasswordField = ({ label, name, placeholder, control, errors }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="mt-3 first:mt-0">
      <Label className="text-sm font-family-medium text-gray-700 mb-1 block">
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <input
              {...field}
              type={show ? "text" : "password"}
              placeholder={placeholder}
              className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm outline-none transition-colors focus:border-brand-600 ${errors[name]
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
                }`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors border-none bg-transparent cursor-pointer p-0"
            >
              {show ? <FaEyeSlash size={17} /> : <FaEye size={17} />}
            </button>
          </div>
        )}
      />
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

export default function ChangePassword() {
  const [isLoading, setisLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { postData, header1, putData } = ApiFunction();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      oldPassword: "",
      NewPassword: "",
      Cpass: "",
    },
  });

  const onSubmit = async (data) => {
    setisLoading(true);
    try {
      const body = {
        oldPassword: data?.oldPassword,
        newPassword: data?.NewPassword,
      };
      const res = await putData("users/change-password", body, header1);
      if (res?.success) {
        setisLoading(false);
        message.success(res?.message);
        reset();
      } else {
        message.error(res?.message);
        setisLoading(false);
      }
    } catch (error) {
      setisLoading(false);
    }
  };

  return (
    <div className={mounted ? "animate-fade-in-up" : "opacity-0"}>
      <Form onSubmit={handleSubmit(onSubmit)} className="mt-3">
        <h2 className="font-family-semibold text-lg text-gray-900 mb-4">Change Password</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {/* Left col */}
          <div className="flex flex-col gap-1">
            <PasswordField
              label="Old Password"
              name="oldPassword"
              placeholder="Enter Old Password"
              control={control}
              errors={errors}
            />
            <PasswordField
              label="New Password"
              name="NewPassword"
              placeholder="Enter New Password"
              control={control}
              errors={errors}
            />
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-1">
            <PasswordField
              label="Confirm Password"
              name="Cpass"
              placeholder="Enter Confirm Password"
              control={control}
              errors={errors}
            />
          </div>
        </div>

        <div className="mt-6">
          <CustomButton
            type="submit"
            loading={isLoading}
            style={{ minWidth: 140 }}
          >
            Save Changes
          </CustomButton>
        </div>
      </Form>
    </div>
  );
}
