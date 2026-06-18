import React from "react";
import Image from "next/image";

const EmptyState = ({
  title = "No Data Found",
  description = "We couldn't find any data matching your request.",
  imageSrc,
  className = "",
  inView = true, // pass false if using custom reveal logic
}) => {
  return (
    <div
      className={`flex mt-10 mb-8 flex-col justify-center items-center reveal ${inView ? "visible" : ""
        } w-full py-12 px-4 bg-slate-50/50 rounded-[24px] border border-slate-100 shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] ${className}`}
    >
      <div className="relative mb-4 transform transition-transform duration-500 hover:scale-105">
        {imageSrc && (
          <Image
            src={imageSrc}
            width={120}
            height={120}
            style={{ objectFit: "contain" }}
            alt={title}
            className="drop-shadow-sm opacity-90"
          />
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-2 text-center">
        {title}
      </h3>
      <p className="text-slate-500 text-sm text-center max-w-md leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
