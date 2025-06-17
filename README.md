# Restaurant Operating System

A comprehensive restaurant management system built with React, TypeScript, and Vite.

## Features

- **POS System** - Complete point of sale with cart functionality
- **Menu Management** - Manage menu items, categories, and pricing
- **Order Hub** - Centralized order management from all channels
- **Inventory Management** - Track stock levels and supplier management
- **Customer Management** - Customer profiles and loyalty programs
- **HR Management** - Staff scheduling and payroll
- **Finance Management** - Financial tracking and reporting
- **Analytics & Reports** - Business insights and performance metrics
- **Aggregator Integration** - Connect with delivery platforms
- **Supply Chain** - Supplier and procurement management

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd restaurant-operating-system
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Start the development server
\`\`\`bash
npm run dev
\`\`\`

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   ├── Layout.tsx      # Main layout component
│   ├── Sidebar.tsx     # Navigation sidebar
│   └── Header.tsx      # Top header
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── lib/                # Utility functions and mock data
└── App.tsx             # Main application component
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Dashboard
- Real-time metrics and KPIs
- Sales charts and analytics
- Recent orders overview
- Quick stats and alerts

### POS System
- Interactive menu with categories
- Shopping cart functionality
- Order calculation with tax
- Multiple payment methods

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
