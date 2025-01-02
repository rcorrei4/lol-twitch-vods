import { forwardRef } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  type?: "button" | "submit" | "reset";
  className?: string;
  variant?: "default" | "outline";
  loading?: boolean;
};

const Loading = () => (
  <div>
    <div className="w-4 h-4 rounded-full border-2 border-b-transparent animate-spin border-[inherit]" />
  </div>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, type = "button", className, loading, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`bg-primary py-2.5 px-10 flex-1 rounded ` + className}
        {...props}
      >
        {loading ? <Loading /> : children}
      </button>
    );
  }
);

Button.displayName = "Button";
