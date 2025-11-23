import * as React from "react"
import { cn } from "@/lib/utils"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  variant?: "solid" | "dashed" | "dotted"
  dotSize?: number // Size of dots in pixels
  dotGap?: number // Gap between dots in pixels
}

function Separator({
  className,
  orientation = "horizontal",
  variant = "dotted",
  dotSize = 2,
  dotGap = 4,
  ...props
}: SeparatorProps) {
  // Create custom dotted pattern using CSS background
  const dotPattern = React.useMemo(() => {
    if (variant === "dotted") {
      const totalSize = dotSize + dotGap;
      if (orientation === "horizontal") {
        return {
          backgroundImage: `radial-gradient(circle, currentColor ${dotSize / 2}px, transparent ${dotSize / 2}px)`,
          backgroundSize: `${totalSize}px 1px`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center",
          height: "1px",
        };
      } else {
        return {
          backgroundImage: `radial-gradient(circle, currentColor ${dotSize / 2}px, transparent ${dotSize / 2}px)`,
          backgroundSize: `1px ${totalSize}px`,
          backgroundRepeat: "repeat-y",
          backgroundPosition: "center",
          width: "1px",
        };
      }
    }
    return {};
  }, [variant, orientation, dotSize, dotGap]);

  if (variant === "dotted") {
    return (
      <div
        data-slot="separator"
        className={cn(
          "shrink-0 text-foreground/40 dark:text-foreground/50",
          orientation === "horizontal" ? "w-full" : "h-full",
          className
        )}
        style={dotPattern}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="separator"
      className={cn(
        "border-foreground/40 dark:border-foreground/50 shrink-0",
        orientation === "horizontal"
          ? "h-0 w-full border-t"
          : "h-full w-0 border-l",
        variant === "dashed" && "border-dashed",
        variant === "solid" && "border-solid",
        className
      )}
      {...props}
    />
  );
}

export { Separator }

