"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronDown,
  MapPin,
  Sparkles,
  Search,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import HelperResultCard from "@/components/ui/helper-result-card";
import {
  matchHelper,
  type Helper,
} from "@/lib/matchApi";
import SmoothTab from "@/components/kokonutui/smooth-tab";
import AudioInput from "@/components/ui/audioInputs";

type Preferences = {
  workerPreference: string;
  workTime: string;
  jobRoles: string[];
  location: string;
  locationType: "gps" | "manual" | "";
};

const genderOptions = [
  {
    id: "male",
    title: "Male",
    color: "bg-[#BFE3F5]",
  },
  {
    id: "female",
    title: "Female",
    color: "bg-[#F6C6D5]",
  },
  {
    id: "couple",
    title: "Couple",
    color: "bg-[#DCD0F2]",
  },
  {
    id: "any",
    title: "No Preference",
    color: "bg-[#D8EBD8]",
  },
];

const workTimeOptions = [
  {
    id: "daytime",
    title: "Daytime",
    color: "bg-[#FFE7A8]",
  },
  {
    id: "live-in",
    title: "Live-in",
    color: "bg-[#DCD0F2]",
  },
  {
    id: "nighttime",
    title: "Nighttime",
    color: "bg-[#C8DDF2]",
  },
];

