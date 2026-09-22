# Facebook & Instagram DMs → /admin/leads

New messages to the business Facebook Pages and Instagram accounts arrive as
leads in `/admin/leads`, and the office gets the usual "new enquiry" text.
Replies still happen in the Facebook/Instagram inbox — the site only captures
messages, it never sends them.

One Meta app can serve **several pages**: connect each page to the same app
and each lead is labelled with the page that was messaged. `META_ALLOWED_PAGES`
(comma-separated page ids; for Instagram, the IG account id) restricts which
pages are handled — currently set to the Fresh For Less page only
(`312158372318245`); events from any other connected page are dropped.

## How it works

- Meta calls `POST /api/meta/webhook` for every new page/IG message.
- Each new conversation becomes a lead (source `facebook-dm` or
  `instagram-dm`) with the message text in the notes and no phone number.
- Follow-up messages from the same person are appended to their open lead
  rather than creating a new lead each time. Once a lead is marked booked or
  not proceeding, the next message from that person opens a fresh lead.
- Duplicate webhook deliveries are dropped (`social_events` table), so Meta's
  retries can't create duplicate leads.

## One-time setup in Meta (needs your Facebook login)

1. **Create the app** — go to https://developers.facebook.com → My Apps →
   Create App → type **Business**. Name it e.g. "Fresh For Less Leads".
2. **Add products** — on the app dashboard add **Messenger** and, if you want
   Instagram DMs too, **Instagram** (Instagram messaging requires the IG
   account to be a Business/Creator account linked to the Facebook Page).
3. **Connect the Page(s)** — in Messenger → Settings, connect each business
   Facebook Page and click **Generate token** for each. With one page, that
   token is `META_PAGE_ACCESS_TOKEN`. With several pages, set one variable per
   page: `META_PAGE_ACCESS_TOKEN_<pageid>` (the page id is shown next to the
   page in the same screen, or under the page's About → Page transparency),
   e.g. `META_PAGE_ACCESS_TOKEN_312158372318245`. A plain
   `META_PAGE_ACCESS_TOKEN` still works as the fallback for any page without
   its own variable.
4. **App secret** — App Settings → Basic → App Secret. That is
   `META_APP_SECRET`.
5. **Set the env vars in Vercel** (Project → Settings → Environment
   Variables), then redeploy:

   | Variable | Value |
   | --- | --- |
   | `META_VERIFY_TOKEN` | Any long random string you invent — used once for the handshake |
   | `META_APP_SECRET` | From step 4 — the webhook rejects unsigned posts without it |
   | `META_PAGE_ACCESS_TOKEN` | From step 3 — optional, used to show the sender's name instead of "Facebook enquiry" |
   | `ANTHROPIC_API_KEY` | Optional — an Anthropic API key (console.anthropic.com) turns on the one-line AI summary shown on each lead |

6. **Register the webhook** — in Messenger → Settings → Webhooks:
   - Callback URL: `https://<your-domain>/api/meta/webhook`
   - Verify token: the same `META_VERIFY_TOKEN` value
   - Subscribe to the **`messages`** field, and subscribe **every connected
     Page** to the app — the webhook itself is set once per app, not per page.
   Repeat under the Instagram product for IG messages (field `messages`).

## Auto-replies to quote requests

When a DM looks like a quote request, the site replies once per conversation
with the instant price for what they described (computed by `quoteBasket()`
from the live admin price list — the AI only maps their words onto item codes,
it never invents figures), a link to `/book`, and a line that prices are
confirmed at booking. Messages that aren't quote requests get no auto-reply.
The reply is recorded on the lead's notes as "↳ auto-reply sent".

Needs `ANTHROPIC_API_KEY` and the page's access token. Set `META_AUTO_REPLY=off`
in Vercel to switch replies off without touching anything else. Sending uses
the same `pages_messaging` permission as receiving, so the App Review below
covers both.

## The catch: App Review

While the app is in **Development mode**, Meta only delivers messages from
people with a role on the app (you, or accounts you add as testers). That's
enough to test end-to-end: message the page from your own profile and watch it
appear in `/admin/leads`.

For messages from the *public* to flow, the app needs **Advanced Access** to
`pages_messaging` (and `instagram_manage_messages` for IG) via App Review, or
to be switched to Live mode with those permissions granted. Since you own both
the app and the Page this is normally straightforward — Meta asks for a short
screen recording of the flow — but it can take a few days, and only you can
submit it.

## Testing without Meta

The webhook refuses anything unsigned, so to test locally sign a fake event
with your `META_APP_SECRET`, or just message the page from your own account
while the app is in Development mode.
