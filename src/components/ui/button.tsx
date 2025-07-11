import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-blue disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-accent-blue text-white hover:bg-blue-600 border-0 rounded-button",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 border-0 rounded-button",
        outline:
          "border border-border-input bg-transparent text-text-primary hover:bg-background-hover rounded-button",
        secondary:
          "bg-background-card text-text-primary hover:bg-background-hover border border-border-subtle rounded-button",
        ghost:
          "bg-transparent text-text-secondary hover:bg-background-hover hover:text-text-primary border-0 rounded-button",
        link: "text-accent-blue underline-offset-4 hover:underline bg-transparent",
        highlight: "bg-accent-yellow text-black hover:bg-yellow-500 border-0 rounded-button",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-8 px-3 text-sm",
        lg: "h-10 px-6 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText = "Loading...",
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex cursor-progress gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText}
          </div>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
