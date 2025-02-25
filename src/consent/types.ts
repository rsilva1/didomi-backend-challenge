export const CONSENT_TYPES = ["email_notifications", "sms_notifications"] as const;

export type ConsentTypes = typeof CONSENT_TYPES[number];

export type Consent = {
  id: ConsentTypes;
  enabled: boolean;
};

export type UserConsent = {
  id: string;
  email: string;
  consents: Consent[];
}
