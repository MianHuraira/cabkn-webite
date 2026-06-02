"use client";
import React from "react";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import ServiceLocation from "@/components/ServiceLocation";

const page = () => {
  const router = useRouter();
  const userData = useSelector((state) => state.auth.user?.user);

  const Routing = () => {
    router.push(userData ? "/ride" : "/auth/login");
  };

  return (
    <>
      <div id="whyUs">
        <ServiceLocation />
      </div>
    </>
  );
};

// wefwef÷

export default page;
