import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }: any) {
      if (account?.provider === "discord") {
        token.discordId = profile?.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      (session.user as any).discordId = (token as any).discordId;
      return session;
    },
  },
} as const;
