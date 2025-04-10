import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        destructive:
          "bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
        red: "bg-red-600 text-slate-50 hover:bg-red-600/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90",
        redNoHover: "bg-red-600 text-slate-50 dark:bg-red-900 dark:text-slate-50",
        green: "bg-green-600 text-slate-50 hover:bg-green-600/80 dark:bg-green-900 dark:text-slate-50 dark:hover:bg-green-900/90",
        greenNoHover: "bg-green-600 text-slate-50 dark:bg-green-900 dark:text-slate-50",
        grey: "bg-slate-500 text-slate-50 hover:bg-slate-500/80 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-900/90", 
        amber: "bg-amber-500 text-slate-50 hover:bg-amber-500/80 dark:bg-amber-900 dark:text-slate-50 dark:hover:bg-amber-900/90", 
        border: "border border-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        indigo: "bg-indigo-600 text-slate-50 hover:bg-indigo-600/90 dark:bg-indigo-50 dark:text-slate-900 dark:hover:bg-indigo-50/90",
        disabled: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 opacity-50",
        disabledRed: "bg-red-600 text-slate-50 dark:bg-red-900 dark:text-slate-50 opacity-50",
        blue: "bg-blue-600 text-slate-50 hover:bg-blue-600/90 dark:bg-blue-50 dark:text-slate-900 dark:hover:bg-blue-50/90",
        dark: "bg-slate-700 text-slate-50 border border-slate-100/50 hover:bg-slate-700/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
        black: "bg-black text-slate-50 border border-slate-100/50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }