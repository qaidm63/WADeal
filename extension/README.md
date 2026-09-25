# WADeal: AI Sales Assistant & Quick Reply for WhatsApp Web
> Chrome Web Store Manifest V3 Extension & Companion AI Backend

## 🚀 Quick Start: How to Install in Google Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select this `extension` folder.
5. Open [WhatsApp Web](https://web.whatsapp.com/).
6. Open any active chat conversation:
   - Notice the **⚡ WADeal Reply** floating toolbar right above the message input box.
   - Look at the top chat header to use the **Local Lead Status Tagger** (`🔥 Hot / Ready to Buy`, `⏳ Follow-up Required`, `✅ Deal Won`).
   - Click the extension icon in your Chrome toolbar to edit your **Micro-Business Context Engine** (pricing, shipping, warranty terms).

## 🛠️ Companion Cloud Backend
The extension connects by default to:
`http://localhost:3000` (or your deployed cloud backend URL).

Endpoints:
- `POST /api/v1/generate-deal-response`
- `POST /api/v1/verify-license`
- `GET /api/v1/user-credits`

## 🔑 Test License Keys
For testing Whop verification:
- `WADEAL-LTD-LAUNCH50` (Lifetime Deal - Unlimited)
- `WADEAL-PRO-MONTHLY99` (Monthly SaaS)
