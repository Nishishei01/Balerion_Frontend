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

# Balerion Backend - Text to Baht Converter

This project is an implementation for the Balerion Back End Take Home #8 task. It converts decimal values into Thai text representing Baht currency.

## Features

- Converts whole numbers to Thai Baht text (e.g., 1234 -> หนึ่งพันสองร้อยสามสิบสี่บาทถ้วน).
- Handles fractional parts as "Satang" (e.g., 33333.75 -> สามหมื่นสามพันสามร้อยสามสิบสามบาทเจ็ดสิบห้าสตางค์).
- Handles edge cases up to millions and zero:
  - `0` -> ศูนย์บาทถ้วน
  - `0.25` -> ยี่สิบห้าสตางค์
  - `-1234.50` -> ลบหนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์
  - `1000000` -> หนึ่งล้านบาทถ้วน
  - `20040000.75` -> ยี่สิบล้านสี่หมื่นบาทเจ็ดสิบห้าสตางค์

## Prerequisites

- Go 1.20 or higher installed.

## Architecture & Design Decisions

Initially, this project was considered for a Hexagonal Architecture approach because the assignment mentioned that the code should be designed with service integration in mind.

However, after evaluating the actual scope of the task, a clean, modular Service Layer Pattern was intentionally chosen instead. Since the project only focuses on a single deterministic business feature without external dependencies (such as databases, APIs, or queues), implementing a full hexagonal architecture would introduce unnecessary complexity and over-engineering.

The current structure aims to balance:

- maintainability
- readability
- extensibility
- testability

while keeping the implementation simple and practical for the assignment scope.

### Project Structure

- `service.go`
  - Defines the service contract (`Service` interface) and constructor (`NewService()`).
  - Helps reduce coupling and makes the module easier to integrate into larger applications such as REST APIs or gRPC services.

- `converter.go`
  - Contains the core business logic for converting decimal values into Thai Baht text.

- `constants.go`
  - Stores Thai number mappings and positional constants separately from the conversion logic to improve readability and maintainability.

## How to Run

1. Clone the repository and navigate to the project directory:

   ```bash
   git clone <repository_url>
   cd Balerion_Backend
   ```

2. Download dependencies:

   ```bash
   go mod tidy
   ```

3. Run the main program:
   ```bash
   go run cmd/main.go
   ```

## How to Run Tests

To execute the unit tests and verify the logic:

```bash
    go test ./internal/textbaht/
```

## Live Demo

Deployed on Vercel:

https://balerion-frontend.vercel.app/

