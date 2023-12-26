import {ComponentProps, ComponentPropsWithoutRef, ReactElement} from "react";
import {ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/shadTooltip.tsx";

interface GfxToolTipProps extends Omit<ComponentPropsWithoutRef<typeof ShadTooltip>,"children">{
  children: [ReactElement<ComponentProps<typeof TooltipTrigger>>,ReactElement<ComponentProps<typeof TooltipContent>>]
}

function Tooltip({children,...props}:GfxToolTipProps) {
    return(
      <TooltipProvider>
        <ShadTooltip {...props}>
          {children}
        </ShadTooltip>
      </TooltipProvider>
    )
  }
export default Tooltip;