# PDF Toolkit

A simple, personal **PDF toolkit** built with **Node.js + Express + EJS**.

All PDF processing happens locally. Files are not sent to third-party services.

## Features

* Merge PDFs
* Split PDFs
* Rotate PDFs
* Add watermarks
* Compress PDFs
* Convert Images → PDF
* Protect PDF with password
* Unlock PDF
* Convert PDF → Word
* Live PDF preview
* Drag & drop page reordering

## Quick Start

```bash
npm install
cp .env.example .env
npm start
```

Then open:

```text
http://localhost:3000
```

For development:

```bash
npm run dev
```

## Optional Tools

Protect, Unlock and PDF → Word require:

* `qpdf`
* `LibreOffice`

### Ubuntu/Debian

```bash
sudo apt install qpdf libreoffice
```

### macOS

```bash
brew install qpdf libreoffice
```

The other PDF tools work without these dependencies.

## File Privacy

Files are processed locally.

* Uploaded files are deleted after processing.
* Generated files are automatically cleaned up after a set time.
* No authentication is included because this project is intended for personal/local use.

## Tech Stack

* Node.js
* Express
* EJS
* pdf-lib
* Sharp
* Multer
* PDF.js
