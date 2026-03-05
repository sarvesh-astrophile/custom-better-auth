import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import { organization } from "better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import { sendInvitationEmail } from "./betterAuth/email";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
    verbose: false,
  },
);

export const createAuthOptions = () => {
  return {
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
      organization({
        creatorRole: "owner",
        disableOrganizationDeletion: true,
        membershipLimit: undefined, // unlimited
        invitationExpiresIn: 60 * 60 * 48, // 48 hours
        cancelPendingInvitationsOnReInvite: true,
        requireEmailVerificationOnInvitation: false,
        sendInvitationEmail: async (data) => {
          await sendInvitationEmail({
            id: data.id,
            email: data.email,
            organization: {
              id: data.organization.id,
              name: data.organization.name,
              slug: data.organization.slug,
            },
            inviter: {
              user: {
                id: data.inviter.user.id,
                name: data.inviter.user.name,
                email: data.inviter.user.email,
              },
            },
            role: data.role,
            expiresAt: new Date(data.invitation.expiresAt).getTime(),
          });
        },
      }),
    ],
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    ...createAuthOptions(),
    database: authComponent.adapter(ctx),
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
