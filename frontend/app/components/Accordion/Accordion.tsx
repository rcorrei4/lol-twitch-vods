import { CaretDownIcon } from "@phosphor-icons/react/dist/icons/CaretDown";
import { type VariantProps, cva } from "class-variance-authority";
import { type ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";

const accordionVariants = cva(
  ["border-t rounded transition-all duration-300 overflow-hidden"],
  {
    variants: {
      variant: {
        win: ["bg-[#303043] border-[#3A374B]"],
        lose: ["bg-[#2E1F24] border-[#443438]"],
        default: ["bg-gray-800 border-gray-700"],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type AccordionProps = VariantProps<typeof accordionVariants> & {
  trigger: ReactNode;
  children: ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function Accordion({
  trigger,
  children,
  expanded: controlledExpanded,
  onToggle,
  variant,
  className,
  triggerClassName,
  contentClassName,
}: AccordionProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
    if (!isControlled) {
      setInternalExpanded((prev) => !prev);
    }
  };

  return (
    <div className={twMerge(accordionVariants({ variant, className }))}>
      <button
        className={twMerge(
          "p-3 flex items-center justify-between w-full",
          triggerClassName,
        )}
        onClick={handleToggle}
      >
        <div className="flex-1">{trigger}</div>
        <CaretDownIcon
          size={20}
          className={`text-gray-400 transition-transform duration-200 ml-2 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={twMerge(
          "transition-all duration-300 ease-in-out",
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
