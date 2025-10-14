# 🗺️ BizMap - AI-Powered Business Location Finder

Find the perfect location for your business with AI-powered insights and data-driven analysis.

## ✨ Features

- 🤖 **AI-Powered Search** - Conversational interface for business location discovery
- 📊 **Interactive Maps** - Visualize potential locations with detailed analytics
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🎨 **Modern UI** - Clean, professional design with smooth animations
- 📋 **Export Options** - Download results as PDF or CSV
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📈 **Real-time Analysis** - Get instant location insights and scores

## 🚀 Live Demo

Visit the live site: [https://bizmap.netlify.app](https://bizmap.netlify.app)

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Netlify Functions (Serverless)
- **Maps**: Leaflet/React-Leaflet
- **AI**: OpenAI API (with mock fallback)
- **Deployment**: Netlify

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bizmap.git
   cd bizmap
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
bizmap/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   ├── netlify/
│   │   └── functions/      # Serverless functions
│   └── public/             # Static assets
├── backend/                 # Original backend (for reference)
└── docs/                   # Documentation
```

## 🌐 Deployment

This project is configured for **Netlify** deployment:

1. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Deploy automatically

2. **Build Settings**
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### API Keys (Optional)

- **OpenAI API**: For real AI responses (works without it using mock data)
- **Google Places API**: For real location data (works without it using mock data)

## 📱 Features in Detail

### AI Search Interface
- Conversational business location discovery
- Natural language processing
- Contextual follow-up questions
- Intelligent business type detection

### Traditional Search
- Step-by-step guided process
- Business category selection
- Location and radius preferences
- Price tier and operating hours

### Results Dashboard
- Interactive map visualization
- Location scoring and analytics
- Detailed metrics and insights
- Export capabilities (PDF/CSV)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Maps powered by Leaflet
- Deployed on Netlify
- AI powered by OpenAI

## 📞 Support

For questions or feedback, scan the QR code on the results page or open an issue on GitHub.

---

**Made with ❤️ for entrepreneurs and business owners**