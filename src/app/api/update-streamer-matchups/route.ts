import { updateStreamerMatchupsVods } from "@/application/actions/getStreamerMatchups";
import { createHmac, timingSafeEqual } from "crypto";

const TWITCH_MESSAGE_ID = "Twitch-Eventsub-Message-Id".toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP =
  "Twitch-Eventsub-Message-Timestamp".toLowerCase();
const TWITCH_MESSAGE_SIGNATURE =
  "Twitch-Eventsub-Message-Signature".toLowerCase();
const MESSAGE_TYPE = "Twitch-Eventsub-Message-Type".toLowerCase();

const MESSAGE_TYPE_VERIFICATION = "webhook_callback_verification";
const MESSAGE_TYPE_NOTIFICATION = "notification";
const MESSAGE_TYPE_REVOCATION = "revocation";

const secret = process.env.TWITCH_EVENTSUB_SECRET || "";

async function getHmacMessage(requestRawBody: string, requestHeaders: Headers) {
  const messageID = requestHeaders.get(TWITCH_MESSAGE_ID) || "";
  const timestamp = requestHeaders.get(TWITCH_MESSAGE_TIMESTAMP) || "";

  return messageID + timestamp + requestRawBody;
}

function getHmac(secret: string, message: string) {
  return createHmac("sha256", secret).update(message).digest("hex");
}

function verifyMessage(hmac: string, verifySignature: string) {
  const hmacBuffer = Buffer.from(hmac);
  const verifySignatureBuffer = Buffer.from(verifySignature);

  const hmacUint8Array = new Uint8Array(hmacBuffer);
  const verifySignatureUint8Array = new Uint8Array(verifySignatureBuffer);

  return timingSafeEqual(hmacUint8Array, verifySignatureUint8Array);
}

export async function POST(request: Request) {
  const requestRawBody = await request.text();
  const requestHeaders = new Headers(request.headers);

  const message = await getHmacMessage(requestRawBody, requestHeaders);
  const hmac = "sha256=" + getHmac(secret, message);

  const twitchMessageSignature =
    requestHeaders.get(TWITCH_MESSAGE_SIGNATURE) || "";

  if (verifyMessage(hmac, twitchMessageSignature)) {
    console.log("Signatures match");
    const requestBody = JSON.parse(requestRawBody);

    if (MESSAGE_TYPE_NOTIFICATION === requestHeaders.get(MESSAGE_TYPE)) {
      console.log(
        `Streamer with id of: ${requestBody.event.broadcaster_user_id} is now offline, checking for new videos...`
      );

      updateStreamerMatchupsVods(requestBody.event.broadcaster_user_id);

      return new Response(null, {
        status: 204,
      });
    } else if (MESSAGE_TYPE_VERIFICATION === requestHeaders.get(MESSAGE_TYPE)) {
      return new Response(requestBody.challenge, {
        status: 200,
      });
    } else if (MESSAGE_TYPE_REVOCATION === requestHeaders.get(MESSAGE_TYPE)) {
      console.log(`${requestBody.subscription.type} notifications revoked!`);
      console.log(`reason: ${requestBody.subscription.status}`);
      console.log(
        `condition: ${JSON.stringify(
          requestBody.subscription.condition,
          null,
          4
        )}`
      );

      return new Response(null, {
        status: 204,
      });
    } else {
      console.log(`Unknown message type: ${requestHeaders.get(MESSAGE_TYPE)}`);
      return new Response(null, {
        status: 204,
      });
    }
  } else {
    return new Response(null, {
      status: 403,
    });
  }
}
