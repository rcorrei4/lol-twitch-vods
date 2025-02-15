import { prisma } from '~/lib/prisma';

const CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || '';

async function insertTwitchAuthToken(access_token: string) {
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

async function getTwitchToken() {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    {
      method: 'POST',
    }
  );

  if (response.ok) {
    const data = await response.json();
    const acess_token: string = data.access_token;

    if (acess_token !== undefined) {
      await insertTwitchAuthToken(data.access_token);

      return acess_token;
    }

    throw Error('Error while fetching twitch token!');
  } else {
    throw new Error(
      `Failed to fetch token: ${response.status} ${response.statusText}`
    );
  }
}

export async function getTwitchAuthToken() {
  const tokenData = await prisma.token.findFirst();
  let token = tokenData?.access_token;

  if (token === undefined) {
    token = await getTwitchToken();
  }

  return token;
}
