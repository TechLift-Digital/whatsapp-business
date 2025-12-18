# WhatsApp Business API Implementation Guide

This guide details how to implement `whatsapp-business-api` for three different use cases: **Direct Merchants**, **Tech Providers (ISVs)**, and **Business Solution Providers (BSPs)**.

---

## 🟢 Part 1: Direct Merchant Implementation

**Target Audience:** Businesses managing their own WhatsApp presence.
**Goal:** Send messages, handle customer replies, and manage media.

### 1. Setup & Initialization
Get your `accessToken` and `senderPhoneNumberId` from the Meta Developer Dashboard.

```typescript
import { WhatsAppBusiness, WebhookHandler } from 'whatsapp-business-api';

const whatsapp = new WhatsAppBusiness({
  accessToken: process.env.WHATSAPP_TOKEN,
  senderPhoneNumberId: process.env.PHONE_NUMBER_ID,
});
```

### 2. Sending Your First Campaign
Send a template message (required to start conversations).

```typescript
// 1. Send a Template "hello_world"
await whatsapp.sendTemplate('919999999999', 'hello_world', 'en_US');

// 2. Send Media (Image)
await whatsapp.sendImage('919999999999', {
  link: 'https://mysite.com/banner.png',
  caption: 'Welcome to our store!'
});
```

### 3. Handling Incoming Messages (Webhooks)
You need a server (e.g., Express.js) to receive messages.

```typescript
import express from 'express';
const app = express();

// Verify Endpoint (Meta calls this once to verify ownership)
app.get('/webhook', (req, res) => {
  const challenge = WebhookHandler.verifyWebhook(req.query, process.env.VERIFY_TOKEN);
  if (challenge) res.send(challenge);
  else res.sendStatus(400);
});

// Message Listener
app.post('/webhook', express.json({ type: 'application/json' }), (req, res) => {
  // 1. Validate Security
  if (!WebhookHandler.validateSignature(req.rawBody, req.headers['x-hub-signature-256'], process.env.APP_SECRET)) {
    return res.sendStatus(401);
  }

  // 2. Parse Message
  const payload = req.body;
  const message = WebhookHandler.getFirstMessage(payload);

  if (message) {
    if (message.type === 'text') {
      console.log(`From ${message.from}: ${message.text.body}`);
      // Reply to them
      whatsapp.sendText(message.from, 'Thanks for your message!');
    }
  }
  res.sendStatus(200);
});
```

---

## 🔵 Part 2: Tech Provider (ISV) Implementation

**Target Audience:** SaaS platforms offering WhatsApp as a service to other businesses.
**Goal:** Onboard clients via Embedded Signup, manage their assets (Flows, QR), and analytics.

### 1. Onboarding a Client (Embedded Signup)
When a user finishes the Meta Embedded Signup popup, your frontend receives a `short_lived_token`. You must exchange this for a permanent token.

```typescript
// 1. Exchange Token
const tokenData = await whatsapp.exchangeToken(
  process.env.APP_ID,
  process.env.APP_SECRET,
  clientProvidedShortToken
);

const clientAccessToken = tokenData.access_token;
// STORE THIS clientAccessToken SECURELY with the client's record.

// 2. Initialize Client Instance
const clientWhatsapp = new WhatsAppBusiness({
  accessToken: clientAccessToken,
  senderPhoneNumberId: clientPhoneNumberId, // You get this from the signup flow data
});
```

### 2. Registering the Client's Phone
You need to register the phone number to start sending messages.

```typescript
// Register with a 6-digit PIN of your choice
await clientWhatsapp.registerPhoneNumber(clientPhoneNumberId, '123456');
```

### 3. Creating Interactive Flows
Create a rich form ("Flow") for your client's customers (e.g., Appointment Booking).

```typescript
// 1. Create the Flow Container
const flow = await clientWhatsapp.createFlow(clientWabaId, 'Appointment Booking', ['APPOINTMENT']);

// 2. Upload the Flow Logic (JSON)
await clientWhatsapp.updateFlowJson(flow.id, {
  version: '3.1',
  screens: [
    {
      id: 'BOOKING_SCREEN',
      title: 'Select Time',
      layout: {
        type: 'SingleColumnLayout',
        children: [
           /* ... Form components ... */
        ]
      }
    }
  ]
});

// 3. Publish it
await clientWhatsapp.publishFlow(flow.id);

// 4. Send it to a user
await clientWhatsapp.sendInteractive(customerPhone, {
    type: 'flow',
    action: {
        name: 'flow',
        parameters: { flow_id: flow.id, flow_message_version: '3' }
    },
    body: { text: 'Book an appointment now!' }
});
```

---

## 🟣 Part 3: Business Solution Provider (BSP) Implementation

**Target Audience:** Top-tier partners managing billing and green ticks for thousands of clients.
**Goal:** Manage Credit Lines and Official Business Accounts (OBA).

### 1. Managing Credit Lines
You pay Meta, and your clients pay you. You must allocate credit to them.

