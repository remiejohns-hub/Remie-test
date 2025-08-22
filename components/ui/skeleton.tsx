import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent/20 animate-[pulse_1.5s_ease-in-out_infinite] rounded-md",
        "before:content-[''] before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "before:animate-[shimmer_1.5s_infinite]",
        "relative overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
