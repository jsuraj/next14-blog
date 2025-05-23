import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/db/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env'
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification error', {
      status: 400,
    });
  }

  if (evt.type == 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    try {
      const newEvent = await db.user.create({
        data: {
          id: id,
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
          profileImage: image_url,
        },
      });
      return new Response(JSON.stringify(newEvent), { status: 201 });
    } catch (error) {
      console.error('Error: Failed to store event in database', error);
      return new Response('Error: Failed to store vent in database', {
        status: 500,
      });
    }
  }
  return new Response('Webhook received', { status: 200 });
}
