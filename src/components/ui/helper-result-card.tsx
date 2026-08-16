
"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Helper } from "@/lib/matchApi";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HelperResultCardProps = {
  helper: Helper;
  isTopMatch: boolean;
};

export default function HelperResultCard({
  helper,
  isTopMatch,
}: HelperResultCardProps) {
  const [open, setOpen] = useState(false);

  const age = helper.birthYear
    ? new Date().getFullYear() - helper.birthYear
    : null;

  const availabilityLabel = helper.isImmediatelyAvailable
    ? "Available now"
    : "To confirm";

  // Dummy avatar (replace later with real photo)
  const avatarUrl = `https://i.pravatar.cc/150?u=${helper.id || helper.name}`;

  const initials = helper.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "H";

  return (
    <>
      {/* ====== Compact Card ====== */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full rounded-2xl border border-black/[0.04] bg-white p-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all hover:border-black/[0.08] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] active:scale-[0.99]"
      >
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-black/5">
              <AvatarImage src={avatarUrl} alt={helper.name} />
              <AvatarFallback className="bg-[#F6C6D5] text-sm font-semibold text-[#5C3A4A]">
                {initials}
              </AvatarFallback>
            </Avatar>

            {helper.isImmediatelyAvailable && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#35A854]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Top match badge */}
            {isTopMatch && (
              <div className="mb-1.5 flex items-center gap-1">
                <Badge className="h-5 gap-1 rounded-full border-0 bg-[#E7F6E7] px-2 text-[10px] font-semibold text-[#29653A] hover:bg-[#E7F6E7]">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Recommended
                </Badge>
              </div>
            )}

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-semibold tracking-tight text-[#1F1B17]">
                  {helper.name}
                </h3>
                <p className="mt-0.5 text-xs text-black/55">
                  {age ? `${age} yrs` : "Age N/A"}
                  {/* {gender ? ` · ${gender}` : ""} */}
                  {helper.primarySkill ? ` · ${helper.primarySkill}` : ""}
                </p>
              </div>

              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-black/25 transition group-hover:text-black/50" />
            </div>

            {/* Pastel badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <PastelBadge color="green">
                <CheckCircle2 className="h-3 w-3" />
                {availabilityLabel}
              </PastelBadge>

              <PastelBadge color="yellow">
                <BriefcaseBusiness className="h-3 w-3" />
                {helper.experienceYears ?? 0}+ yrs
              </PastelBadge>

              <PastelBadge color="blue">
                <MapPin className="h-3 w-3" />
                {helper.locationArea || "Mumbai"}
              </PastelBadge>

              <PastelBadge color="purple">
                <Clock3 className="h-3 w-3" />
                {helper.shiftPreference || "Flexible"}
              </PastelBadge>
            </div>
          </div>
        </div>

        {/* Short summary */}
        {(helper.aboutMe || helper.matchSummary) && (
          <p className="mt-3 line-clamp-2 text-[12.5px] leading-5 text-black/60">
            {helper.aboutMe || helper.matchSummary}
          </p>
        )}
      </button>

      {/* ====== Full Profile Modal ====== */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] sm:flex sm:items-center sm:justify-center sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label={`${helper.name} profile`}
              className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-[1.75rem] bg-[#FFFDF9] shadow-2xl sm:static sm:w-full sm:max-w-md sm:rounded-[1.75rem]"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky header */}
              <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-black/5 bg-[#FFFDF9]/90 px-4 py-3 backdrop-blur-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-9 gap-1.5 rounded-xl px-2.5 text-xs font-medium text-[#1F1B17] hover:bg-black/5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>

              <div className="px-5 pb-8 pt-5 sm:px-6">
                {/* Profile header */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-md ring-1 ring-black/5">
                    <AvatarImage src={avatarUrl} alt={helper.name} />
                    <AvatarFallback className="bg-[#F6C6D5] text-xl font-semibold text-[#5C3A4A]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 pt-1">
                    {isTopMatch && (
                      <Badge className="mb-2 h-5 gap-1 rounded-full border-0 bg-[#E7F6E7] px-2 text-[10px] font-semibold text-[#29653A] hover:bg-[#E7F6E7]">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        Recommended for you
                      </Badge>
                    )}

                    <h2 className="text-xl font-semibold tracking-tight text-[#1F1B17]">
                      {helper.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-black/55">
                      {age ? `${age} years old` : "Age not listed"}
                      {helper.locationArea ? ` · ${helper.locationArea}` : ""}
                    </p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  <StatCard label="Availability" value={availabilityLabel} />
                  <StatCard
                    label="Experience"
                    value={`${helper.experienceYears ?? 0}+ years`}
                  />
                  <StatCard
                    label="Work time"
                    value={helper.shiftPreference || "Flexible"}
                  />
                  <StatCard
                    label="Match score"
                    value={
                      helper.matchScore ? `${helper.matchScore}%` : "Good match"
                    }
                  />
                </div>

                {/* Sections */}
                <Section title="Available as">
                  <Pills value={helper.primarySkill} color="bg-[#FFE7A8]" />
                </Section>

                <Section title="Expertise">
                  <Pills value={helper.subSkills} color="bg-[#F6C6D5]" />
                </Section>

                {helper.languages && (
                  <Section title="Languages">
                    <Pills value={helper.languages} color="bg-[#BFE3F5]" />
                  </Section>
                )}

                {(helper.aboutMe || helper.matchSummary) && (
                  <Section title="About">
                    <p className="text-sm leading-6 text-black/70">
                      {helper.aboutMe || helper.matchSummary}
                    </p>
                  </Section>
                )}

                {/* Verification */}
                <div className="mt-7 grid grid-cols-3 gap-2 border-t border-black/5 pt-5">
                  <VerificationItem
                    checked={helper.aadhaarVerified}
                    label="Aadhaar"
                  />
                  <VerificationItem
                    checked={helper.backgroundVerified}
                    label="Background"
                  />
                  <VerificationItem
                    checked={helper.phoneVerified}
                    label="Phone"
                  />
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ========== Small helpers ========== */

function PastelBadge({
  children,
  color,
}: {
  children: ReactNode;
  color: "green" | "yellow" | "blue" | "purple" | "pink";
}) {
  const styles = {
    green: "bg-[#E7F6E7] text-[#29653A]",
    yellow: "bg-[#FFF3D6] text-[#7A5C1E]",
    blue: "bg-[#E3F0F9] text-[#2A5A7A]",
    purple: "bg-[#F0E9FA] text-[#5A4580]",
    pink: "bg-[#FBEAF0] text-[#7A3F55]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
        styles[color]
      )}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/[0.04] bg-white px-3.5 py-3 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wider text-black/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#1F1B17]">{value}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6">
      <h3 className="mb-2.5 text-sm font-semibold text-[#1F1B17]">{title}</h3>
      {children}
    </section>
  );
}

function Pills({ value, color }: { value?: string; color: string }) {
  const items =
    value
      ?.split("|")
      .map((item) => item.trim())
      .filter(Boolean) || [];

  if (items.length === 0) {
    return (
      <p className="text-sm text-black/45">Not specified</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium text-black",
            color
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function VerificationItem({
  checked,
  label,
}: {
  checked?: boolean;
  label: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 text-center text-[11px]",
        checked ? "text-[#29653A]" : "text-black/35"
      )}
    >
      <BadgeCheck className="h-4.5 w-4.5" />
      <span className="leading-tight">
        {checked ? `${label} verified` : `${label} pending`}
      </span>
    </div>
  );
}