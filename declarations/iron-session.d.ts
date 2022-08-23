import "iron-session";

import { UserSession } from "@/utils/auth";

declare module "iron-session" {
  export interface IronSessionData {
    user?: UserSession;
  }
}
