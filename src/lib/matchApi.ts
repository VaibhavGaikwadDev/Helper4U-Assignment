const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type Helper = {
  id: number | string;
  name: string;
  workerType?: "male" | "female" | "couple";
  primarySkill: string;
  subSkills?: string;
  languages?: string;
  shiftPreference?: string;
  experienceYears?: number;
  locationArea?: string;
  isImmediatelyAvailable?: boolean;
  matchScore?: number;
  birthYear?: number;
  aboutMe?: string;
  aadhaarVerified?: boolean;
  backgroundVerified?: boolean;
  phoneVerified?: boolean;
  matchSummary?: string;
};

export type MatchResponse = {
  success: boolean;
  matches: Helper[];
  extractedCriteria?: {
    skills?: string[];
    sub_skills?: string[];
    worker_preference?: string | null;
    timing?: string | null;
    urgency?: boolean;
    location?: string | null;
    languages?: string[];
  };
  message?: string;
  error?: string;
};

export async function matchHelper(requirementText: string, audio?: File | null): Promise<MatchResponse> {
  const formData = new FormData();
  formData.append("requirementText", requirementText);
  if (audio) formData.append("audio", audio, audio.name);

  const response = await fetch(`${API_BASE}/api/match-helper`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Something went wrong while finding matches.");
  }
  return data;
}
