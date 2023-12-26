"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const ShadTooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger
// rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-950
//dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      `z-50 overflow-hidden shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
        p-1.25 rounded-[5px] text-b3 font-semibold text-text-lightmode-primary dark:text-text-lightmode-primary bg-background-lightmode-secondary dark:bg-background-darkmode-primary `,
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { ShadTooltip, TooltipTrigger, TooltipContent, TooltipProvider }
