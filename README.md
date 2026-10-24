# Blockade

Blockade is a browser extension that blocks distracting websites so you can stay more productive.

▶ [Watch the demo video]

https://github.com/user-attachments/assets/c990be1b-412f-43bd-b55d-5fade0e71c67



## Install Blockade

Download the latest release and follow the guide for your browser:

- [Google Chrome installation](docs/install/chrome.md)
- [Mozilla Firefox installation](docs/install/firefox.md)
- [Microsoft Edge installation](docs/install/edge.md)
- [Safari availability](docs/install/safari.md)

Release downloads are available on the [GitHub Releases page](https://github.com/urdadx/blockade/releases/latest).

## Features

### Blocklist

Easily add new websites and keywords to your blocklist. Blockade helps you add
websites or keywords that are stealing your focus to your blocklist.

### Scheduler

Schedule your focus sessions and get locked out when it's time. Take control of
your day by letting Blockade lock you out of distracting websites and apps
during your designated focus time.

### Analytics & Insights

Insights and detailed analytics to help you be better. Know how you spend your
time and get insights into your focus sessions. Blockade provides analytics to
help you understand your habits and improve your productivity.

### Pomodoro Timer

Built in Pomodoro timer to help you stay focused and productive. Set your focus
sessions and take breaks to recharge.

### Tech Stack

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)
- **WXT** - Chrome extension framework

## Getting Started

First, install the dependencies:

```bash
pnpm install
```


Run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the public web application.
The API is running at [http://localhost:3000](http://localhost:3000).

To develop the Chrome extension separately, run:

```bash
pnpm run dev:extension
```

WXT opens a Chrome profile with the extension loaded. The operational dashboard is available from the extension popup and stores its block list locally in browser storage. If Chrome is installed in a non-standard location, configure its path in `apps/extension/web-ext.config.ts` using WXT's `binaries.chrome` option. Production extension files are generated in `apps/extension/.output` by `pnpm run build:extension`.

## Project Structure

```
blockade/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   ├── extension/   # Chrome extension (WXT + React)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:extension`: Start the Chrome extension in development mode
- `pnpm run build:extension`: Build the Chrome extension
- `pnpm run zip:extension`: Package the Chrome extension for distribution
- `pnpm run check`: Run Oxlint and Oxfmt