```typescript
// 1. List your Credit Lines
const creditLines = await whatsapp.getCreditLines(process.env.BUSINESS_MANAGER_ID);
const mainLineId = creditLines.data[0].id;

// 2. Allocated Credit to a Client WABA
await whatsapp.allocateCredit(mainLineId, {
  waba_id: clientWabaId,
  amount: '1000.00', // Amount in currency
  currency: 'USD'
});
```

### 2. Requesting the Green Tick (OBA)
Submit a request on behalf of a major brand client.

```typescript
const obaResponse = await whatsapp.requestOfficialBusinessAccount(clientPhoneNumberId, {
  phone_number_id: clientPhoneNumberId,
  website_url1: 'https://major-brand.com',
  website_url2: 'https://wikipedia.org/wiki/Major_Brand' // Social proof
});

console.log(`OBA Request Status: ${obaResponse.status}`);
```

### 3. Billing & Analytics Reporting
Generate usage reports to bill your clients.

```typescript
const usageStats = await whatsapp.getAnalytics(clientWabaId, {
  start: 1704067200, // Start of month
  end: 1706745600,   // End of month
  granularity: 'MONTHLY',
  metric_types: ['COST']
});

console.log(`Total Cost for Client: ${usageStats.data[0].data_points[0].cost.total_cost}`);
```

---

## 🤖 Part 4: AI & Chatbot Implementation

**Target Audience:** Developers building automated agents (e.g., using OpenAI, Google Gemini, Anthropic).
**Goal:** Receive a user message, process it with an LLM, and send back a contextual response or take action (Function Calling).

### 1. The AI Handler Loop

This example demonstrates how to create a bidirectional loop:
`WhatsApp -> Server -> AI -> WhatsApp`.

```typescript
import { WhatsAppBusiness, WebhookHandler } from 'whatsapp-business-api';
import { generateAIResponse } from './my-ai-service'; // Your LLM wrapper

const whatsapp = new WhatsAppBusiness({
  accessToken: process.env.WHATSAPP_TOKEN,
  senderPhoneNumberId: process.env.PHONE_NUMBER_ID,
});

// Your Webhook Route
app.post('/webhook', async (req, res) => {
  // 1. Verify Signature
  if (!WebhookHandler.validateSignature(req.rawBody, req.headers['x-hub-signature-256'], process.env.APP_SECRET)) {
    return res.sendStatus(401);
  }

  const payload = req.body;
  const message = WebhookHandler.getFirstMessage(payload);

  // 2. Process Incoming Message
  if (message && message.type === 'text') {
    const userMessage = message.text.body;
    const userPhone = message.from;
    const userName = payload.entry[0].changes[0].value.contacts[0].profile.name;

    // 3. Mark as Read (Optional, provides good UX)
    await whatsapp.markMessageAsRead(message.id);

    try {
      // 4. Send to AI
      // 'systemPrompt' can include instructions like "You are a helpful assistant..."
      const aiResponse = await generateAIResponse({
        userMessage,
        history: [], // Fetch chat history from your DB based on userPhone
        systemPrompt: `You are talking to ${userName}. Be concise.`
      });

      // 5. Send AI Response back to WhatsApp
      await whatsapp.sendText(userPhone, aiResponse.text);

      // 6. Handle AI Tool Calls (e.g., AI wants to show a product)
      // If your LLM returns a function call like "show_product(id)"
      if (aiResponse.toolCalls) {
        for (const tool of aiResponse.toolCalls) {
          if (tool.name === 'send_image') {
             await whatsapp.sendImage(userPhone, { link: tool.args.url, caption: tool.args.caption });
          }
          if (tool.name === 'ask_multiple_choice') {
             await whatsapp.sendInteractive(userPhone, {
                type: 'button',
                body: { text: tool.args.question },
                action: {
                   buttons: tool.args.options.map((opt, i) => ({ type: 'reply', reply: { id: `opt_${i}`, title: opt } }))
                }
             });
          }
        }
      }
    } catch (error) {
      console.error('AI Processing Error:', error);
      await whatsapp.sendText(userPhone, "Sorry, I'm having trouble thinking right now.");
    }
  }

  res.sendStatus(200);
});
```

### 2. Handling Media from Users (Multimodal AI)

If a user sends an image, you can download it and pass it to a Vision LLM.

```typescript
if (message.type === 'image') {
  // 1. Get the URL
  const imageUrl = await whatsapp.getMediaUrl(message.image.id);
  
  // 2. Download the binary data
  const imageBuffer = await whatsapp.downloadMedia(imageUrl);

  // 3. Pass to AI (Pseudocode)
  // const description = await ai.analyzeImage(imageBuffer);
  
  await whatsapp.sendText(message.from, `I see an image! It looks like...`);
}
```

---

## 🛍️ Part 5: E-Commerce & Commerce Implementation

**Target Audience:** Retailers and Platforms selling goods directly on WhatsApp.
**Goal:** Showcase products, handle carts, collect shipping info, and process payments.

### 1. Sending Catalogs & Products
You must have a Catalog connected to your WABA in Meta Commerce Manager.

