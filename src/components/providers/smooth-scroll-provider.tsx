"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
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

  // Open each newly visited page at the top (see ScrollController.routeChanged).
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    controller.routeChanged();
  }, [controller, pathname]);

  return <ScrollControllerContext.Provider value={controller}>{children}</ScrollControllerContext.Provider>;
}

export const useScrollController = () => useContext(ScrollControllerContext);
