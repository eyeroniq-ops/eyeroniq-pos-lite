# eyeroniq PoS Lite

A lightweight, self-hosted Point of Sale system built with Next.js, optimized for resource-constrained devices like the Orange Pi Zero 2.

*Scroll down for the Spanish version / Desplázate hacia abajo para la versión en español.*

---

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

### 🛰️ Hotspot Configuration (Technical)

If you are setting up a new Orange Pi, follow these steps to configure the access point:

1.  **Create Hotspot**:
    ```bash
    nmcli con add type wifi ifname wlan0 con-name Hotspot autoconnect yes ssid "eyeroniq PoS Lite"
    nmcli con modify Hotspot 802-11-wireless.mode hotspot 802-11-wireless.band bg
    nmcli con modify Hotspot ipv4.method shared
    ```
2.  **Activate**:
    ```bash
    nmcli con up Hotspot
    ```
3.  **Local Redirect (Optional)**:
    Ensure Nginx is listening on port 80 and proxying to port 3000 for easy access via IP.

---

# eyeroniq PoS Lite (Español)

Un sistema de Punto de Venta ligero y autohospedado diseñado con Next.js, optimizado para dispositivos de recursos limitados como la Orange Pi Zero 2.

## 🚀 Funciones Principales

- **Interfaz POS Moderna**: Experiencia de venta rápida, intuitiva y táctil.
- **Gestión de Inventario**: Control de productos, niveles de stock y códigos de barras.
- **Base de Datos de Clientes**: Directorio completo de tus clientes.
- **Reportes de Ventas**: Paneles visuales y exportación detallada de ventas.
- **Control de Gastos**: Gestiona los costos de tu negocio en un solo lugar.
- **Impresión Térmica**: Soporte integrado para impresoras de tickets térmicas (80mm/58mm).
- **Ruta PRO**: Lógica de transición "Lite a Pro" y branding integrado.

## 🍊 Uso en Orange Pi (Hotspot)

El sistema está configurado para funcionar como un punto de acceso Wi-Fi independiente.

1.  **Conectar**: Conecta tu tablet o dispositivo a la red Wi-Fi: **"eyeroniq PoS Lite"**.
2.  **Acceder**: Abre tu navegador y navega a:
    - `http://10.42.0.1` (IP Directa)
    - `http://pos.local` (URL local amigable)
3.  **Gestión**: La aplicación es administrada por PM2. Para revisar el estado:
    ```bash
    pm2 status pos
    ```

### 🛰️ Configuración del Hotspot (Técnico)

Si estás configurando una nueva Orange Pi, sigue estos pasos para configurar el punto de acceso:

1.  **Crear Hotspot**:
    ```bash
    nmcli con add type wifi ifname wlan0 con-name Hotspot autoconnect yes ssid "eyeroniq PoS Lite"
    nmcli con modify Hotspot 802-11-wireless.mode hotspot 802-11-wireless.band bg
    nmcli con modify Hotspot ipv4.method shared
    ```
2.  **Activar**:
    ```bash
    nmcli con up Hotspot
    ```
3.  **Redirección Local (Opcional)**:
    Asegúrate de que Nginx esté escuchando en el puerto 80 y redirigiendo al puerto 3000 para un acceso fácil vía IP.

---

## 🛠 Tech Stack / Tecnologías

- **Framework**: Next.js 16 (Turbopack)
- **Database**: SQLite with Prisma ORM
- **UI**: Tailwind CSS & Lucide Icons
- **Deployment**: PM2 & Nginx Reverse Proxy

## 📦 Local Development / Desarrollo Local

```bash
npm install
npx prisma generate
npm run dev
```
