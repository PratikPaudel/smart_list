# 🚀 Smart List - AI-Powered Product Listing Generator

Smart List is an AI-powered application that helps e-commerce sellers create compelling product descriptions by simply uploading a photo. Using Google Gemini API, it analyzes product images and generates SEO-optimized titles and descriptions.

![Smart List Demo](public/smart_list.gif)

## ✨ Features

- **Smart Image Analysis** - AI-powered product recognition and analysis
- **Lightning Fast** - Generate listings in under 10 seconds
- **Mobile Responsive** - Works seamlessly on all devices
- **Secure & Private** - User data protection with Row Level Security
- **Dashboard Management** - Organize and manage all your listings
- **Professional UI** - Modern, intuitive interface with dark mode support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase + Google Cloud Vision
- **Database**: PostgreSQL with Row Level Security
- **Storage**: Supabase Storage with signed URLs
- **Deployment**: Vercel

## 🔧 Quick Start

1. **Clone and install**
```bash
git clone https://github.com/pratikpaudel/smart_list.git
cd smart_list
npm install
```

2. **Set up environment variables**
```bash
# Create .env.local with:
YOUR_FAV_LLM_KEY
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)**

## 🎯 How It Works

1. **Upload** a product photo
2. **AI analyzes** the image using Google Vision API
3. **Generate** SEO-optimized title and description
4. **Edit & save** your listing
5. **Manage** all listings from your dashboard
