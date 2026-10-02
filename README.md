# Concorde sports — marketing website

Static marketing site for **Concorde sports**, the Lebanese sports app (tennis and padel first).
Plain HTML + CSS + a little vanilla JS. No build step, no frameworks, no npm. It can be served as-is by GitHub Pages.

## Files

```
index.html          Home page (hero, sports, players, Kids Academy, coaches, clubs, pricing, FAQ)
privacy.html        Privacy Policy        (TEMPLATE – have a lawyer review it)
terms.html          Terms of Service      (TEMPLATE – have a lawyer review it)
refund.html         Payments & Refunds    (TEMPLATE – have a lawyer review it)
404.html            Not-found page (GitHub Pages uses it automatically)
assets/logo.svg     The logo (used in every header and footer)
assets/favicon.svg  Browser tab icon
assets/css/styles.css
assets/js/main.js   Mobile menu, header shadow, reveal-on-scroll, footer year
assets/img/         og-image.png (social share preview), icon-192/512.png, apple-touch-icon.png
site.webmanifest    App manifest (name, colours, icons)
robots.txt, sitemap.xml
.nojekyll           Tells GitHub Pages to serve files as-is
```

All links are relative, so the site works at a domain root (`https://concordesports.com/`)
and under a GitHub Pages project path (`https://<user>.github.io/<repo-name>/`).

## Preview locally

Easiest: double-click `index.html` (opens from `file://`; everything works except that the 404 page is only exercised on a server).

With a local server (closer to GitHub Pages), from this folder in PowerShell:

```powershell
# If Python is installed
python -m http.server 8080
# then open http://localhost:8080/
```

Any static server works (VS Code "Live Server" extension, `npx serve`, etc.).

## Deploy on GitHub Pages

1. Create a GitHub repository (for example `concorde-website`) and push the contents of this folder to the `main` branch (the files must be at the repository root, including `.nojekyll`).
2. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
3. After a minute the site is live at `https://<user>.github.io/<repo-name>/`.
4. Custom domain (optional): in **Settings → Pages → Custom domain**, enter your domain, then add the DNS records GitHub shows you. Tick **Enforce HTTPS**. GitHub creates a `CNAME` file in the repo for you.

## Replace the placeholder domain

`https://concordesports.example` is a placeholder. When you have the real domain, search and replace it in:

- `index.html`, `privacy.html`, `terms.html`, `refund.html` (canonical, Open Graph and Twitter tags)
- `sitemap.xml`
- `robots.txt`

Social networks need absolute URLs for `og:image`, so the share preview only works once the real domain is in place.

## Logo

- `assets/brand/concorde-logo-original.jpg`: the logo as supplied (white "C." with the tennis ball, on navy).
- `assets/logo-mark.svg`: the same mark redrawn as a vector, transparent, for dark backgrounds. The header and footer show it
  next to the "Concorde sports" wordmark (live text in the site font, see `.logo` in `styles.css`).
- `assets/logo.svg`: the square logo on navy as a vector (profile pictures, documents).
- `assets/favicon.svg`, `assets/img/icon-*.png`, `apple-touch-icon.png` and `og-image.png` are made from the logo.
## Edit the WhatsApp number

The number appears as links to `https://wa.me/96178806042` (some with a prefilled `?text=` message)
and as the visible text `+961 78 806 042`. To change it, search and replace both strings across all `.html` files:

- `96178806042` (the wa.me links, international format without `+` or spaces)
- `+961 78 806 042` (the visible number)

## Contact email

There is no public email yet. Placeholders are left as HTML comments (search for `EMAIL PLACEHOLDER`) in the footer of each page and in the legal pages.

## Legal pages

`privacy.html`, `terms.html` and `refund.html` are templates. Each one starts with an HTML comment saying it must be reviewed by a lawyer, and contains `TODO` comments for the company's legal details, retention periods, minimum age and refund timings. Update the visible "Last updated" date whenever you change them.

## Fonts and colours

- Fonts from Google Fonts: **Archivo** (wide, heavy display cut) for headlines and **Inter** for text.
- Colours are CSS variables at the top of `assets/css/styles.css` (`--ink`, `--court`, `--ball`, `--surface`, `--muted`, `--success`, plus sport colours).
