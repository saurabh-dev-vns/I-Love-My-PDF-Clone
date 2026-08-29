# Dockerfile for deploying the PDF Toolkit to Render's free tier (no credit
# card required). Installs Node.js + qpdf + LibreOffice in the image itself,
# so Protect/Unlock/PDF-to-Word work too — not just the 6 dependency-free tools.

FROM node:20-slim

# qpdf: needed for Protect/Unlock. libreoffice: needed for PDF-to-Word.
# --no-install-recommends keeps the image smaller (LibreOffice pulls in a lot).
RUN apt-get update && apt-get install -y --no-install-recommends \
    qpdf \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (better Docker layer caching on rebuilds).
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app.
COPY . .

# Render sets $PORT at runtime; the app already reads process.env.PORT via env.js.
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
