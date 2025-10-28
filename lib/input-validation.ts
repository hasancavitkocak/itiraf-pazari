import { z } from 'zod';

// Genel güvenlik şemaları
const createSecureStringSchema = (maxLength: number = 2000) => z.string()
  .min(1)
  .max(maxLength)
  .refine((val) => {
    // SQL injection pattern'larini kontrol et
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|\/\*|\*\/|;|'|"|`)/,
      /(\bOR\b|\bAND\b).*[=<>]/i
    ];
    
    return !sqlPatterns.some(pattern => pattern.test(val));
  }, 'Guvenlik nedeniyle gecersiz karakter');

export const secureStringSchema = createSecureStringSchema();

export const emailSchema = z.string().email('Geçerli email adresi girin');

export const urlSchema = z.string().url('Geçerli URL girin').refine((val) => {
  // Sadece HTTPS URL'lerine izin ver
  return val.startsWith('https://');
}, 'Sadece HTTPS URL\'leri kabul edilir');

export const idSchema = z.string().uuid('Geçerli ID formatı gerekli');

// Site ayarları için özel şema
export const siteSettingsSchema = z.object({
  site_logo: z.object({
    value: z.union([z.string().url(), z.literal('')]),
    type: z.literal('image')
  }).optional(),
  site_name: z.object({
    value: createSecureStringSchema(100),
    type: z.literal('text')
  }).optional(),
  site_description: z.object({
    value: createSecureStringSchema(500),
    type: z.literal('text')
  }).optional(),
  contact_email: z.object({
    value: emailSchema,
    type: z.literal('text')
  }).optional(),
  maintenance_mode: z.object({
    value: z.enum(['true', 'false']),
    type: z.literal('boolean')
  }).optional()
});

// Post validation
export const postSchema = z.object({
  title: createSecureStringSchema(200),
  content: createSecureStringSchema(5000),
  category_id: idSchema,
  city: createSecureStringSchema(100).optional(),
  district: createSecureStringSchema(100).optional()
});

// Comment validation
export const commentSchema = z.object({
  content: createSecureStringSchema(1000),
  post_id: idSchema
});

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().min(1).max(255).refine((val) => {
    // Dosya adı güvenlik kontrolü
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Windows invalid chars
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i  // Windows reserved names
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(val));
  }, 'Geçersiz dosya adı'),
  
  type: z.enum([
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/svg+xml'
  ]),
  
  size: z.number().max(2 * 1024 * 1024, 'Dosya boyutu 2MB\'dan küçük olmalı')
});

// Validation helper fonksiyonu
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: 'Validation hatası' };
  }
}

// XSS koruması için HTML sanitizer
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// URL güvenlik kontrolü
export function isSecureURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Sadece HTTPS ve güvenli protokollere izin ver
    if (!['https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Localhost ve private IP'leri engelle
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}