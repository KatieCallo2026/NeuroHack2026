# NeuroHack Project

A cognitive functioning and hydration tracking dashboard webapp built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard View**: Track daily hydration sips vs attention flags
- **Historical Calendar**: Navigate through 30 days of historical data
- **Insights Analytics**: 
  - Sleep bio-score tracking with circular progress visualization
  - Neural fatigue distribution across 24-hour periods
  - Hydration-to-stability correlation mapping
- **Data Logging**: Record sleep, injuries, and system notes
- **Profile Management**: User profile with clearance information

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualizations
- **Lucide React** for icons

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Features in Detail

### Dashboard
- Mini calendar with week navigation
- Real-time hydration and neural flag tracking
- 10-day trend visualization
- Sleep, injury, and note logging

### Insights
- Weekly sleep optimization score with animated circular progress
- 30-day neural fatigue heat map by hour
- 14-day hydration-to-stability correlation chart
- System status indicators

### Profile
- User information display
- Role and clearance level
- Active status indicator

