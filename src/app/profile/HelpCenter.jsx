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

        <div className="flex flex-col">
          {/* Title - full width */}
          <div className="mb-4">
            <div className={`rounded-xl border p-3.5 transition-all duration-300 relative ${
              errors.title 
                ? 'border-red-400 bg-red-50/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' 
                : 'border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'
            }`}>
              <label className="block text-[10px] font-family-semibold uppercase tracking-wider text-slate-400 mb-1">Title *</label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Enter title"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none border-none p-0 focus:ring-0 placeholder-slate-400"
                  />
                )}
              />
            </div>
            {errors.title && <p className="text-red-500 text-xs mt-1.5 ml-1 font-family-regular">{errors.title.message}</p>}
          </div>

          {/* Description - full width */}
          <div className="mb-4">
            <div className={`rounded-xl border p-3.5 transition-all duration-300 relative ${
              errors.Des 
                ? 'border-red-400 bg-red-50/10 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100' 
                : 'border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'
            }`}>
              <label className="block text-[10px] font-family-semibold uppercase tracking-wider text-slate-400 mb-1">Description *</label>
              <Controller
                name="Des"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={5}
                    placeholder="Describe your issue or question..."
                    className="w-full bg-transparent text-sm text-slate-800 outline-none border-none p-0 focus:ring-0 placeholder-slate-400 resize-none h-[110px]"
                  />
                )}
              />
            </div>
            {errors.Des && <p className="text-red-500 text-xs mt-1.5 ml-1 font-family-regular">{errors.Des.message}</p>}
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
