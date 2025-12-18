# WhatsApp Business API Wrapper

A complete, typed Node.js wrapper for the WhatsApp Business API, supporting Messaging, Media, Templates, Analytics, Webhooks, Flows, E-Commerce, QR Codes, and BSP/Partner Features.

## Installation

```bash
npm install whatsapp-business-api
# or
pnpm add whatsapp-business-api
```

## Usage

### Initialization

```typescript
import { WhatsAppBusiness } from 'whatsapp-business-api';

const whatsapp = new WhatsAppBusiness({
  accessToken: 'YOUR_ACCESS_TOKEN',
  senderPhoneNumberId: 'YOUR_PHONE_NUMBER_ID',
});
```

### Messaging & E-Commerce

#### Text & Templates
```typescript
await whatsapp.sendText('1234567890', 'Hello!');
```

#### E-Commerce & Catalogs
```typescript
// 1. Send Product Catalog
await whatsapp.sendCatalog('1234567890', 'Check out our 2024 collection', 'THUMBNAIL_PRODUCT_ID');

// 2. Send Request for Address
await whatsapp.sendRequestAddress('1234567890', 'Please provide your shipping address');

// 3. Send Order Details (Review & Pay)
await whatsapp.sendOrderDetails('1234567890', {
    header: { type: 'image', image: { link: 'https://ex.com/invoice_banner.jpg'} },
    body: { text: 'Your order is ready!' },
    action: {
        name: 'review_and_pay',
        parameters: {
            reference_id: 'ORDER_123',
            type: 'physical-goods',
            payment_settings: {
                type: 'payment_gateway',
                payment_gateway: {
                    type: 'razorpay',
                    configuration_name: 'MyShop',
                    bill_id: 'BILL_001'
                }
            },
            currency: 'INR',
            total_amount: { value: 10000, offset: 100 }, // 100.00
            order: {
                status: 'pending',
                items: [ { retailer_id: 'P01', name: 'Shirt', amount: { value: 5000, offset: 100 }, quantity: 2 } ],
                subtotal: { value: 10000, offset: 100 }
            }
        }
    }
});
```

### Management Features

#### QR Codes & Flows
```typescript
// Create QR
const qr = await whatsapp.createQRCode('PHONE_ID', 'Start Chat');

// Create Flow
const flow = await whatsapp.createFlow('WABA_ID', 'Survey', ['SURVEY']);
```

### BSP / Partner Features

```typescript
// Allocate Credit
await whatsapp.allocateCredit('CREDIT_LINE_ID', { waba_id: 'WABA_ID', amount: '100', currency: 'USD' });

// Request Green Tick
await whatsapp.requestOfficialBusinessAccount('PHONE_ID', { phone_number_id: 'PHONE_ID', website_url1: 'https://brand.com' });
```

## Features List

- **Messaging**: Text, Templates, Media, Location, Interactive (Buttons, Lists).
- **E-Commerce**:
  - **Catalogs**: Send single product, multi-product list, full catalog.
  - **Orders**: Request Address, Order Details (Review & Pay), Order Status.
- **Management**: Flows, QR Codes, Templates (Create, Edit, Search), Analytics, Business Profile, Ice Breakers, Commands.
- **BSP**: Credit Lines, OBA Requests (Green Tick), Embedded Signup Support.

## License

ISC