```typescript
// Send your entire catalog
await whatsapp.sendCatalog(customerPhone, "Browse our latest collection!", "THUMBNAIL_PRODUCT_ID");

// Send a curated list of products (e.g. "Best Sellers")
await whatsapp.sendProductList(
  customerPhone, 
  "Best Sellers", 
  "Check out what others are buying", 
  "YOUR_CATALOG_ID",
  [
    {
      title: "Summer Collection",
      product_items: [ { product_retailer_id: "sku_123" }, { product_retailer_id: "sku_456" } ]
    }
  ]
);
```

### 2. Handling "Add to Cart" & Orders via Webhook
When a user finishes shopping and sends their cart, your webhook receives an `order` message.

```typescript
// Inside your webhook handler
if (message.order) {
  const cartItems = message.order.product_items;
  console.log('User sent cart:', cartItems);
  
  // 1. Calculate Total in your backend
  const totalAmount = calculateTotal(cartItems); // e.g. 10000 (100.00 USD)

  // 2. Ask for Shipping Address
  await whatsapp.sendRequestAddress(message.from, "Please confirm your delivery address.");
  // Store state: WAITING_FOR_ADDRESS
}

// Handling Address Response
if (message.interactive && message.interactive.type === 'address_message') {
   const address = message.interactive.address_message; // { street: "...", city: "..." }
   
   // 3. Send "Review and Pay" Button
   await whatsapp.sendOrderDetails(message.from, {
       body: { text: "Your order is ready to pay!" },
       action: {
           name: "review_and_pay",
           parameters: {
               reference_id: "ORDER_555",
               type: "physical-goods",
               currency: "INR",
               payment_settings: {
                 type: "payment_gateway",
                 payment_gateway: {
                    type: "razorpay", 
                    configuration_name: "MyStoreConfig", 
                    bill_id: "BILL_123" 
                 }
               },
               total_amount: { value: 11000, offset: 100 }, // Subtotal + Tax + Shipping
               order: {
                   status: "pending",
                   subtotal: { value: 10000, offset: 100 },
                   tax: { value: 500, offset: 100, description: "GST (5%)" },
                   shipping: { value: 500, offset: 100, description: "Express Delivery" },
                   items: [ 
                       { retailer_id: "sku_123", name: "T-Shirt", amount: { value: 5000, offset: 100 }, quantity: 2 } 
                   ]
               }
           }
       }
   });
}
```

---

## 📚 Part 6: Message Template Library Management

**Target Audience:** Businesses that need to programmatically manage their message templates.
**Goal:** Create, Search, Update, and Delete templates automatically.

### 1. Searching for Templates
You can filter templates by name or paginate through them.

```typescript
// 1. Get all templates (paginated)
const templates = await whatsapp.getTemplates(wabaId);

// 2. Filter by Name
const welcomeTemplates = await whatsapp.getTemplates(wabaId, 10, undefined, 'welcome_message');
const myTemplate = welcomeTemplates.data[0];
console.log(`Template ID: ${myTemplate.id}, Status: ${myTemplate.status}`);
```

### 2. Creating a Template
Create a template complying with Meta's structure (Header, Body, Footer, Buttons).

```typescript
await whatsapp.createTemplate(wabaId, {
    name: "seasonal_promo_v2",
    category: "MARKETING",
    language: "en_US",
    components: [
        {
            type: "HEADER",
            format: "IMAGE",
            example: { header_handle: ["https://example.com/demo.jpg"] }
        },
        {
            type: "BODY",
            text: "Hi {{1}}, check out our new summer collection!",
            example: { body_text: [["John"]] }
        },
        {
            type: "BUTTONS",
            buttons: [
                { type: "URL", text: "Shop Now", url: "https://myshop.com" },
                { type: "QUICK_REPLY", text: "Stop Promotions" }
            ]
        }
    ]
});
```

### 3. Updating an Existing Template
You can edit templates that are Approved (limited edits) or Rejected.

```typescript
// Edit the body text
await whatsapp.updateTemplate('TEMPLATE_ID', {
    components: [
        {
            type: "BODY",
            text: "Hi {{1}}, our summer collection is fast selling! Grab yours now.",
            example: { body_text: [["Jane"]] }
        }
    ]
});
```

### 4. Deleting a Template
Clean up unused templates.

```typescript
await whatsapp.deleteTemplate(wabaId, 'seasonal_promo_v2');
```

---

## ❄️ Part 7: Conversational Automation (Ice Breakers & Commands)

**Target Audience:** Chatbots needing better discoverability.
**Goal:** Set up visual shortcuts for users starting a chat.

### 1. Ice Breakers
Quick tap buttons that appear when a new user opens a chat.

```typescript
await whatsapp.setIceBreakers(phoneNumberId, [
    { question: "Where is my order?" },
    { question: "Talk to support" },
    { question: "View Catalog" }
]);
```

### 2. Commands (Known as "Slash Commands")
These appear in the menu or when typing `/`.

```typescript
await whatsapp.setCommands(phoneNumberId, [
    { command_name: "help", description: "Get assistance" },
    { command_name: "status", description: "Check server status" },
    { command_name: "reset", description: "Reset conversation flow" }
]);
```




