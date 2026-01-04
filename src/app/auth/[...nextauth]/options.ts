import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        identifier: {
          label: "Username or Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials: any): Promise<any> {
        await dbConnect(); //connect to the database

        try {
          const user = await UserModel.findOne({
            $or: [ //mongo db operator
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) { //for user
            throw new Error("no user found with this mail");
          }

          if (!user.isVerified) { //for verified user
            throw new Error("please verify your acc first");
          }

          const isPasswordCorrect = await bcrypt.compare( //password hashing if new
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) { //incorrect password
            return user;
          } else {
            throw new Error("invalid password");
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: { //hooks that let you control what data flows into the pipeline
    async jwt({ token, user }) { 
      if (user) {
        token._id = user._id?.toString();
        token._isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
