"use client";

import Link from "next/link";
import Image from "next/image";
import { logoBlue, otpImage } from "@/components/assets/Images";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  imageSrc = otpImage,
  imageAlt = "Authentication image",
  imageHeadline,
  imageSubheadline,
  isShow = false
}) {
  return (
    <div className="min-h-screen w-full !bg-white md:!bg-[#f1f5f9] flex items-center justify-center p-0 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Main Card Container */}
      <div className="w-full max-w-[1540px] !bg-white rounded-none md:rounded-[32px] overflow-hidden flex flex-col md:flex-row relative z-10 border-0 md:border md:border-slate-200/80 shadow-none md:shadow-[0_24px_60px_rgba(0,0,0,0.12)] min-h-screen md:min-h-0">

        {/* Left Column: Cover & Brand Messaging */}
        <div className="relative m-3 rounded-[24px] overflow-hidden !border !border-black/25 hidden md:flex md:w-[48%] flex-col justify-between p-8 md:p-12 text-white min-h-[460px] md:min-h-[640px]">
          {/* Background cover image */}
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            className="object-cover pointer-events-none select-none"
          />
          {/* Soft dark overlay for high text contrast */}
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />

          {/* Left Header Logo */}
          <div className="relative z-10">
            <Link href="/">
              <Image
                src={logoBlue}
                alt="CabKn Logo"
                className="h-10 w-auto object-contain filter brightness-0 invert cursor-pointer hover:opacity-85 transition-opacity"
                priority
              />
            </Link>
          </div>

          {isShow && <div className="relative z-10 max-w-md">
            <h2 className="text-3xl lg:text-4xl font-family-bold leading-tight tracking-tight text-white mb-4">
              {imageHeadline || (
                <>
                  Easily book your ride <br />
                  in just a few steps
                </>
              )}
            </h2>
            <p className="text-xs lg:text-sm leading-relaxed text-white/85 font-family-regular max-w-sm">
              {imageSubheadline || "We provide professional taxi services for you"}
            </p>
          </div>}
        </div>

        {/* Right Column: Dynamic Form Area */}
        <div className="w-full md:w-[52%] flex flex-col justify-between p-5 md:p-8 bg-white rounded-none md:rounded-r-[32px] min-h-screen md:min-h-0">
          {/* Centered Brand Logo */}
          <div className="flex justify-center mb-8 lg:mb-12">
            <Link href="/">
              <Image
                src={logoBlue}
                alt="CabKn Logo"
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Heading & Child Inputs */}
          <div className="!w-full max-w-lg  mx-auto flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-[34px] font-family-bold tracking-tight text-slate-900 mb-2">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-xs lg:text-sm text-slate-500 font-family-semibold">
                  {subtitle}
                </p>
              ) : null}
            </div>

            {children}
          </div>

          {/* Optional bottom navigation / helper footer */}
          {footer ? (
            <div className="mt-8 text-center text-sm text-slate-500 font-family-semibold">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AuthTextField({
  id,
  label,
  error,
  rightAdornment,
  className,
  inputClassName,
  ...props
}) {
  const hasError = Boolean(error);
  return (
    <div className={cx("space-y-1.5", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="text-xs font-family-bold text-slate-700"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          aria-invalid={hasError}
          className={cx(
            "block w-full rounded-xl border bg-[#f5f7fa]/60 px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none transition",
            "focus:bg-white focus:ring-4",
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-red-50 bg-white"
              : "border-slate-300 focus:border-brand-500 focus:ring-brand-100",
            rightAdornment ? "pr-12" : "",
            inputClassName
          )}
          {...props}
        />
        {rightAdornment ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightAdornment}
          </div>
        ) : null}
      </div>
      {hasError ? (
        <p className="text-xs text-red-500 font-family-semibold mt-1">{error}</p>
      ) : null}
    </div>
  );
}

export function AuthPrimaryButton({
  children,
  className,
  loading,
  ...props
}) {
  return (
    <button
      className={cx(
        "group relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-family-bold text-white shadow-[0_4px_12px_rgba(0,74,112,0.2)] outline-none transition",
        "bg-brand-600 hover:bg-brand-700 active:scale-[0.995]",
        "disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <AuthSpinner /> : null}
      <span className={cx(loading ? "opacity-90" : "")}>{children}</span>
    </button>
  );
}

export function AuthSecondaryButton({ children, className, ...props }) {
  return (
    <button
      className={cx(
        "inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-family-bold text-slate-700 shadow-sm outline-none transition",
        "hover:bg-slate-50 active:scale-[0.995]",
        "disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AuthDivider({ label = "or" }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[10px] font-family-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function AuthSpinner({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white",
        className
      )}
    />
  );
}

export function AuthInlineLink({ href, children, className, ...props }) {
  return (
    <Link
      href={href}
      className={cx(
        "font-family-bold text-brand-600 hover:text-brand-800 hover:underline focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
