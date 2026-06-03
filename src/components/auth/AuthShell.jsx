"use client";

import Link from "next/link";
import Image from "next/image";
import { logoBlue } from "@/components/assets/Images";

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
}) {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="flex min-h-screen w-full">
        <div className="relative hidden w-1/2 self-start overflow-hidden lg:sticky lg:top-0 lg:block lg:h-screen">
          {imageSrc ? (
            <>
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-900/45 to-slate-900/10" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800" />
          )}

          <div className="absolute inset-0 flex items-end p-10 xl:p-14">
            <div className="max-w-md animate-auth-fade motion-reduce:animate-none">
              {imageHeadline ? (
                <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
                  {imageHeadline}
                </h2>
              ) : null}
              {imageSubheadline ? (
                <p className="mt-4 text-pretty text-base leading-7 text-white/80">
                  {imageSubheadline}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col bg-gradient-to-b from-white to-slate-50 lg:w-1/2">
          <div className="px-6 pt-6 lg:px-12 lg:pt-10">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              aria-label="Go to home"
            >
              <Image
                src={logoBlue}
                alt="CabKn"
                priority
                className="h-[4rem] w-auto drop-shadow-sm sm:h-[4rem]"
              />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-8 lg:px-12 lg:py-10">
            <div className="w-full max-w-md animate-auth-in motion-reduce:animate-none">
              <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(2,6,23,0.45)] backdrop-blur sm:p-8">
                <div className="mb-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                {children}
                {footer ? (
                  <div className="mt-3 border-t border-slate-200/70 pt-4 text-center text-sm text-slate-600">
                    {footer}
                  </div>
                ) : null}
              </div>
            </div>
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
    <div className={cx("space-y-2", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          aria-invalid={hasError}
          className={cx(
            "block w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition",
            "placeholder:text-slate-400",
            "focus:ring-4",
            hasError
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
              : "border-slate-200 focus:border-brand-500 focus:ring-brand-100",
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
        <p className="text-sm leading-5 text-rose-600">{error}</p>
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
        "group relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold text-white shadow-sm outline-none transition",
        "bg-brand-600 hover:bg-brand-700",
        "focus-visible:ring-4 focus-visible:ring-brand-200",
        "active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70",
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
        "inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 shadow-sm outline-none transition",
        "hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-brand-200 active:scale-[0.99]",
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
    <div className="my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
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
        "font-semibold text-brand-700 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

