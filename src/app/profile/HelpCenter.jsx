"use client";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Form } from "react-bootstrap";
import { FormFeedback, Input, Label, Spinner } from "reactstrap";

const schema = yup.object().shape({
  title: yup.string().required("Title Password is required"),
  Des: yup.string().required("Description Password  is required"),
});

export default function HelpCenter() {
  const [isLoading, setisLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      Des: "",
    },
  });

  const onSubmit = (data) => {};
  return (
    <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'}>
      <Form onSubmit={handleSubmit(onSubmit)} className="mt-3">
        <h2 className="font-medium text-lg">Help Center</h2>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <div className="mt-2">
              <Label for="startLocation">Title</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter Full Name"
                    className="w-full p-3 border rounded-lg hideFocus2"
                    invalid={errors.title && true}
                  />
                )}
              />
              {errors.title && (
                <FormFeedback>{errors.title.message}</FormFeedback>
              )}
            </div>
            <div className="mt-3">
              <Label for="startLocation">Description</Label>
              <Controller
                name="Des"
                control={control}
                render={({ field }) => (
                  <Input
                    type="textarea"
                    {...field}
                    placeholder="Enter Full Name "
                    className="w-full p-3 border rounded-lg hideFocus2 h-100"
                    invalid={errors.Des && true}
                  />
                )}
              />
              {errors.Des && <FormFeedback>{errors.Des.message}</FormFeedback>}
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
