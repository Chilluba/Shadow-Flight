# Shadow Flight Crash Game 🛩️

A thrilling crash game where you bet on how high a plane will fly before it crashes. Cash out before the crash to multiply your bet! Built with React, TypeScript, and powered by AI-generated flight logs.

![Shadow Flight Game](https://img.shields.io/badge/Game-Shadow%20Flight-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite)

## 🎮 Game Overview

Shadow Flight is an adrenaline-pumping crash game where players:
- **Place bets** on how high a plane will fly
- **Watch the multiplier** increase as the plane ascends
- **Beware the shadow plane** that chases with unpredictable speed
- **Cash out before the crash** to win your bet multiplied by the current multiplier
- **Lose everything** if the shadow plane catches you before you cash out

## ✨ Features

### 🎯 Core Gameplay
- **Real-time multiplier system** with smooth animations
- **Dynamic difficulty adjustment (DDA)** that adapts to player performance
- **Safe zone rounds** (5% chance) for strategic breathing room
- **AI-powered flight logs** using Google's Gemini AI for immersive storytelling
- **Sound effects** (mock implementation ready for audio integration)

### 📊 Game Mechanics
- **Starting balance**: $1,000
- **Bet range**: $10 - $500
- **Theoretical RTP**: 95%
- **Max crash point**: 25.00x (rare cases)
- **Adaptive difficulty**: Adjusts based on wins/losses

### 🎨 User Experience
- **Responsive design** with mobile-first approach
- **Beautiful animations** and visual effects
- **Real-time game history** showing last crash multipliers
- **Intuitive controls** with bet validation
- **Modern UI** with cyberpunk-inspired styling

### 🧠 Advanced Features
- **Dynamic Difficulty Adjustment**: Game becomes harder after wins, easier after losses
- **Safe Zone System**: Occasional guaranteed safe rounds
- **AI Flight Logs**: Contextual storytelling that adapts to game events
- **Performance Optimized**: 60 FPS smooth animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd shadow-flight-crash-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_google_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
shadow-flight-crash-game/
├── src/
│   ├── components/          # React components
│   │   ├── Controls.tsx     # Betting controls and cash out button
│   │   ├── GameScreen.tsx   # Main game visualization
│   │   ├── HistoryBar.tsx   # Game history display
│   │   ├── icons.tsx        # SVG icon components
│   │   └── Introduction.tsx # Game introduction modal
│   ├── hooks/
│   │   └── useSound.ts      # Sound effects hook (ready for implementation)
│   ├── types/
│   │   └── types.ts         # TypeScript type definitions
│   ├── utils/
│   │   └── constants.ts     # Game configuration constants
│   ├── App.tsx              # Main application component
│   └── index.tsx            # Application entry point
├── public/                  # Static assets
├── dist/                    # Build output (generated)
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
└── README.md               # This file
```

## 🎯 How to Play

### 1. **Introduction Screen**
- Read the game rules and objectives
- Understand the risk/reward mechanics
- Click "Start Mission" to begin

### 2. **Placing Bets**
- Set your bet amount ($10 - $500)
- Click "Place Bet" to enter the round
- Wait for the countdown to complete

### 3. **During Flight**
- Watch your plane ascend as the multiplier increases
- Monitor the red shadow plane chasing from below
- Read AI-generated flight logs for immersion
- **Decision time**: Cash out early for guaranteed wins or risk it for higher multipliers

### 4. **Cash Out Strategy**
- Click "Cash Out" to secure your winnings
- Winnings = Bet Amount × Current Multiplier
- If the shadow catches you before cashing out, you lose your bet

### 5. **Game History**
- View recent crash multipliers in the history bar
- Use this data to inform your strategy
- Red badges: Low multipliers (<2x)
- Green badges: High multipliers (≥2x)

## 🔧 Technical Details

### Dependencies
- **React 19.1.1**: Modern React with latest features
- **TypeScript 5.8.2**: Type safety and better development experience
- **Vite 6.2.0**: Fast build tool and development server
- **@google/genai**: Google's Gemini AI for flight log generation

### Key Components

#### `App.tsx`
Main application logic including:
- Game state management
- AI integration for flight logs
- Difficulty adjustment system
- Sound effect coordination

#### `GameScreen.tsx`
Visual game representation:
- Animated plane and shadow positions
- Real-time multiplier display
- Visual warning systems
- Responsive design elements

#### `Controls.tsx`
User interaction interface:
- Bet input validation
- Place bet and cash out buttons
- Balance and statistics display
- Responsive control layout

### Game Logic
- **Multiplier Calculation**: Logarithmic growth with configurable parameters
- **Crash Detection**: Probabilistic system with difficulty adjustments
- **AI Integration**: Context-aware flight log generation
- **Performance**: Optimized 60 FPS game loop

## 🎨 Customization

### Styling
The game uses Tailwind CSS classes for styling. Key design elements:
- **Color Scheme**: Cyberpunk-inspired with cyan, indigo, and red accents
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design with breakpoint considerations

### Game Balance
Modify `src/utils/constants.ts` to adjust:
- Starting balance and bet limits
- Difficulty parameters
- RTP and crash probability
- Animation timing

### AI Integration
The game uses Google's Gemini AI for flight logs. You can:
- Modify prompts in `App.tsx`
- Adjust AI response frequency
- Customize narrative style

## 🔊 Sound Integration

The project includes a `useSound` hook ready for audio implementation:

```typescript
// Add actual sound files to public/sounds/
const takeoffSound = new Audio('/sounds/takeoff.mp3');
const dingSound = new Audio('/sounds/ding.mp3');
const explosionSound = new Audio('/sounds/explosion.mp3');
```

## 🚀 Deployment

### Quick Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/shadow-flight-crash-game)

### Environment Variables Required
- `API_KEY`: Your Google Gemini API key (get one at [Google AI Studio](https://makersuite.google.com/app/apikey))

### Supported Platforms
- **Vercel** (Recommended) - Automatic deployments with GitHub integration
- **Netlify** - Easy drag-and-drop deployment
- **GitHub Pages** - Free hosting with GitHub Actions
- **Firebase Hosting** - Google's hosting platform
- **Any Static Host** - The built `dist/` folder works anywhere

### Deployment Steps
1. **Set Environment Variables**: Add your `API_KEY` in your hosting platform
2. **Build Settings**: 
   - Build command: `npm run build`
   - Output directory: `dist`
3. **Deploy**: Push to your repository or upload the `dist` folder

📖 **For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎮 Game Tips

- **Start Conservative**: Begin with smaller bets to understand the game rhythm
- **Watch Patterns**: Use the history bar to identify trends
- **Risk Management**: Don't chase losses with larger bets
- **Safe Zones**: Take advantage of safe zone rounds when they appear
- **Difficulty Awareness**: The game adapts to your performance - adjust strategy accordingly

---

**Ready to take flight?** 🛩️ Start your engines and see how high you can soar before the shadow catches you!
