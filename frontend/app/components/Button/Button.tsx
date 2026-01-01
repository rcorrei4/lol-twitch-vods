import { type VariantProps, cva } from "class-variance-authority";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const variants = cva(
  ["py-2.5 px-10 rounded outline-none cursor-pointer disabled:opacity-30 "],
  {
    variants: {
      accentColor: {
        primary: ["bg-primary"],
        secondary: ["bg-secondary"],
      },
      variant: {
        default: [],
        outline: ["bg-transparent border border-secondary"],
        simple: ["bg-transparent border-none"],
      },
      size: {
        default: [],
        sm: ["px-5 py-1.5 "],
      },
    },
    defaultVariants: {
      variant: "default",
      accentColor: "primary",
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof variants> & {
    type?: "button" | "submit" | "reset";
    loading?: boolean;
  };

const Loading = () => (
  <div className="p-1">
    <div className="w-4 h-4 rounded-full border-2 border-b-transparent animate-spin border-inherit mr-auto ml-auto" />
  </div>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      type = "button",
      className,
      loading,
      variant,
      accentColor,
      size,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(variants({ variant, accentColor, size, className }))}
        {...props}
      >
        {loading ? <Loading /> : children}
      </button>
    );
  }
);

Button.displayName = "Button";
