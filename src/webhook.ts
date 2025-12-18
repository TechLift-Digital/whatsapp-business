import { WebhookPayload } from './types';
import * as crypto from 'crypto';

export class WebhookHandler {
  /**
   * Verifies the webhook verification challenge from Meta.
   * @param query The query parameters from the request (req.query).
   * @param verifyToken Your custom verification token.
   * @returns The challenge string if verification succeeds, or null if it fails.
   */
  static verifyWebhook(query: any, verifyToken: string): string | null {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        return challenge;
      }
    }
    return null;
  }

  /**
   * Validates the X-Hub-Signature-256 header to ensure the request came from Meta.
   * @param payload The raw request body (string or buffer).
   * @param signature The X-Hub-Signature-256 header value.
   * @param appSecret Your Meta App Secret.
   * @returns True if the signature is valid, false otherwise.
   */
  static validateSignature(payload: string | Buffer, signature: string, appSecret: string): boolean {
    if (!signature) return false;
    
    // Signature format: 'sha256=...'
    const parts = signature.split('=');
    if (parts.length !== 2) return false;
    
    const sigHash = parts[1];
    
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(payload);
    const digest = hmac.digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    const digestRead = Buffer.from(digest);
    const sigRead = Buffer.from(sigHash);
    
    if (digestRead.length !== sigRead.length) return false;
    
    return crypto.timingSafeEqual(digestRead, sigRead);
  }

  /**
   * Helper to extract the first message from a webhook payload, if present.
   * This simplifies identifying the type of incoming event.
   * @param payload The parsed JSON body of the webhook.
   */
  static getFirstMessage(payload: WebhookPayload) {
    if (
      payload.entry &&
      payload.entry[0].changes &&
      payload.entry[0].changes[0].value.messages &&
      payload.entry[0].changes[0].value.messages[0]
    ) {
      return payload.entry[0].changes[0].value.messages[0];
    }
    return null;
  }

  /**
   * Helper to extract the status update from a webhook payload, if present.
   * @param payload The parsed JSON body of the webhook.
   */
  static getFirstStatus(payload: WebhookPayload) {
    if (
      payload.entry &&
      payload.entry[0].changes &&
      payload.entry[0].changes[0].value.statuses &&
      payload.entry[0].changes[0].value.statuses[0]
    ) {
      return payload.entry[0].changes[0].value.statuses[0];
    }
    return null;
  }
}
