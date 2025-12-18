export interface WhatsAppConfig {
  accessToken: string;
  senderPhoneNumberId: string;
  businessAccountId?: string;
  apiVersion?: string;
  baseUrl?: string;
}

export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'location' | 'contacts' | 'interactive' | 'template' | 'reaction';

export interface BaseMessage {
  messaging_product: 'whatsapp';
  recipient_type?: 'individual';
  to: string;
  type: MessageType;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

export interface MediaObject {
  id?: string;
  link?: string;
  caption?: string;
  filename?: string; // For documents
  provider?: string; // For stickers
}

export interface MediaMessage extends BaseMessage {
  type: 'image' | 'audio' | 'video' | 'document' | 'sticker';
  image?: MediaObject;
  audio?: MediaObject;
  video?: MediaObject;
  document?: MediaObject;
  sticker?: MediaObject;
}

export interface LocationMessage extends BaseMessage {
  type: 'location';
  location: {
    longitude: number;
    latitude: number;
    name?: string;
    address?: string;
  };
}

export interface ContactName {
  formatted_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
}

export interface ContactPhone {
  phone: string;
  type?: 'CELL' | 'MAIN' | 'IPHONE' | 'HOME' | 'WORK';
  wa_id?: string;
}

export interface ContactObject {
  name: ContactName;
  phones?: ContactPhone[];
  [key: string]: any; // Allow other fields like emails, urls, etc.
}

export interface ContactsMessage extends BaseMessage {
  type: 'contacts';
  contacts: ContactObject[];
}

export interface InteractiveAction {
  button?: string;
  buttons?: {
    type: 'reply';
    reply: {
      id: string;
      title: string;
    };
  }[];
  catalog_id?: string;
  product_retailer_id?: string;
  sections?: {
    title?: string;
    product_items?: {
      product_retailer_id: string;
    }[];
    rows?: {
      id: string;
      title: string;
      description?: string;
    }[];
  }[];
  name?: string;
  parameters?: any; // Flexible parameters for flows, cta_url, etc.
}

export interface InteractiveMessage extends BaseMessage {
  type: 'interactive';
  interactive: {
    type: 'button' | 'list' | 'product' | 'product_list' | 'catalog_message' | 'flow' | 'cta_url' | 'address_message' | string;
    header?: {
      type: 'text' | 'image' | 'video' | 'document';
      text?: string;
      image?: MediaObject;
      video?: MediaObject;
      document?: MediaObject;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: InteractiveAction;
  };
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  sub_type?: 'url' | 'quick_reply'; // For buttons
  index?: string; // For buttons
  parameters: {
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video' | 'payload';
    text?: string;
    currency?: any;
    date_time?: any;
    image?: MediaObject;
    document?: MediaObject;
    video?: MediaObject;
    payload?: string;
  }[];
}

export interface TemplateMessage extends BaseMessage {
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: TemplateComponent[];
  };
}

export interface ReactionMessage extends BaseMessage {
  type: 'reaction';
  reaction: {
    message_id: string;
    emoji: string;
  };
}

export interface SendMessageResponse {
  messaging_product: string;
  contacts: {
    input: string;
    wa_id: string;
  }[];
  messages: {
    id: string;
  }[];
}

export interface UploadMediaResponse {
  id: string;
}

// Partner / Tech Provider Types

export interface TokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface DebugTokenResponse {
  data: {
    app_id: string;
    type: string;
    application: string;
    data_access_expires_at: number;
    expires_at: number;
    is_valid: boolean;
    scopes: string[];
    user_id: string;
    granular_scopes: {
      scope: string;
    }[];
  };
}

export interface WabaPhoneNumber {
  verified_name: string;
  code_verification_status: string;
  display_phone_number: string;
  quality_rating: string;
  id: string;
}

export interface WabaPhoneNumbersResponse {
  data: WabaPhoneNumber[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface BusinessProfile {
  about: string;
  address: string;
  description: string;
  email: string;
  profile_picture_url: string;
  websites: string[];
  vertical: string;
}

export interface BusinessProfileResponse {
  data: BusinessProfile[];
}

export interface RegisterPhoneRequest {
  messaging_product: 'whatsapp';
  pin: string;
}

export interface RegisterPhoneResponse {
  success: boolean;
}

// Webhook Types

export interface WebhookEntry {
  id: string;
  changes: {
    value: {
      messaging_product: 'whatsapp';
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: {
        profile: {
          name: string;
        };
        wa_id: string;
      }[];
      messages?: {
        from: string;
        id: string;
        timestamp: string;
        text?: {
          body: string;
        };
        type: MessageType;
        order?: {
          catalog_id: string;
          text?: string;
          product_items: {
            product_retailer_id: string;
            quantity: string;
            item_price: string;
            currency: string;
          }[];
        };
        [key: string]: any; // flexible for other message types
      }[];
      statuses?: {
        id: string;
        status: 'sent' | 'delivered' | 'read' | 'failed';
        timestamp: string;
        recipient_id: string;
        conversation?: {
          id: string;
          origin: {
            type: string;
          };
        };
        pricing?: {
          billable: boolean;
          pricing_model: string;
          category: string;
        };
      }[];
    };
    field: string;
  }[];
}

export interface WebhookPayload {
  object: 'whatsapp_business_account';
  entry: WebhookEntry[];
}

// Commerce / Catalog Types

export interface Product {
    id: string;
    retailer_id: string;
    name: string;
    description: string;
    availability: 'in stock' | 'out of stock';
    condition: 'new' | 'refurbished' | 'used';
    price: string; // e.g. "100 USD"
    currency: string;
    image_url: string;
    brand?: string;
    category?: string;
    url?: string; // Product link
}

export interface ProductRequest {
    retailer_id: string;
    name: string;
    description: string;
    availability: 'in stock' | 'out of stock';
    condition: 'new' | 'refurbished' | 'used';
    price: number; // e.g. 10000 (cents)
    currency: string;
    image_url: string;
    brand?: string;
    category?: string;
    url?: string;
}

export interface ProductResponse {
    id: string;
    retailer_id: string;
}

export interface CatalogListResponse {
    data: Product[];
    paging?: {
        cursors: {
            before: string;
            after: string;
        };
        next?: string;
        previous?: string;
    };
}

// E-Commerce Types

export interface RequestAddressMessage extends BaseMessage {
  type: 'interactive';
  interactive: {
    type: 'address_message';
    body: {
      text: string;
    };
    action: {
      name: 'address_message';
      parameters: {
        country: string; // ISO 3166-1 alpha-2 country code
        values?: any; // Start values if needed
      };
    };
  };
}

export interface ProductItem {
  product_retailer_id: string;
}

export interface ProductSection {
  title?: string;
  product_items: ProductItem[];
}

export interface SendCatalogMessage extends BaseMessage {
  type: 'interactive';
  interactive: {
    type: 'catalog_message';
    body: {
      text: string;
    };
    action: {
      name: 'catalog_message';
      parameters: {
        thumbnail_product_retailer_id?: string;
      };
    };
    footer?: {
      text: string;
    };
  };
}

export interface SendProductListMessage extends BaseMessage {
  type: 'interactive';
  interactive: {
    type: 'product_list';
    header: {
      type: 'text';
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      catalog_id: string;
      sections: ProductSection[];
    };
  };
}

// Order Status / Review and Pay
export interface OrderDetailsMessage extends BaseMessage {
  type: 'interactive';
  interactive: {
    type: 'order_details';
    header?: {
       type: 'image';
       image: MediaObject;
    };
    body: {
        text: string;
    };
    footer?: {
        text: string;
    };
    action: {
        name: 'review_and_pay';
        parameters: {
            reference_id: string;
            type: 'digital-goods' | 'physical-goods';
            payment_settings: {
              type: 'payment_gateway';
              payment_gateway: {
                type: 'billdesk' | 'razorpay' | 'payu' | 'zaakpay' | 'stripe'; 
                configuration_name: string;
                bill_id: string;
              }
            };
            currency: string;
            total_amount: {
                value: number;
                offset: number;
            };
            order: {
                status: 'pending' | 'processing' | 'partially_shipped' | 'shipped' | 'completed' | 'canceled';
                items: {
                    retailer_id: string;
                    name: string;
                    amount: {
                        value: number;
                        offset: number;
                    };
                    quantity: number;
                    sale_amount?: {
                        value: number;
                        offset: number;
                    };
                }[];
                subtotal: {
                     value: number;
                     offset: number;
                };
                tax?: {
                     value: number;
                     offset: number;
                     description?: string;
                };
                shipping?: {
                     value: number;
                     offset: number;
                     description?: string;
                };
                discount?: {
                     value: number;
                     offset: number;
                     description?: string;
                     discount_program_name?: string;
                };
                expiration?: {
                    timestamp: string;
                    description?: string;
                };
            }
        }
    }
  }
}

// BSP Types

export interface CreditLine {
  id: string;
  currency: string;
  type: string;
  balance: {
    amount: string;
    currency: string;
  };
  estimated_balance: {
    amount: string;
    currency: string;
  };
}

export interface AllocationConfig {
  waba_id: string;
  amount: string;
  currency: string;
}

export interface OBARequest {
  phone_number_id: string;
  website_url1: string;
  website_url2?: string;
}

export interface OBAResponse {
  id: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'REVOKED';
}

// QR Code Types

export interface QRCodeRequest {
  prefilled_message: string;
  image_format?: 'SVG' | 'PNG';
}

export interface QRCodeResponse {
  code: string;
  prefilled_message: string;
  deep_link_url: string;
  qr_image_url: string;
}

export interface QRCodeListResponse {
  data: QRCodeResponse[];
}

// Conversational Automation Types

export interface IceBreaker {
  question: string;
}

export interface Command {
  command_name: string;
  description: string;
}

// Flow Types

export interface FlowJSON {
  version: string;
  screens: any[];
}

export interface CreateFlowRequest {
  name: string;
  categories: string[];
}

export interface CreateFlowResponse {
  id: string;
}

export interface FlowEntity {
  id: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';
  categories: string[];
  validation_errors?: any[];
}

export interface GetFlowsResponse {
  data: FlowEntity[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

// Template Management Types

export type TemplateCategory = 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';

export interface CreateTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
  text?: string;
  buttons?: {
    type: 'QUICK_REPLY' | 'PHONE_NUMBER' | 'URL' | 'COPY_CODE' | 'FLOW';
    text: string;
    phone_number?: string;
    url?: string;
    example?: string[];
    flow_id?: string;
    flow_action?: string;
    navigate_screen?: string;
  }[];
  example?: {
    header_handle?: string[];
    header_text?: string[];
    body_text?: string[][];
  };
}

export interface CreateTemplateRequest {
  name: string;
  category: TemplateCategory;
  allow_category_change?: boolean;
  language: string;
  components: CreateTemplateComponent[];
}

export interface CreateTemplateResponse {
  id: string;
  status: string;
  category: string;
}

export interface TemplateEntity {
  id: string;
  name: string;
  status: string;
  category: TemplateCategory;
  language: string;
  components: any[]; // simplified for listing
}

export interface GetTemplatesResponse {
  data: TemplateEntity[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

// Analytics Types

export interface AnalyticsParams {
  start: number; // Unix timestamp
  end: number; // Unix timestamp
  granularity: 'DAILY' | 'MONTHLY' | 'HALF_HOUR';
  metric_types?: ('COST' | 'CONVERSATION' | 'PHONE_CALL')[];
  phone_numbers?: string[]; // WABA phone numbers
}

export interface AnalyticsDataPoint {
  start: number;
  end: number;
  cost?: {
    total_cost: number;
    currency: string;
  };
  conversation?: {
    free_entry_point: number;
    free_tier: number;
    marketing: number;
    utility: number;
    service: number;
    authentication: number;
    total: number;
  };
}

export interface AnalyticsResponse {
  data: {
    data_points: AnalyticsDataPoint[];
  }[];
}


