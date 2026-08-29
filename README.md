# PDF Toolkit

A personal, self-hosted **iLovePDF-style** platform — merge, split, rotate,
watermark, compress and convert PDFs, built with **Node.js + Express + EJS**.
All processing happens locally; no files are sent to any third-party service.

## Features

| Tool | Status | Requires | Live Preview |
|---|---|---|---|
| Merge PDF | ✅ Working | — | Thumbnails, drag-to-reorder before merging |
| Split PDF (range or per-page zip) | ✅ Working | — | Click pages to build the range visually |
| Rotate PDF | ✅ Working | — | Thumbnail rotates live as you pick an angle |
| Add Watermark | ✅ Working | — | Watermark text overlays live as you type |
| Compress PDF | ✅ Working | — | Page 1 thumbnail + size/page count |
| Image → PDF | ✅ Working | — | Image thumbnails, drag-to-reorder before converting |
| Protect PDF (add password) | ⚙️ Needs system tool | `qpdf` | Page 1 thumbnail + file stats |
| Unlock PDF (remove password) | ⚙️ Needs system tool | `qpdf` | Page 1 thumbnail + file stats |
| PDF → Word | ⚙️ Needs system tool | `LibreOffice` (`soffice`) | Page 1 thumbnail + file stats |

### Live preview

