import "express-session";
import { UserId } from "shared-types";

declare module "express-session" {
  interface SessionData {
    user?: { id: UserId; username: string };
  }
}
