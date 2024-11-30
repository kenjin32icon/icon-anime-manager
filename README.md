# Anime Manager

A modern desktop application for managing your anime collection, built with Electron, React, and TypeScript.

## Features

- Search and browse anime titles
- View detailed anime information
- Track your watching progress
- Manage favorites
- View statistics about your anime collection
- Modern Material-UI interface
- Cross-platform desktop application

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Desktop Framework**: Electron
- **UI Library**: Material-UI (MUI)
- **Build Tool**: Vite
- **API Integration**: Axios for HTTP requests
- **Charting**: Recharts for statistics visualization

## Prerequisites

Before running this application, make sure you have:
- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kenjin32icon/icon-anime-manager.git
cd anime-manager
```

2. Install dependencies:
```bash
cd frontend
npm install
```

## Development

To run the application in development mode:

```bash
npm run electron:dev
```

This will:
- Start the Vite development server
- Launch the Electron application
- Enable hot-reload for development

Other available commands:
- `npm run dev`: Run only the Vite development server
- `npm run build`: Build the application
- `npm run electron:build`: Build the Electron application
- `npm run electron:preview`: Preview the built Electron application

## Building

To build the application for distribution:

```bash
npm run electron:build
```

The built application will be available in the `dist-electron` directory.

## Project Structure

```
anime-manager/
├── frontend/
│   ├── electron/         # Electron main process files
│   ├── src/             # React application source
│   │   ├── components/  # React components
│   │   ├── services/    # API and business logic
│   │   └── types/       # TypeScript type definitions
│   ├── public/          # Static assets
│   └── dist/           # Built files
├── backend/            # Backend services (if applicable)
└── database/          # Database related files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

- GitHub: [@kenjin32icon](https://github.com/kenjin32icon)
- Email: kariukilewis04@gmail.com
- Repository: [icon-anime-manager](https://github.com/kenjin32icon/icon-anime-manager)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI components from [Material-UI](https://mui.com/)
- Powered by [Jikan API](https://jikan.moe/) for anime data
