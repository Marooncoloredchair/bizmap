# BizMap - Business Location Finder

A simple tool to help you find good locations for your business. Uses AI to chat with you about what you're looking for and shows you some spots on a map.

## What it does

- **AI Chat** - Just tell it what kind of business you want to start
- **Maps** - Shows you locations with scores and details
- **Works on phone** - Looks good on any device
- **Export stuff** - Download your results as PDF or CSV
- **Dark mode** - Switch between light and dark

## Try it out

Live site: [https://bizmap.netlify.app](https://bizmap.netlify.app)

## Tech stuff

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Netlify Functions
- **Maps**: Leaflet
- **AI**: OpenAI API (has mock data if you don't have a key)
- **Hosting**: Netlify

## How to run it locally

You need Node.js installed.

1. Clone this repo
   ```bash
   git clone https://github.com/yourusername/bizmap.git
   cd bizmap
   ```

2. Install stuff
   ```bash
   cd frontend
   npm install
   ```

3. Start it up
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## File structure

```
bizmap/
├── frontend/                 # The main app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Helper functions
│   ├── netlify/
│   │   └── functions/      # Serverless functions
│   └── public/             # Images and stuff
├── backend/                 # Old backend (not used anymore)
└── docs/                   # Documentation
```

## Deploying to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repo
3. It should auto-deploy

Build settings:
- Build command: `cd frontend && npm run build`
- Publish directory: `frontend/dist`

## API keys (optional)

If you want real AI responses, add a `.env` file in the `frontend` directory:

```env
VITE_OPENAI_API_KEY=your_key_here
```

It works fine without any keys using mock data.

## How it works

**AI Chat**: You just type what business you want to start and it asks you questions about location, budget, etc.

**Traditional Search**: Fill out a form with business type, location, etc.

**Results**: Shows you a map with locations and scores, plus you can download the data.

## Contributing

1. Fork the repo
2. Make your changes
3. Push to a branch
4. Make a pull request

## License

MIT License - do whatever you want with it.

## Support

If something's broken, scan the QR code on the results page or open an issue on GitHub.