import dayjs from "dayjs";

export const isoDateFormat = "YYYY-MM-DD";
export const isoDateTimeFormat = "YYYY-MM-DDTHH:mm:ss";

export const formatDateWithoutTz = (date: Date): string => {
  return dayjs(date).format("YYYY-MM-DDTHH:mm:ss");
};

export const formatDateWithoutTime = (date: Date): string => {
  return dayjs(date).format("YYYY-MM-DD");
};
