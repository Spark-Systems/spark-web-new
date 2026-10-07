"use client"

import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@admin/lib/utils"
import { Button } from "@admin/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  canScrollPrev: boolean
  canScrollNext: boolean
  selectedIndex: number
  snapCount: number
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [state, setState] = React.useState({ canScrollPrev: false, canScrollNext: false, selectedIndex: 0, snapCount: 0 })

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api])
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api])
  const scrollTo = React.useCallback((index: number) => api?.scrollTo(index), [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const rtl = opts?.direction === "rtl"
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        if (rtl) scrollNext()
        else scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        if (rtl) scrollPrev()
        else scrollNext()
      }
    },
    [scrollPrev, scrollNext, opts?.direction]
  )

  React.useEffect(() => {
    if (!api) return
    setApi?.(api)
    // Embla is an external store: mirror its scroll state whenever it changes.
    const sync = (embla: NonNullable<CarouselApi>) =>
      setState({
        canScrollPrev: embla.canScrollPrev(),
        canScrollNext: embla.canScrollNext(),
        selectedIndex: embla.selectedScrollSnap(),
        snapCount: embla.scrollSnapList().length,
      })
    api.on("init", sync).on("reInit", sync).on("select", sync)
    // Already initialised by the time the api reaches us.
    queueMicrotask(() => sync(api))
    return () => {
      api.off("init", sync).off("reInit", sync).off("select", sync)
    }
  }, [api, setApi])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        scrollTo,
        ...state,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  // contain: the track never widens the layout around the carousel.
  return (
    <div ref={carouselRef} className="overflow-hidden [contain:inline-size]" data-slot="carousel-content">
      <div className={cn("flex", orientation === "horizontal" ? "-ms-4" : "-mt-4 flex-col", className)} {...props} />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "ps-4" : "pt-4", className)}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn("rounded-full", className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon className="rtl:rotate-180" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn("rounded-full", className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon className="rtl:rotate-180" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

/** One dot per scroll position; the current one is stretched. Hidden when everything fits. */
function CarouselDots({ className, label, ...props }: React.ComponentProps<"div"> & { label?: (index: number) => string }) {
  const { scrollTo, selectedIndex, snapCount } = useCarousel()
  if (snapCount < 2) return null

  return (
    <div data-slot="carousel-dots" className={cn("flex items-center justify-center gap-1.5", className)} {...props}>
      {Array.from({ length: snapCount }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={label?.(index) ?? `Go to slide ${index + 1}`}
          aria-current={index === selectedIndex || undefined}
          onClick={() => scrollTo(index)}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            index === selectedIndex ? "bg-primary w-5" : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5"
          )}
        />
      ))}
    </div>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  useCarousel,
}
