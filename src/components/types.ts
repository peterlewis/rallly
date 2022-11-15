export interface NewPollFormData {
  title: string;
  location: string;
  description: string;
  dates: Array<{
    date: string;
    times: Array<{
      time: string;
    }>;
  }>;
  shouldUseSameTimeForAllDates: boolean;
  globalTimes: Array<{
    time: string;
  }>;
  duration: number;
  timezonePolicy: "auto" | "fixed";
}
