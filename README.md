# Handy Timer

A gentle timer with soft audio alerts built with Vue.js. Perfect for productivity, meditation, and time management.

## Features

- **Recurrent Alerts**: Continuous, repeating timer that keeps you on track with regular gentle reminders
- **Soft Audio Alerts**: Gentle, non-intrusive sounds that won't startle you
- **Customizable Intervals**: Set any interval from seconds to hours
- **Maximum Time Limit**: Optional total duration with different alert sounds for the last 3 cycles
- **Volume Control**: Adjustable audio volume
- **Real-time Status**: Live countdown showing time until next alert
- **Clean Interface**: Simple, distraction-free design

## Use Cases

### 🍅 Pomodoro Technique

Set 25-minute work intervals with 5-minute breaks. The gentle alerts help you maintain focus without being disruptive.

### 🧘 Meditation & Mindfulness

Perfect for timed meditation sessions. The soft sounds provide gentle reminders without breaking your concentration.

### ⏰ Study Sessions

Set study intervals to maintain focus and take regular breaks. The different alert sounds help you know when you're approaching the end of your session.

### 🏃‍♂️ Exercise & Fitness

Time your workout intervals, rest periods, or HIIT sessions with gentle audio cues.

### 💤 Sleep & Relaxation

Use for sleep timers or relaxation exercises with soft, calming audio alerts.

### 🍳 Cooking & Kitchen

Time cooking steps, baking, or brewing without harsh alarms that might disturb others.

### 📝 Timed Tests & Assessments

Perfect for timed exams, quizzes, and assessments. The gentle alerts help students stay aware of time without being disruptive during important tests. Great for controlling time allocation per question and maintaining focus throughout the assessment.

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## How to Use

1. **Set your interval**: Choose minutes and seconds for your timer
2. **Adjust volume**: Use the volume slider to set your preferred level
3. **Optional maximum time**: Set a total duration if you want the timer to stop automatically
4. **Start**: Click the Start button to begin
5. **Test sound**: Use "Testar som" to preview the audio alert

## Audio Features

- **Regular alerts**: Gentle, pleasant tones for normal intervals
- **Warning alerts**: Different sound for the last 3 cycles when maximum time is set
- **Completion sound**: Special tone when the maximum time is reached

## Technology

- **Vue.js 3** with Composition API
- **Vite** for fast development and building
- **Web Audio API** for high-quality sound generation
- **Modern CSS** with CSS custom properties

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Browser Support

Works in all modern browsers that support:

- ES6 modules
- Web Audio API
- CSS Grid

Perfect for desktop and mobile use.
