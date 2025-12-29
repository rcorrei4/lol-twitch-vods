import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type TextBoxNativeProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

type TextBoxCustomProps = {
  //error?: string;
  className?: string;
};

type TextBoxProps = TextBoxNativeProps & TextBoxCustomProps;

export const TextBox = forwardRef<HTMLInputElement, TextBoxProps>(
  ({ className, ...inputProps }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        className={twMerge(
          className,
          "h-10 text-[14px] placeholder-gray-six outline-none bg-gray-two px-3 py-1 rounded-[5px] border border-gray-three border-opacity-5 focus:ring-1 focus:ring-gray-three focus:ring-offset-1 focus:ring-offset-gray-two transition-all duration-400 ease-in-out disabled:opacity-30"
        )}
        {...inputProps}
      />
    );
  }
);

TextBox.displayName = "TextBox";
