import React from "react";
import { Button, Spinner } from "reactstrap";

const CustomButton = ({
  loading,
  children,
  className = "",
  spinnerColor = "#fff",
  variant = "primary",
  size = "md",
  startContent,
  endContent,
  isIconOnly = false,
  ...props
}) => {
  const baseStyles = "!transition-all !duration-300 !inline-flex !items-center !justify-center !gap-2 !cursor-pointer !border-none !rounded-[9999px] font-family-medium hover:!-translate-y-1 group";

  const variants = {
    primary: "!bg-primary !text-white  hover:!shadow-[0_12px_40px_rgba(0,74,112,0.4)]",
    secondary: "!bg-secondary !text-white hover:!shadow-[0_6px_20px_rgba(108,117,125,0.35)]",
    success: "!bg-success !text-white hover:!shadow-[0_6px_20px_rgba(40,167,69,0.35)]",
    danger: "!bg-danger !text-white hover:!shadow-[0_6px_20px_rgba(220,53,69,0.35)]",
    warning: "!bg-warning !text-slate-800 hover:!shadow-[0_6px_20px_rgba(255,193,7,0.35)]",
    info: "!bg-info !text-white hover:!shadow-[0_6px_20px_rgba(23,162,184,0.35)]",
  };

  const sizes = {
    sm: isIconOnly ? "!w-8 !h-8 !p-0 !min-w-0" : "!px-4 !py-2 !text-xs !min-w-[100px]",
    md: isIconOnly ? "!w-10 !h-10 !p-0 !min-w-0" : "!px-7 !py-2.5 !text-sm !min-w-[140px]",
    lg: isIconOnly ? "!w-12 !h-12 !p-0 !min-w-0" : "!px-8 !py-3 !text-base !min-w-[160px]",
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <Button
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      disabled={loading || props.disabled}
      style={props.style}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" color={variant === 'warning' ? '#333' : spinnerColor} />
      ) : (
        <>
          {startContent && <span className="flex-shrink-0 flex items-center">{startContent}</span>}
          {children && <span>{children}</span>}
          {endContent && <span className="flex-shrink-0 flex items-center">{endContent}</span>}
        </>
      )}
    </Button>
  );
};

export default CustomButton;
