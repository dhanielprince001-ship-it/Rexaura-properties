# Rexaura Properties

Responsive React + Vite luxury property website with:
- Mobile navigation and CSS media queries
- Hash-routed pages: Home, Listings (`#/listings`, filters, sort, pagination) and Property Detail (`#/property/1`) with a tour-request form
- Property search and location filter
- Property cards and save-heart interaction
- Contact links for `rexgroups.uk@gmail.com` and `08033564331`
- Supabase email/password sign-up and login
- User profile picture upload to Supabase Storage

## 1. Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL Vite prints in the terminal.

## 2. Connect Supabase

1. Create a project at https://supabase.com.
2. In Project Settings → API, copy the Project URL and the publishable key (or legacy anon key).
3. Copy `.env.example` to `.env`, then fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. In Authentication → URL Configuration, set your deployed website URL as the Site URL and add it to Redirect URLs if needed.
5. Open SQL Editor and run `supabase/setup.sql`.
6. Open Storage and create a bucket called `avatars`. Make it Public to allow avatar images to display using public URLs. The SQL includes policies that restrict uploads/updates to a user's own folder.
7. For production, keep the Supabase publishable/anon key in frontend environment variables only. **Never put the Supabase service-role/secret key in frontend code.**

## 3. Deploy to Netlify

1. Upload/push this project to a GitHub repository.
2. In Netlify, import the repository.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. In Site configuration → Environment variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Redeploy after adding the environment variables.

## Notes

- If Supabase is not configured, the site still displays but login and profile photo uploads show a setup message.
- Property photos are sample visual assets. Replace the files in `public/images` with your own licensed property photos if desired.
- Property names, descriptions and prices are sample content and should be updated to match actual listings.

- Edit all listings in `src/data.js`. Listing photos were cropped from the design mockup, so replace the `listing-*.jpg` and `detail-*.jpg` files in `public/images` with your own high-resolution photos.
- Saved properties persist in the browser. The tour-request form opens the visitor's email app addressed to rexgroups.uk@gmail.com (no backend needed).
