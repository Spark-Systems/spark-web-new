"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ScrollController } from "@/lib/scroll/scroll-controller";
import { useMotion } from "./motion-provider";

const ScrollControllerContext = createContext<ScrollController | null>(null);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const motion = useMotion();
  // The constructor touches no browser APIs, so this is safe during SSR.
  const [controller] = useState(() => new ScrollController());

  useEffect(() => {
    controller.attach({ smooth: motion });
    return () => controller.detach();
  }, [controller, motion]);

  return <ScrollControllerContext.Provider value={controller}>{children}</ScrollControllerContext.Provider>;
}

export const useScrollController = () => useContext(ScrollControllerContext);
