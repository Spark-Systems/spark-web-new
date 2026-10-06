"use client";

import type { ReactNode } from "react";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { MotionProvider } from "./motion-provider";
import { RevealObserver } from "./reveal-observer";
import { SmoothScrollProvider } from "./smooth-scroll-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <SmoothScrollProvider>
        {children}
        <RevealObserver />
        <CustomCursor />
      </SmoothScrollProvider>
    </MotionProvider>
  );
}
