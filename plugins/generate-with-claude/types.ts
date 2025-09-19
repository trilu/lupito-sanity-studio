export interface GenerationFormData {
  topic: string;
  category: string;
  keywords: string[];
  languages: string[];
  tone: 'professional' | 'casual' | 'friendly';
  length: 'short' | 'medium' | 'long';
  includeSeo: boolean;
  imageSettings: {
    featuredImage: boolean;
    imageKeywords: string;
    includeInlineImages: boolean;
  };
}

export interface LocaleString {
  ro?: string;
  en?: string;
  pl?: string;
  hu?: string;
  cs?: string;
}

export interface LocaleText {
  ro?: string;
  en?: string;
  pl?: string;
  hu?: string;
  cs?: string;
}

export interface LocaleBlockContent {
  ro?: any[];
  en?: any[];
  pl?: any[];
  hu?: any[];
  cs?: any[];
}

export interface GeneratedContent {
  title: LocaleString;
  excerpt: LocaleText;
  content: LocaleBlockContent;
  featuredImage?: {
    url: string;
    alt: string;
    photographer: string;
    photographerUrl: string;
    unsplashId: string;
  };
  seo?: {
    metaTitle: LocaleString;
    metaDescription: LocaleText;
  };
  tags: string[];
}

export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
    full: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
}

export type GenerationState =
  | 'idle'
  | 'validating'
  | 'searching-images'
  | 'generating'
  | 'formatting'
  | 'saving'
  | 'complete'
  | 'error';

export interface GenerationProgress {
  state: GenerationState;
  currentLanguage?: string;
  completedLanguages: string[];
  message?: string;
  error?: string;
  estimatedTimeRemaining?: number;
}

export const SUPPORTED_LANGUAGES = [
  { value: 'ro', label: 'Romanian' },
  { value: 'en', label: 'English' },
  { value: 'pl', label: 'Polish' },
  { value: 'hu', label: 'Hungarian' },
  { value: 'cs', label: 'Czech' }
] as const;

export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' }
] as const;

export const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (300-500 words)' },
  { value: 'medium', label: 'Medium (500-800 words)' },
  { value: 'long', label: 'Long (800-1200 words)' }
] as const;