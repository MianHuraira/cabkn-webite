"use client";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Form } from "react-bootstrap";
import { FormFeedback, Input, Label, Spinner } from "reactstrap";
import { message } from "antd";
import ApiFunction from "@/components/ApiFunction/ApiFunction";

const schema = yup.object().shape({
  oldPassword: yup.string().required("Old Password is required"),
  NewPassword: yup.string().required("New Password  is required"),
  Cpass: yup
    .string()
    .required("Confirm Password is required")
    .oneOf([yup.ref("NewPassword")], "Passwords must match"),
});

export default function ChangePassword() {
  const [isLoading, setisLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { postData, header1, putData, header2, getData } = ApiFunction();
  const {
    handleSubmit,
    control,
    reset,
    setValue,
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
        message.success(res?.message);
      }
    } catch (error) {
      setisLoading(false);
      console.log(error.response?.data?.message);
    }
  };
  return (
    <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'}>
      <Form onSubmit={handleSubmit(onSubmit)} className="mt-3">
        <h2 className="font-medium text-lg">Personal Info</h2>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <div className="mt-2">
              <Label for="startLocation">Old Password</Label>
              <Controller
                name="oldPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Old Password"
                    className="w-full p-3 border rounded-lg hideFocus2"
                    invalid={errors.oldPassword && true}
                  />
                )}
              />
              {errors.oldPassword && (
                <FormFeedback>{errors.oldPassword.message}</FormFeedback>
              )}
            </div>
            <div className="mt-3">
              <Label for="startLocation">New Password</Label>
              <Controller
                name="NewPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter New Password"
                    className="w-full p-3 border rounded-lg hideFocus2"
                    invalid={errors.NewPassword && true}
                  />
                )}
              />
              {errors.NewPassword && (
                <FormFeedback>{errors.NewPassword.message}</FormFeedback>
              )}
            </div>

            <div className="mt-3">
              <Label for="startLocation">New Password</Label>
              <Controller
                name="Cpass"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Confirm Password"
                    className="w-full p-3 border rounded-lg hideFocus2"
                    invalid={errors.Cpass && true}
                  />
                )}
              />
              {errors.Cpass && (
                <FormFeedback>{errors.Cpass.message}</FormFeedback>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
          }}
        >
          <Button
            style={{ width: "30%" }}
            type="submit"
            className="btnForm mt-5"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : "Save"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
