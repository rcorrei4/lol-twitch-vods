import { forwardRef, JSX } from "react";
import { twMerge } from "tailwind-merge";

type NoRef<T> = Omit<T, "ref">;

type TextBoxNativeProps = Omit<NoRef<JSX.IntrinsicElements["input"]>, "type">;

type TextBoxCustomProps = {
  error?: string;
  className?: string;
};

type TextBoxProps = TextBoxNativeProps & TextBoxCustomProps;

export const TextBox = forwardRef<HTMLInputElement, TextBoxProps>(
  ({ error, className, ...inputProps }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        className={twMerge(
          className,
          "h-[40px] text-[14px] placeholder-gray-six outline-none bg-gray-two px-3 py-1 rounded-[5px] border border-gray-three border-opacity-5 focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two transition-all duration-400 ease-in-out disabled:opacity-30"
        )}
        {...inputProps}
      />
    );
  }
);
