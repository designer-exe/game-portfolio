/**
 * Contact Form Backend Configuration
 * Isolated endpoint configuration reading from VITE_CONTACT_FORM_ENDPOINT
 * Allows changing destination endpoint without touching UI code.
 */
export const CONTACT_CONFIG = {
    endpoint: import.meta.env.VITE_CONTACT_FORM_ENDPOINT || 'https://formspree.io/f/xbjnqylv',
    recipientEmail: 'officialanimesh28@gmail.com'
}
