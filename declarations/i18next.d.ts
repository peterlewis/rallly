import "react-i18next";

import app from "~/public/locales/en/app.json";
import common from "~/public/locales/en/common.json";
import errors from "~/public/locales/en/errors.json";
import homepage from "~/public/locales/en/homepage.json";
import login from "~/public/locales/en/login.json";
import register from "~/public/locales/en/register.json";

declare module "next-i18next" {
  interface Resources {
    homepage: typeof homepage;
    app: typeof app;
    common: typeof common;
    errors: typeof errors;
    register: typeof register;
    login: typeof login;
  }
}
