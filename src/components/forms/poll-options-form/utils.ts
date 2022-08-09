import dayjs from "dayjs";

export const isoDateFormat = "YYYY-MM-DD";
export const isoDateTimeFormat = "YYYY-MM-DDTHH:mm:ss";

export const toIsoDateTime = (date: Date): string => {
  return dayjs(date).format(isoDateTimeFormat);
};

export const toIsoDate = (date: Date): string => {
  return dayjs(date).format(isoDateFormat);
};
