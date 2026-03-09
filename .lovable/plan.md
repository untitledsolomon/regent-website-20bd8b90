

## Generate Favicon & OG Image with AI

### Approach

Use the Lovable AI image generation model (`google/gemini-3-pro-image-preview`) via an edge function to generate two images:

1. **Favicon** — A minimal "R" logomark with a period/dot accent, matching Regent's primary color (indigo/blue, HSL 243 76% 59% ≈ `#4F46E5`). White or light background, clean geometric style, suitable at 192×192px and down to 32×32px.

2. **OG Image** (1200×630) — A branded social card with "Regent." text, tagline "Infrastructure for the Next Generation of Systems", dark/indigo background with subtle gradient, clean typography.

### Implementation

1. **Create an edge function** `generate-brand-assets` that calls the Lovable AI image generation endpoint twice (favicon + OG image), uploads results to Supabase Storage, and returns public URLs.

2. **Create a simple admin page/button** or one-off script page that triggers the generation, downloads the results, and saves them to `public/favicon.png` and `public/og-image.png`.

Actually, simpler approach: Since we can generate images via the AI gateway and store them in Supabase Storage, we'll:

1. **Create edge function** `generate-brand-assets` that generates both images and uploads to a `brand-assets` storage bucket
2. **Create a storage bucket** `brand-assets` (public)
3. **Update `index.html`** to reference the storage URLs for favicon and OG image
4. Alternatively, generate the images and save them directly as static files

### Revised simpler approach

The most practical path:
- Create an edge function that generates both images via `google/gemini-3-pro-image-preview`
- Store them in a public storage bucket
- Update `index.html` to use the storage bucket URLs

### Files to create
- `supabase/functions/generate-brand-assets/index.ts` — generates favicon + OG image, uploads to storage

### Files to edit  
- `index.html` — update favicon and OG image references to storage URLs

### Database changes
- Create `brand-assets` storage bucket (public)

### Execution order
1. Create storage bucket via migration
2. Create and deploy edge function
3. Call the function to generate + upload images
4. Update `index.html` with the public URLs

