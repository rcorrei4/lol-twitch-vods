import { prisma } from "@/lib/prisma";

export async function insertTwitchAuthToken(access_token: string) {
  await prisma.token.upsert({
    where: {
      access_token: access_token,
    },
    update: {
      access_token: access_token,
      expires_at: new Date(Date.now()),
    },
    create: {
      access_token: access_token,
      expires_at: new Date(Date.now()),
    },
  });
}

export async function getTwitchAuthToken() {
  const token = await prisma.token.findFirst();

  return token?.access_token;
}
