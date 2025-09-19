# Lupito Sanity Studio

Content Management System for the Lupito pet care platform.

## Features

- 🧠 **AI-Powered Content Generation** - Built-in Sanity AI Assist for automatic content creation
- 🌍 **Multi-Language Support** - Content management for Romanian, English, Polish, Hungarian, and Czech
- 📱 **Responsive Content Management** - Manage blog posts, categories, and website content
- 🔍 **SEO Optimization** - Built-in SEO fields and AI-generated meta content

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Sanity account with Growth plan or higher (for AI Assist)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Sanity project details
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3333](http://localhost:3333) in your browser

### Deployment

Deploy to Sanity hosting:
```bash
npm run deploy
```

This will deploy your studio to `https://yourproject.sanity.studio/`

## AI Content Generation

This studio includes Sanity AI Assist for intelligent content generation:

### Using AI Assist

1. **Look for the ✨ sparkle icon** in document headers and fields
2. **Enable AI Assist** on first use
3. **Generate content** with context-aware AI
4. **Translate content** to multiple languages automatically

### Features Available

- **Document-level generation** - Create entire blog posts
- **Field-level assistance** - Generate titles, excerpts, meta descriptions
- **Multi-language translation** - Automatic translation between supported languages
- **SEO optimization** - AI-generated meta titles and descriptions
- **Image integration** - AI-generated alt text and descriptions

## Content Types

- **Blog Posts** - Multi-language articles with SEO and media
- **Categories** - Organized content categorization
- **Pages** - Static website pages

## Project Structure

```
├── schemas/          # Content type definitions
├── plugins/          # Custom studio plugins
├── sanity.config.ts  # Main studio configuration
└── sanity.cli.ts     # CLI configuration
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Dataset name (usually 'production')
- `SANITY_API_TOKEN` - API token for deployments

## License

Private project for Lupito platform.