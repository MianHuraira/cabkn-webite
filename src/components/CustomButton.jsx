import React from "react";
import { Button, Spinner } from "reactstrap";

const CustomButton = ({
  loading,
  children,
  className = "",
  spinnerColor = "#fff",
  variant = "primary",
  size = "md",
  ...props
}) => {
  const baseStyles = "!transition-all !duration-200 !inline-flex !items-center !justify-center !gap-2 !cursor-pointer !border-none !rounded-[9999px] !font-['Inter-Medium'] hover:!-translate-y-0.5";

  const variants = {
    primary: "!bg-primary !text-white hover:!shadow-[0_6px_20px_rgba(0,74,112,0.35)]",
    secondary: "!bg-secondary !text-white hover:!shadow-[0_6px_20px_rgba(108,117,125,0.35)]",
    success: "!bg-success !text-white hover:!shadow-[0_6px_20px_rgba(40,167,69,0.35)]",
    danger: "!bg-danger !text-white hover:!shadow-[0_6px_20px_rgba(220,53,69,0.35)]",
    warning: "!bg-warning !text-slate-800 hover:!shadow-[0_6px_20px_rgba(255,193,7,0.35)]",
    info: "!bg-info !text-white hover:!shadow-[0_6px_20px_rgba(23,162,184,0.35)]",
  };

  const sizes = {
    sm: "!px-4 !py-2 !text-xs !min-w-[100px]",
    md: "!px-7 !py-2.5 !text-sm !min-w-[140px]",
    lg: "!px-8 !py-3 !text-base !min-w-[160px]",
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
      {loading ? <Spinner size="sm" color={variant === 'warning' ? '#333' : spinnerColor} /> : children}
    </Button>
  );
};

export default CustomButton;
