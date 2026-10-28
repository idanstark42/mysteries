# Mystery Game React App (Vite + Tailwind CSS)

An ARG / Mystery Game application designed for mobile devices and QR code progression across 7 distinct story pages.

## Quick Start Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *To open on mobile devices connected to the same Wi-Fi network:*
   ```bash
   npm run dev -- --host
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## QR Code URL Hash Mapping
Generate QR codes pointing to these hash paths (no headers or cross-page navigation links):
- **Page 1 (Cat Attractor Signal)**: `http://YOUR-HOST/#page1`
- **Page 2 (Lab Log Token)**: `http://YOUR-HOST/#page2`
- **Page 3 (Gravity Anomaly Case File)**: `http://YOUR-HOST/#page3`
- **Page 4 (Barcode Camera Terminal)**: `http://YOUR-HOST/#page4`
- **Page 5 (Tavern / Bartender Journal)**: `http://YOUR-HOST/#page5`
- **Page 6 (Gambling Den Dense Ledger)**: `http://YOUR-HOST/#page6`
- **Page 7 (Final Resolution Journal)**: `http://YOUR-HOST/#page7`
