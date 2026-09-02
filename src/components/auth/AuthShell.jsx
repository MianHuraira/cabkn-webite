"use client";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import { IoChevronBack } from "react-icons/io5";
import { logoBlue, otpImage } from "@/components/assets/Images";
import AuthOnboardingSwiper, { ONBOARDING_SLIDES } from "./AuthOnboardingSwiper";

const cx = (...classes) => classes.filter(Boolean).join(" ");

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  imageSrc,
  imageAlt = "Authentication image",
  imageHeadline,
  imageSubheadline,
  isShow = false,
  useStaticCover = false,
  onBack,
  backHref,
}) {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex items-start md:items-center justify-center p-4 sm:p-6 md:p-3 lg:p-4 bg-slate-900 md:bg-[#f1f5f9] pt-8 sm:pt-10 md:pt-3">
      {/* Mobile Ambient Background: Animated Fullscreen Swiper through Onboarding Images */}
      <div className="md:hidden fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <Swiper
          modules={[Autoplay]}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={900}
          className="w-full h-full [&_.swiper-wrapper]:h-full [&_.swiper-slide]:h-full"
        >
          {ONBOARDING_SLIDES.map((slide, index) => (
            <SwiperSlide key={slide.id} className="relative w-full h-full overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover scale-105 select-none pointer-events-none"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Soft Dark blur overlay so island scenery is visible & form is super clean */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px] z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />
      </div>

      {/* Main Card Container: Transparent on mobile, Solid White elevated card on desktop */}
      <div className="w-full max-w-[380px] sm:max-w-[420px] md:max-w-[840px] lg:max-w-[880px] !bg-transparent md:!bg-white rounded-none md:rounded-[24px] overflow-visible md:overflow-hidden flex flex-col md:flex-row relative z-10 border-0 md:border md:border-slate-200/90 shadow-none md:shadow-[0_20px_50px_rgba(0,0,0,0.08)] min-h-0 md:min-h-[520px] lg:min-h-[540px]">

        {/* Left Column: Onboarding Swiper (Default) or Custom Static Cover - Desktop Only */}
        {useStaticCover ? (
          <div className="relative m-0 rounded-none md:rounded-l-[24px] overflow-hidden hidden md:flex md:w-1/2 flex-col justify-between px-4 sm:px-5 md:px-5 py-5 text-white min-h-[460px] md:min-h-[500px] lg:min-h-[520px] self-stretch">
            {/* Background cover image */}
            <Image
              src={imageSrc || otpImage}
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
                  alt="Welcome to Saint Kitts Logo"
                  className="h-8 md:h-9 w-auto object-contain filter brightness-0 invert cursor-pointer hover:opacity-85 transition-opacity"
                  priority
                />
              </Link>
            </div>

            {isShow && (
              <div className="relative z-10 max-w-sm">
                <h2 className="text-xl lg:text-2xl font-family-bold leading-tight tracking-tight text-white mb-1.5">
                  {imageHeadline || (
                    <>
                      Easily book your ride <br />
                      in just a few steps
                    </>
                  )}
                </h2>
                <p className="text-xs leading-relaxed text-white/85 font-family-regular">
                  {imageSubheadline || "We provide professional taxi services for you"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <AuthOnboardingSwiper />
        )}

        {/* Right Column: Dynamic Form Area */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-0 sm:p-2 md:p-7 lg:p-8 md:py-8 lg:py-9 bg-transparent md:bg-white min-h-0 md:min-h-[520px] lg:min-h-[540px] overflow-y-visible md:overflow-y-auto">
          {/* Brand Logo - Shown ONLY on Mobile (< md), Inverted for dark background */}
          <div className="flex md:hidden justify-center mb-4 sm:mb-5">
            <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
              <Image
                src={logoBlue}
                alt="Welcome to Saint Kitts Logo"
                priority
                className="h-9 sm:h-10 w-auto object-contain filter brightness-0 invert drop-shadow-md"
              />
            </Link>
          </div>

          {/* Heading & Child Inputs - Generous breathing room top and bottom */}
          <div className="w-full max-w-[340px] sm:max-w-[350px] mx-auto flex flex-col justify-center py-4 sm:py-5 lg:py-6 my-auto">
            {/* Clean Top-Left Back Button if onBack or backHref is provided */}
            {onBack || backHref ? (
              <div className="flex items-center justify-start mb-2.5 -mt-1">
                {backHref ? (
                  <Link
                    href={backHref}
                    className="inline-flex items-center gap-1 text-xs font-family-semibold text-white/90 md:text-slate-500 hover:text-white md:hover:text-[#004a70] transition-colors cursor-pointer group"
                  >
                    <IoChevronBack className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Back</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1 text-xs font-family-semibold text-white/90 md:text-slate-500 hover:text-white md:hover:text-[#004a70] transition-colors cursor-pointer group bg-transparent border-none p-0"
                  >
                    <IoChevronBack className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Back</span>
                  </button>
                )}
              </div>
            ) : null}

            <div className="text-center mb-3.5 sm:mb-4">
              <h1 className="text-2xl sm:text-2xl font-family-bold tracking-tight !text-white md:!text-slate-900 mb-1 md:mb-0.5">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-xs text-white/80 md:text-slate-500 font-family-medium">
                  {subtitle}
                </p>
              ) : null}
            </div>

            {children}

            {/* Optional bottom navigation / helper footer */}
            {footer ? (
              <div className="mt-4 sm:mt-5 pt-1 text-center text-xs text-white/80 md:text-slate-500 font-family-medium">
                {footer}
              </div>
            ) : null}
          </div>
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
          className="inline-block w-fit text-[13px] font-family-semibold text-white/95 md:text-slate-700 select-none pl-0.5 cursor-pointer"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          aria-invalid={hasError}
          className={cx(
            "input-field",
            hasError
              ? "!border-rose-400 !focus:border-rose-500 !focus:ring-rose-500/20"
              : "",
            rightAdornment ? "!pr-12" : "",
            inputClassName
          )}
          {...props}
        />
        {rightAdornment ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            {rightAdornment}
          </div>
        ) : null}
      </div>
      {hasError ? (
        <p className="text-[11px] text-rose-400 md:text-rose-500 font-family-medium mt-0.5 pl-1">{error}</p>
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
        "group relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-family-semibold text-white shadow-sm outline-none transition-all duration-200",
        "bg-[#004a70] hover:bg-[#003856] hover:shadow active:scale-[0.99]",
        "disabled:cursor-not-allowed disabled:opacity-60",
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
      type="button"
      className={cx(
        "inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-[13px] font-family-medium text-slate-700 shadow-none outline-none transition-all duration-200",
        "hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]",
        "disabled:cursor-not-allowed disabled:opacity-60",
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
    <div className="my-2.5 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/20 md:bg-slate-200/80" />
      <span className="text-[10px] font-family-bold uppercase tracking-wider text-white/60 md:text-slate-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/20 md:bg-slate-200/80" />
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
        "font-family-semibold text-sky-300 md:!text-[#004a70] hover:text-sky-100 md:hover:!text-[#003856] hover:underline focus:outline-none transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
