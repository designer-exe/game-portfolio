/**
 * Contact Form Backend Configuration
 * Configurable Formspree endpoint reading from VITE_FORMSPREE_ENDPOINT or VITE_CONTACT_FORM_ENDPOINT
 * Allows changing destination endpoint without touching UI code.
 */
export const CONTACT_CONFIG = {
    endpoint: import.meta.env.VITE_FORMSPREE_ENDPOINT || import.meta.env.VITE_CONTACT_FORM_ENDPOINT || '',
    recipientEmail: 'officialanimesh28@gmail.com'
}