const jobRoleOptions = [
  {
    id: "maid",
    title: "Maid-Bai",
    color: "bg-[#F6C6D5]",
  },
  {
    id: "nanny",
    title: "Babysitter-Nanny",
    color: "bg-[#D8EBD8]",
  },
  {
    id: "cook",
    title: "Cook-Chef",
    color: "bg-[#FFE7A8]",
  },
  {
    id: "caregiver",
    title: "Patient-Elder Care",
    color: "bg-[#DCD0F2]",
  },
  {
    id: "driver",
    title: "Driver",
    color: "bg-[#C8DDF2]",
  },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Helper[]>([]);
  const [requirement, setRequirement] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(true);

  const [preferences, setPreferences] = useState<Preferences>({
    workerPreference: "",
    workTime: "",
    jobRoles: [],
    location: "",
    locationType: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLocationValid = () => {
    const location = preferences.location.trim();

    if (preferences.locationType === "gps") {
      return Boolean(location);
    }

    if (/^\d+$/.test(location)) {
      return location.length === 6;
    }

    return location.length >= 3;
  };

  const preferencesComplete =
    Boolean(preferences.workerPreference) &&
    Boolean(preferences.workTime) &&
    preferences.jobRoles.length > 0 &&
    locationConfirmed &&
    isLocationValid();

  useEffect(() => {
    if (preferencesComplete) {
      setPreferencesOpen(false);
    } else {
      setPreferencesOpen(true);
    }
  }, [preferencesComplete]);

  const updatePreference = (
    key: "workerPreference" | "workTime",
    value: string
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleJobRole = (roleId: string) => {
    setPreferences((prev) => {
      const alreadySelected = prev.jobRoles.includes(roleId);

      if (alreadySelected) {
        return {
          ...prev,
          jobRoles: prev.jobRoles.filter((id) => id !== roleId),
        };
      }

      // Enforce max 3
      if (prev.jobRoles.length >= 3) {
        return prev;
      }

      return {
        ...prev,
        jobRoles: [...prev.jobRoles, roleId],
      };
    });
  };

  const getGenderLabel = () => {
    return (
      genderOptions.find(
        (item) => item.id === preferences.workerPreference
      )?.title ?? ""
    );
  };

  const getGenderColor = () => {
    return (
      genderOptions.find(
        (item) => item.id === preferences.workerPreference
      )?.color ?? "bg-[#F6C6D5]"
    );
  };

  const getWorkTimeLabel = () => {
    return (
      workTimeOptions.find(
        (item) => item.id === preferences.workTime
      )?.title ?? ""
    );
  };

  const getJobRoleLabels = () =>
    preferences.jobRoles
      .map(
        (roleId) =>
          jobRoleOptions.find((item) => item.id === roleId)?.title
      )
      .filter((title): title is string => Boolean(title));

  const getLocationLabel = () => {
    if (!preferences.location.trim()) return "";
    if (preferences.locationType === "gps") return "Current location";
    return preferences.location;
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Location is not supported by your browser. Please enter your area or PIN code."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPreferences((prev) => ({
          ...prev,
          locationType: "gps",
          location: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`,
        }));
        setLocationConfirmed(true);
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        alert(
          "We could not access your location. Please enter your area or PIN code."
        );
      }
    );
  };

  const handleLocation = (value: string) => {
    setLocationConfirmed(false);
    setPreferences((prev) => ({
      ...prev,
      location: value,
      locationType: value.trim() ? "manual" : "",
    }));
  };

  const selectedPreferences = [
    {
      text: getGenderLabel(),
      color: getGenderColor(),
    },
    {
      text: getWorkTimeLabel(),
      color: "bg-[#FFE7A8]",
    },
    ...getJobRoleLabels().map((title, index) => ({
      text: title,
      color:
        jobRoleOptions.find(
          (item) => item.id === preferences.jobRoles[index]
        )?.color ?? "bg-[#DCD0F2]",
    })),
    {
      text: `📍 ${getLocationLabel()}`,
      color: "bg-[#BFE3F5]",
    },
  ].filter((item) => item.text);

  const handleFindMatch = async () => {
    if (!preferencesComplete) {
      setPreferencesOpen(true);
      setError(
        "Please complete Gender, Work time, required services, and Location first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    const services = getJobRoleLabels();

    const structuredRequirement = `
I am looking to hire help for these services: ${services.join(", ")}.

Gender preference: ${getGenderLabel()}.
Work time: ${getWorkTimeLabel()}.
Location: ${getLocationLabel()}.

Additional requirement:
${requirement.trim() || "No additional requirements provided."}
    `.trim();

    try {
      const data = await matchHelper(structuredRequirement, audioFile);
      setResults(data.matches || []);

      if ((!data.matches || data.matches.length === 0) && data.message) {
        setError(data.message);
      }
    } catch (caughtError) {
      console.error("Smart Match error:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to find matches."
      );
    } finally {
      setLoading(false);
    }
  };

  const completedCount = [
    preferences.workerPreference,
    preferences.workTime,
    preferences.jobRoles.length > 0,
    locationConfirmed && isLocationValid(),
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#FFFDF9] px-3 py-5 sm:px-5 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <header className="mb-6 text-center sm:mb-7">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#F6C6D5]/50 px-3 py-1.5 text-[11px] font-medium">
            <Sparkles className="h-3 w-3" />
            Smart Match
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#1F1B17] sm:text-3xl">
            Find the right worker
          </h1>

          <p className="mt-1.5 text-xs text-black/55 sm:text-sm">
            Add your preferences for more accurate matches.
          </p>
        </header>

        {/* Preferences Card */}
        <section className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white/90 shadow-[0_15px_50px_rgba(70,50,40,0.07)]">
          <div className="p-4 sm:p-6">
            <button
              type="button"
              onClick={() => {
                if (preferencesComplete) {
                  setPreferencesOpen((open) => !open);
                }
              }}
              aria-expanded={preferencesOpen}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-[#1F1B17]">
                    Your preferences
                  </h2>

                  {preferencesComplete && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D8EBD8]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-black/55">
                  {preferencesComplete
                    ? "Complete · tap to edit"
                    : `${completedCount} of 4 completed`}
                </p>
              </div>

              {preferencesComplete && (
                <ChevronDown
                  className={`h-5 w-5 text-black/60 transition-transform ${
                    preferencesOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* Collapsed summary */}
            {!preferencesOpen && preferencesComplete && (
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-black/50">
                  Your selection
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPreferences.map((item) => (
                    <PreferencePill
                      key={item.text}
                      text={item.text}
                      color={item.color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Expandable fields */}
            {mounted ? (
              <AnimatePresence initial={false}>
                {preferencesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <PreferencesFields
                      preferences={preferences}
                      locationLoading={locationLoading}
                      getCurrentLocation={getCurrentLocation}
                      handleLocation={handleLocation}
                      setLocationConfirmed={setLocationConfirmed}
                      updatePreference={updatePreference}
                      toggleJobRole={toggleJobRole}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <PreferencesFields
                preferences={preferences}
                locationLoading={locationLoading}
                getCurrentLocation={getCurrentLocation}
                handleLocation={handleLocation}
                setLocationConfirmed={setLocationConfirmed}
                updatePreference={updatePreference}
                toggleJobRole={toggleJobRole}
              />
            )}
          </div>

          <div className="h-px bg-black/5" />

          {/* Additional requirements */}
          <div className="bg-[#FFFCF8] p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0C2]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1F1B17]">
                  Anything else?
                </h2>
                <p className="text-xs text-black/55">
                  Optional — add details by typing or speaking.
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 bg-white">
              <textarea
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                rows={4}
                placeholder={`Tell us anything else...

For example: I need someone who can cook Maharashtrian food, take care of my elderly mother, and is comfortable with pets.`}
                className="min-h-[125px] w-full resize-none border-0 bg-transparent px-4 py-4 text-sm leading-6 text-[#1F1B17] outline-none placeholder:text-black/45"
              />

              <div className="flex items-center justify-between gap-3 border-t border-black/5 bg-[#FAF8F4] px-3 py-2">
                <AudioInput onAudioChange={(file) => setAudioFile(file)} />

                <button
                  type="button"
                  onClick={handleFindMatch}
                  disabled={loading || !preferencesComplete}
                  className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#29251F] px-4 text-xs font-medium text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Search className="h-3.5 w-7" />
                  {loading ? "Finding..." : ""}
                </button>
              </div>
            </div>

            {!preferencesComplete && (
              <p className="mt-3 text-xs text-black/55">
                Complete the four preferences above before finding matches.
              </p>
            )}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <section className="mt-5">
            <div className="mb-3">
              <h2 className="text-base font-semibold text-[#1F1B17]">
                Best matches
              </h2>
              <p className="text-xs text-black/55">
                AI found {results.length} matching helpers.
              </p>
            </div>

            <div className="space-y-3">
              {results.map((helper, index) => (
                <HelperResultCard
                  key={helper.id}
                  helper={helper}
                  isTopMatch={index === 0}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* ========== Sub components ========== */

function PreferencesFields({
  preferences,
  locationLoading,
  getCurrentLocation,
  handleLocation,
  setLocationConfirmed,
  updatePreference,
  toggleJobRole,
}: {
  preferences: Preferences;
  locationLoading: boolean;
  getCurrentLocation: () => void;
  handleLocation: (value: string) => void;
  setLocationConfirmed: (value: boolean) => void;
  updatePreference: (
    key: "workerPreference" | "workTime",
    value: string
  ) => void;
  toggleJobRole: (roleId: string) => void;
}) {
  return (
    <div className="mt-5 space-y-5">
      {/* Gender */}
      <div>
        <PreferenceLabel>Gender preference</PreferenceLabel>
        <SmoothTab
          items={genderOptions}
          value={preferences.workerPreference}
          onChange={(value) => updatePreference("workerPreference", value)}
        />
      </div>

      {/* Work time */}
      <div>
        <PreferenceLabel>Work time</PreferenceLabel>
        <SmoothTab
          items={workTimeOptions}
          value={preferences.workTime}
          onChange={(value) => updatePreference("workTime", value)}
        />
      </div>

      {/* Job roles */}
      <div>
        <PreferenceLabel>What help do you need?</PreferenceLabel>
        <p className="mb-2 text-xs text-black/55">
          Select max 3 only
          {preferences.jobRoles.length > 0 && (
            <span className="ml-1.5 font-medium text-black/70">
              ({preferences.jobRoles.length}/3)
            </span>
          )}
        </p>

        <div className="flex flex-wrap gap-2">
          {jobRoleOptions.map((role) => {
            const isSelected = preferences.jobRoles.includes(role.id);
            const isDisabled =
              !isSelected && preferences.jobRoles.length >= 3;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleJobRole(role.id)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className={`rounded-xl px-3.5 py-2 text-xs transition-all sm:text-sm ${
                  isSelected
                    ? `${role.color} scale-[1.02] font-semibold text-black shadow-sm`
                    : isDisabled
                    ? "cursor-not-allowed bg-[#FAFAF8] font-medium text-black/30"
                    : "bg-[#FAFAF8] font-medium text-black hover:bg-black/[0.04]"
                }`}
              >
                {role.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location */}
      <div>
        <PreferenceLabel>Location</PreferenceLabel>

        <div
          className={`flex h-11 w-full overflow-hidden rounded-xl border bg-[#FAFAF8] transition ${
            preferences.location
              ? "border-[#BFE3F5]"
              : "border-black/10"
          }`}
        >
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={locationLoading}
            aria-label="Use current location"
            className={`flex w-11 shrink-0 items-center justify-center border-r border-black/5 transition ${
              preferences.locationType === "gps"
                ? "bg-[#BFE3F5]/60"
                : "hover:bg-[#BFE3F5]/25"
            }`}
          >
            <MapPin className="h-4 w-4" />
          </button>

          <input
            value={preferences.location}
            onChange={(e) => handleLocation(e.target.value)}
            onBlur={() => {
              const location = preferences.location.trim();
              const validPin = /^\d{6}$/.test(location);
              const validAreaName =
                !/^\d+$/.test(location) && location.length >= 3;

              if (
                preferences.locationType === "gps" ||
                validPin ||
                validAreaName
              ) {
                setLocationConfirmed(true);
              }
            }}
            placeholder={
              locationLoading
                ? "Getting your location..."
                : "Area, PIN code or full address"
            }
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#1F1B17] outline-none placeholder:text-black/45"
          />
        </div>

        <p className="mt-1.5 text-[10px] text-black/50">
          Required · Enter a six-digit PIN or area name.
        </p>
      </div>
    </div>
  );
}

function PreferenceLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-sm font-medium text-[#1F1B17]">
      {children}
      <span className="ml-1 text-[#C26A6A]">*</span>
    </p>
  );
}

function PreferencePill({
  text,
  color,
}: {
  text: string;
  color: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-medium text-black ${color}`}
    >
      {text}
    </span>
  );
}