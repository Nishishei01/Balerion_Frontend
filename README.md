# Balerion Frontend - Allocation Salmon

This project is an interactive allocation interface build for the Balerion Front End Assignment 12.1 to help allocate salmon orders based on strict business rules.

## Features

### 1. Auto-Assignment

Automatically distributes salmon across orders immediately on page load using logic:

- **Priority First:** Allocates by `EMERGENCY` > `OVERDUE` > `DAILY`.
- **FIFO (First-In, First-Out):** Tie-breaks orders of the same priority by their created date.
- **Credit Validation:** Strictly enforces credit limits. Automatically stops allocation if the customer cannot afford the stock.
- **Banker's Rounding:** Financial calculations for unit price and credit deductions are processed using Banker's Rounding (rounding half to even) to 2 decimal places.
- **Pricing:** Unit prices dynamically adapt based on `OrderType`, `ItemID`, and `SupplierID`.
- **Wildcard Support:** Seamlessly handles `WH-000` (Any Warehouse) and `SP-000` (Any Supplier) by prioritizing warehouses with the highest remaining stock.

### 2. Manual Allocation

Empowers users to manually override and assign salmon to specific sub-orders:

- **Real-time Validation:** Prevents users from allocating more than the available stock.
- **Credit Guard:** Instantly calculates the new total cost and prevents submission if it exceeds the customer's available credit.

### 3. "Gigaton" Scale Ready

- **Finding Orders:** Uses TanStack Table for efficient filtering, sorting, and managing large datasets in a structured and scalable way.

- **Virtualization:** Uses TanStack Virtual with Pagination to render only visible rows instead of the entire dataset, significantly improving performance and preventing browser lag when handling 5,000+ orders.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **State Management:** Zustand
- **Styling:** Tailwind CSS V4
- **UI Components:** Shadcn/ui
- **Tables:** Tanstack Table + Tanstack Virtual

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate to the frontend directory.
2. Install the dependencies:

```bash
npm install
```

### Running the Application

To start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Building for Production

To create a production-ready bundle:

```bash
npm run build
```
