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
  const hasError = Boolean(errors[name]);
  return (
    <div className="!space-y-1.5 !mb-4 last:!mb-0">
      <label className="!block !text-[13px] !font-family-semibold !text-slate-700 !select-none !pl-0.5">
        {label} <span className="!text-red-500">*</span>
      </label>
      <div className="!relative">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type={show ? "text" : "password"}
              placeholder={placeholder}
              className={`input-field !pr-11 ${
                hasError
                  ? "!border-rose-400 focus:!border-rose-500 focus:!ring-rose-500/20"
                  : ""
              }`}
            />
          )}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="!absolute !inset-y-0 !right-0 !flex !items-center !pr-3.5 !text-slate-400 hover:!text-slate-600 !transition-colors !border-none !bg-transparent !cursor-pointer focus:!outline-none"
        >
          {show ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
        </button>
      </div>
      {hasError && (
        <p className="!text-[11px] !text-rose-500 !font-family-medium !mt-1 !pl-1">
          {errors[name].message}
        </p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {/* Left col */}
          <div className="flex flex-col">
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
          <div className="flex flex-col">
            <PasswordField
              label="Confirm Password"
              name="Cpass"
              placeholder="Enter Confirm Password"
              control={control}
              errors={errors}
            />
          </div>
        </div>

        <div className="mt-4">
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
