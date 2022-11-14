export interface NewPollFormData {
  title: string;
  location: string;
  description: string;
  options: string[];
  duration: number;
  timeZone: "auto" | "fixed";
}
