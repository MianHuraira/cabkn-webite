import React from "react";
import { LuPhoneCall } from "react-icons/lu";
import { GrLocation } from "react-icons/gr";
import { MdEmail } from "react-icons/md";

export default function ContactUs() {
  return (
    <div className="bg-white p-8 mx-auto max-w-4xl" style={{ marginTop: 100 }}>
      <div className="text-start">
        <h1 className="font-bold" style={{ fontSize: 50 }}>
          Get in{" "}
          <span className="font-Bold" style={{ color: "#004a70" }}>
            Touch
          </span>
        </h1>
        <p className="text-gray-600 mt-4">
          Enim tempor eget pharetra facilisis sed maecenas adipiscing. Eu leo
          molestie vel, ornare non id blandit netus.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="rounded-lg p-4 contacCard flex justify-center gap-4">
          <LuPhoneCall color="#004a70" size={30} />
          <div>
            <h2 className="font-semibold text-lg">PHONE</h2>
            <p className="text-gray-600">03 5432 1234 3456</p>
          </div>
        </div>
        <div className=" rounded-lg p-4 contacCard flex justify-center gap-4">
          <GrLocation color="#004a70" size={30} />
          <div>
          <h2 className="font-semibold text-lg">ADDRESS</h2>
          <p className="text-gray-600">
            168/170, Ave 01, York Drive Rich <br /> Mirpur, Dhaka-1216
          </p>
          </div>
        
        </div>
        <div className="rounded-lg p-4 contacCard  flex justify-center gap-4">
        <MdEmail color="#004a70" size={30}  /> 
        <div>
        <h2 className="font-semibold text-lg">EMAIL</h2>
        <p className="text-gray-600 ">info@marcc.com.au</p>
        </div>
          
        </div>
      </div>
      <form className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Write Message
            </label>
            <textarea
              id="message"
              placeholder="Write your message"
              rows="4"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
        </div>
        <button type="submit" className="loginBtn w-full">
          Send
        </button>
      </form>
    </div>
  );
}
