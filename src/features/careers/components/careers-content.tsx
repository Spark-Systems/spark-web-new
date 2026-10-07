"use client";

import { useState } from "react";
import { useScrollController } from "@/components/providers/smooth-scroll-provider";
import type { CareersPageData } from "@/types/careers";
import { ApplySection } from "./apply-section";
import { RolesSection } from "./roles-section";

/**
 * The open roles and the application form. "Apply for this role" picks the
 * role in the form and glides down to it.
 */
export function CareersContent({ roles, apply }: Pick<CareersPageData, "roles" | "apply">) {
  const controller = useScrollController();
  const [position, setPosition] = useState("");

  const applyFor = (title: string) => {
    setPosition(title);
    const form = document.getElementById("apply");
    if (!form) return;
    const y = form.getBoundingClientRect().top + window.scrollY - 60;
    if (controller) controller.glideTo(y);
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <RolesSection {...roles} onApply={applyFor} />
      <ApplySection {...apply} roles={roles.items.map((r) => r.title)} position={position} onPositionChange={setPosition} />
    </>
  );
}
