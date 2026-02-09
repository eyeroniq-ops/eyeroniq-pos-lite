# eyeroniq PoS Lite

A lightweight, self-hosted Point of Sale system built with Next.js, optimized for resource-constrained devices like the Orange Pi Zero 2.

## 🚀 Key Features

- **Modern POS Interface**: Fast and intuitive touch-friendly selling experience.
- **Inventory Management**: Track products, stock levels, and barcodes.
- **Client Database**: Maintain a directory of your customers.
- **Sales Reporting**: Visual dashboards and detailed sales exports.
- **Expense Tracking**: Manage business costs in one place.
- **Thermal Printing**: Integrated support for thermal receipt printers (80mm/58mm).
- **Pro Path**: Integrated "Lite to Pro" transition logic and branding.

## 🍊 Usage on Orange Pi (Hotspot)

The system is configured to work as a standalone Wi-Fi access point.

1.  **Connect**: Connect your tablet or device to the Wi-Fi network: **"eyeroniq PoS Lite"**.
2.  **Access**: Open your browser and navigate to:
    - `http://10.42.0.1` (Direct IP)
    - `http://pos.local` (Friendly local URL)
3.  **Management**: The application is managed by PM2. To check status:
    ```bash
    pm2 status pos
    ```

## 🛠 Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Database**: SQLite with Prisma ORM
- **UI**: Tailwind CSS & Lucide Icons
- **Deployment**: PM2 & Nginx Reverse Proxy

## 📦 Local Development

To run the project locally for development:

```bash
npm install
npx prisma generate
npm run dev
```

The app will be available at `http://localhost:3000`.
