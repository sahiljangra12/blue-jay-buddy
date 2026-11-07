import type { UserValidateEvent, UserSignupEvent } from "@netlify/functions";

// Only Johns Hopkins email addresses can create a Blue Jay Buddy account (used for Groups).
const JHU = /@(jh|jhu|jhmi)\.edu$/i;

export default {
  userValidate(event: UserValidateEvent) {
    if (!JHU.test(event.user.email || "")) return event.deny();
  },
  userSignup(event: UserSignupEvent) {
    if (!JHU.test(event.user.email || "")) return event.deny();
    // Role takes effect on the user's next login or token refresh, not immediately.
    return { user: { ...event.user, appMetadata: { ...event.user.appMetadata, roles: ["student"] } } };
  },
};
