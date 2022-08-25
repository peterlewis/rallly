import * as Eta from "eta";
import { readFileSync } from "fs";
import path from "path";

import { prisma } from "~/prisma/db";

import { absoluteUrl } from "./absolute-url";
import { sendEmail } from "./send-email";

type NotificationAction =
  | {
      type: "newParticipant";
      participantName: string;
    }
  | {
      type: "newComment";
      authorName: string;
      comment: string;
    };

export const sendNotification = async (
  pollId: string,
  action: NotificationAction,
): Promise<void> => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { user: true },
    });

    /**
     * poll needs to:
     * - exist
     * - be verified
     * - not be a demo
     * - have notifications turned on
     */
    if (poll && poll.user && !poll.demo && poll.notifications) {
      const homePageUrl = absoluteUrl();
      const pollUrl = `${homePageUrl}/admin/${poll.adminUrlId}`;
      const unsubscribeUrl = `${pollUrl}?unsubscribe=true`;

      switch (action.type) {
        case "newParticipant":
          await sendEmailTemplate({
            templateName: "new-participant",
            to: poll.user.email,
            subject: `${poll.title}: New participant`,
            templateVars: {
              title: poll.title,
              name: poll.user.name,
              participantName: action.participantName,
              pollUrl,
              homePageUrl: absoluteUrl(),
              supportEmail: process.env.SUPPORT_EMAIL,
              unsubscribeUrl,
            },
          });
          break;
        case "newComment":
          await sendEmailTemplate({
            templateName: "new-comment",
            to: poll.user.email,
            subject: `${poll.title}: New comment`,
            templateVars: {
              title: poll.title,
              name: poll.user.name,
              authorName: action.authorName,
              comment: action.comment,
              pollUrl,
              homePageUrl: absoluteUrl(),
              supportEmail: process.env.SUPPORT_EMAIL,
              unsubscribeUrl,
            },
          });
          break;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

interface SendEmailTemplateParams {
  templateName: string;
  to: string;
  subject: string;
  templateVars: Record<string, string | undefined>;
}

export const sendEmailTemplate = async ({
  templateName,
  templateVars,
  to,
  subject,
}: SendEmailTemplateParams) => {
  const template = readFileSync(
    path.resolve(process.cwd(), `./templates/${templateName}.html`),
  ).toString();

  const rendered = await Eta.render(template, {
    ...templateVars,
    homePageUrl: absoluteUrl(),
    supportEmail: process.env.SUPPORT_EMAIL,
  });

  if (rendered) {
    await sendEmail({
      html: rendered,
      to,
      subject,
    });
  } else {
    throw new Error(`Failed to render email template: ${templateName}`);
  }
};
