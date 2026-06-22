"use client";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Form } from "react-bootstrap";
import { message } from "antd";
import CustomButton from "@/components/CustomButton";

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  Des: yup.string().required("Description is required"),
});

export default function HelpCenter() {
  const [isLoading, setisLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      Des: "",
    },
  });

  const onSubmit = (data) => {
    // submit logic
  };

  return (
    <div className={mounted ? "animate-fade-in-up" : "opacity-0"}>
      <Form onSubmit={handleSubmit(onSubmit)} className="mt-3">
        <h2 className="font-family-semibold text-lg text-gray-900 mb-4">Help Center</h2>

        <div className="flex flex-col gap-4">
          {/* Title - full width */}
          <div>
            <label className="text-sm font-family-medium text-gray-700 mb-1 block">Title</label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Enter title"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-colors focus:border-brand-600 ${
                    errors.title ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                />
              )}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description - full width */}
          <div>
            <label className="text-sm font-family-medium text-gray-700 mb-1 block">Description</label>
            <Controller
              name="Des"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={5}
                  placeholder="Describe your issue or question..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-colors focus:border-brand-600 resize-none ${
                    errors.Des ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                />
              )}
            />
            {errors.Des && (
              <p className="text-red-500 text-xs mt-1">{errors.Des.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <CustomButton
            type="submit"
            loading={isLoading}
            style={{ minWidth: 140 }}
          >
            Submit
          </CustomButton>
        </div>
      </Form>
    </div>
  );
}