Every tool page renders the selected file **in the browser** using
[PDF.js](https://mozilla.github.io/pdf.js/) (loaded from a CDN) — nothing is
uploaded to the server just to preview it. This means:
- You see actual page thumbnails the instant you pick a file.
- Merge / Image→PDF let you **drag thumbnails to reorder** before submitting; the reordered sequence is what actually gets processed.
- Split lets you **click pages** to build the page range visually.
- Rotate shows the thumbnail **rotating live** as you change the angle.
- Watermark overlays your **text live** on the thumbnail as you type.

The preview logic lives in `src/public/js/` — one small script per tool,
plus a shared `pdf-preview-core.js` that wraps PDF.js. To add a preview to
a future module, follow the pattern in `simple-preview.js` (page 1 +
stats) or `merge-preview.js` (multi-file, drag-reorder).

## Quick Start

```bash
npm install
cp .env.example .env
npm start
```

Visit **http://localhost:3000**.

For development with auto-restart:
```bash
npm run dev
```

### Optional system tools (for Protect/Unlock/PDF→Word)

```bash
# Debian/Ubuntu
sudo apt install qpdf libreoffice

# macOS
brew install qpdf libreoffice
```
If these binaries aren't installed, those three tools will show a clear
501 error explaining what to install — every other tool works without them.

## Project Structure

```
ilovepdf-clone/
├── server.js                  # Entrypoint: boots app, storage dirs, cleanup timer
├── src/
│   ├── app.js                 # Express app setup (view engine, middleware, routes)
│   ├── config/
│   │   ├── env.js             # All env vars, read from one place
│   │   ├── constants.js       # TOOLS registry — homepage nav is generated from this
│   │   └── multer.config.js   # Shared upload factory (size limits, mime filter)
│   ├── modules/                <-- ⭐ one folder per feature, fully self-contained
│   │   ├── merge/
│   │   │   ├── merge.routes.js
│   │   │   ├── merge.controller.js
│   │   │   └── merge.service.js
│   │   ├── split/
│   │   ├── rotate/
│   │   ├── watermark/
│   │   ├── compress/
│   │   ├── imageToPdf/
│   │   ├── protect/
│   │   ├── unlock/
│   │   └── pdfToWord/
│   ├── middlewares/
│   │   ├── error.middleware.js  # 404 + global error handler
│   │   └── asyncHandler.js      # wraps async controllers, forwards errors
│   ├── routes/
│   │   └── index.js             # mounts every module's router + /download
│   ├── utils/
│   │   ├── fileHelper.js        # output paths, safe delete, TTL cleanup sweep
│   │   ├── logger.js
│   │   └── AppError.js          # operational error class w/ status codes
│   ├── views/                   # EJS templates
│   │   ├── layouts/main.ejs
│   │   ├── partials/{navbar,footer}.ejs
│   │   └── pages/{home,merge,split,...,result,error}.ejs
│   └── public/
│       ├── css/style.css
│       └── js/
│           ├── pdf-preview-core.js   # shared PDF.js wrapper (load/render pages)
│           ├── merge-preview.js      # drag-to-reorder thumbnails
│           ├── split-preview.js      # click-to-select page range
│           ├── rotate-preview.js     # live-rotating thumbnail
│           ├── watermark-preview.js  # live text overlay
│           ├── compress-preview.js   # page 1 + file stats
│           ├── image-preview.js      # drag-to-reorder image thumbnails
│           └── simple-preview.js     # generic page 1 + stats (protect/unlock/pdf-to-word)
└── storage/
    ├── uploads/    # incoming files (deleted right after processing)
    ├── outputs/    # generated files (served via /download/:filename)
    └── temp/       # scratch space for tools like LibreOffice
```

## Adding a New Feature (e.g. "Add Page Numbers")

The module pattern makes this a 4-step, copy-paste-friendly process:

1. `mkdir src/modules/pageNumbers`
2. Create `pageNumbers.service.js` — pure logic, takes a file path, returns an output path.
3. Create `pageNumbers.controller.js` — validates `req.file`/`req.body`, calls the service, renders `pages/result`.
4. Create `pageNumbers.routes.js` — wires up multer + GET/POST routes.
5. In `src/routes/index.js`, add: `router.use('/page-numbers', require('../modules/pageNumbers/pageNumbers.routes'));`
6. In `src/config/constants.js`, add an entry to `TOOLS` — it will automatically appear on the homepage.
7. Add `src/views/pages/page-numbers.ejs` (copy an existing simple form as a template).

No other file needs to change — routing, error handling, uploads, and
cleanup are all handled by the shared infrastructure.

## How file lifecycle works

1. User uploads file(s) → saved to `storage/uploads/` with a UUID filename (via `multer.config.js`).
2. Controller calls the module's service, which reads the upload, processes it with **pdf-lib** / **sharp**, and writes the result to `storage/outputs/`.
3. Controller deletes the original upload immediately (`safeDelete`/`safeDeleteMany`).
4. User is redirected to a result page with a `/download/:filename` link.
5. A background sweep (every 15 min, configurable via `FILE_TTL_MINUTES` in `.env`) deletes any output older than the TTL — so nothing accumulates forever.

## Tech Stack

- **Express** — routing & middleware
- **EJS** + `express-ejs-layouts` — server-rendered views
- **Multer** — file uploads
- **pdf-lib** — PDF creation/manipulation (pure JS, no native deps)
- **sharp** — image processing (used for Image → PDF)
- **archiver** — zipping split-page outputs
- **fs-extra**, **uuid**, **dotenv**, **morgan** — utilities

## Deploying to Render (free, no credit card required)

Unlike Oracle Cloud, [Render](https://render.com) does **not** ask for a
credit card on its free tier. The trade-off: it's a managed platform, not a
VPS, so there's no SSH access to run `apt install` by hand. The included
**`Dockerfile`** solves this — it installs `qpdf` and `libreoffice` *inside
the container image* during the build, so all 9 tools work, not just the 6
dependency-free ones.

Free tier caveat: the service **sleeps after 15 minutes of inactivity** and
takes ~30-60 seconds to wake up on the next request. Fine for personal/
occasional use; not for something you want always instantly responsive.

### Option A: One-click Blueprint deploy
1. Push this project to a GitHub repo (the `Dockerfile` and `render.yaml` must be at the repo root).
2. Go to [render.com](https://render.com) → sign up (no card needed) → **New → Blueprint**.
3. Connect your GitHub repo. Render reads `render.yaml` and configures everything automatically.
4. Click **Apply** — Render builds the Docker image (takes a few minutes, LibreOffice is a big package) and deploys it.
5. Your app is live at `https://<your-service-name>.onrender.com`.

### Option B: Manual Web Service
1. Push to GitHub.
2. **New → Web Service** → connect your repo.
3. Render should auto-detect the `Dockerfile` (Runtime: **Docker**). If asked, set:
   - **Instance Type**: Free
   - **Health Check Path**: `/`
4. Click **Create Web Service** and wait for the build to finish.

### Verifying it worked
Once live, check `/protect` and `/pdf-to-word` — if `qpdf`/`libreoffice`
installed correctly in the image, these will process files instead of
showing the "not installed" error.

### Updating the app later
Just push new commits to your connected branch — Render rebuilds and
redeploys automatically.

## Deploying to Oracle Cloud Free Tier

Oracle's "Always Free" tier gives a real, permanent VM (up to 4 vCPU / 24GB RAM
on Ampere A1) with full root access — unlike most free PaaS hosts, this lets
you install `qpdf` and `LibreOffice`, so **all 9 tools work**, not just the 6
that need no extra dependencies.

### 1. Create the VM
1. Sign up at [cloud.oracle.com](https://cloud.oracle.com) (free tier, no auto-charge after trial).
2. **Compute → Instances → Create Instance**.
3. Image: **Canonical Ubuntu 22.04**. Shape: **Ampere A1 (Always Free)** — 1–4 OCPU, 6–24GB RAM.
4. Add your SSH public key (or let Oracle generate a key pair for you — download it).
5. Create the instance and note its **public IP address**.

### 2. Open the firewall
In **Networking → Virtual Cloud Networks → your VCN → Security Lists →
Default Security List**, add Ingress Rules for:
- TCP port **80** (HTTP), source `0.0.0.0/0`
- TCP port **443** (HTTPS), source `0.0.0.0/0` — if you'll add SSL later

### 3. SSH in and run the setup script
```bash
ssh -i /path/to/your-key.pem ubuntu@<your-vm-public-ip>
```
Then, after uploading your project (via `git clone` or `scp`):
```bash
chmod +x deploy/setup-oracle-vm.sh
./deploy/setup-oracle-vm.sh
```
This installs Node.js 20, `qpdf`, `libreoffice`, `nginx`, and `pm2`, and opens
the local `ufw` firewall for HTTP/HTTPS.

### 4. Install & start the app
```bash
npm install --production
cp .env.example .env
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup    # then run the one-line command it prints, once
```

### 5. Put Nginx in front (so it's reachable on port 80)
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/pdf-toolkit
sudo ln -s /etc/nginx/sites-available/pdf-toolkit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

Visit `http://<your-vm-public-ip>/` — your PDF Toolkit is live.

### Optional: free HTTPS with a domain
If you point a domain's A record at the VM's IP, you can add free SSL:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Updating the app later
```bash
git pull                 # or re-upload changed files
npm install --production
pm2 restart pdf-toolkit
```



- This is built for **personal/local use** — there's no auth layer. If you
  ever expose this beyond `localhost`, add authentication before doing so.
- `pdf-lib` compression is metadata-level; for real image re-compression
  inside PDFs, a Ghostscript-based step could be added later as a new
  service function inside `compress.service.js`.
