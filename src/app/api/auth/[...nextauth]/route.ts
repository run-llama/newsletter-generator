import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"
import { JWT } from "next-auth/jwt"

async function getTwitterUsername(accessToken: string): Promise<string> {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data.data.username;
  }

if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
  throw new Error('Missing Twitter OAuth credentials');
}  

export const authOptions = {
    providers: [
      TwitterProvider({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        version: "2.0", // opt-in to Twitter OAuth 2.0
      })
    ],
    callbacks: {
        async signIn({ user, account }: { user: any; account: any }) {
            const username = await getTwitterUsername(account.access_token);
            // Check if the user's Twitter username matches the allowed username
            if (username === process.env.TWITTER_USER) {
              return true; // Allow sign in
            } else {
              return false; // Deny sign in
            }
          },        
      async jwt({ token, account }: { token: JWT; account: any }) {
        // Persist the OAuth access_token to the token right after signin
        if (account) {
          token.accessToken = account.access_token
        }
        return token
      },
      async session({ session, token}: { session: any; token: JWT }) {
        // Send properties to the client, like an access_token from a provider.
        session.accessToken = token.accessToken
        return session
      }
    }
  }

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
