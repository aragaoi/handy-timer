# Handy Timer

A gentle timer with soft audio alerts built with Vue.js. Perfect for productivity, meditation, and time management with both single and multiple timer modes.

## Features

### 🎯 Core Functionality
- **Single Timer Mode**: Simple, focused timer for individual tasks
- **Multiple Timer Mode**: Manage multiple timers with sequential or simultaneous execution
- **Recurrent Alerts**: Continuous, repeating timers that keep you on track with regular gentle reminders
- **Soft Audio Alerts**: Gentle, non-intrusive sounds that won't startle you
- **Customizable Intervals**: Set any interval from seconds to hours
- **Maximum Time Limit**: Optional total duration with different alert sounds for the last cycles
- **Volume Control**: Adjustable audio volume for each timer
- **Real-time Status**: Live countdown showing time until next alert
- **Clean Interface**: Simple, distraction-free design

### 🌍 Internationalization
- **Multi-language Support**: English, Spanish, and Portuguese (Brazilian)
- **Language Selector**: Easy switching between supported languages
- **Localized Interface**: All text and controls adapt to selected language

### ⚙️ Advanced Features
- **Execution Modes**: Sequential (one after another) or simultaneous (all at once) timer execution
- **Warning System**: Different alert sounds for the last few cycles before completion
- **Persistent Storage**: Settings and timers are saved and restored between sessions
- **Sound Testing**: Preview different alert sounds before starting
- **Reset Functionality**: Reset all timers with confirmation
- **PWA Support**: Install as a Progressive Web App on mobile and desktop devices

## Use Cases

### 🍅 Pomodoro Technique
Set 25-minute work intervals with 5-minute breaks. Use multiple timers for different work sessions or the single timer for focused work periods.

### 🧘 Meditation & Mindfulness
Perfect for timed meditation sessions. The soft sounds provide gentle reminders without breaking your concentration. Use sequential timers for different meditation phases.

### ⏰ Study Sessions
Set study intervals to maintain focus and take regular breaks. The different alert sounds help you know when you're approaching the end of your session. Multiple timers allow for complex study schedules.

### 🏃‍♂️ Exercise & Fitness
Time your workout intervals, rest periods, or HIIT sessions with gentle audio cues. Use simultaneous timers for different exercise phases.

### 💤 Sleep & Relaxation
Use for sleep timers or relaxation exercises with soft, calming audio alerts. Sequential timers work great for bedtime routines.

### 🍳 Cooking & Kitchen
Time cooking steps, baking, or brewing without harsh alarms that might disturb others. Multiple timers help manage complex recipes.

### 📝 Timed Tests & Assessments
Perfect for timed exams, quizzes, and assessments. The gentle alerts help students stay aware of time without being disruptive during important tests. Great for controlling time allocation per question and maintaining focus throughout the assessment.

### 🎯 Workflow Management
Use multiple timers to manage different tasks throughout your day, with sequential execution for structured workflows or simultaneous execution for parallel tasks.

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

### Single Timer Mode
1. **Set your interval**: Choose minutes and seconds for your timer
2. **Adjust volume**: Use the volume slider to set your preferred level
3. **Optional maximum time**: Set a total duration if you want the timer to stop automatically
4. **Configure warnings**: Enable warning sounds for the last few cycles
5. **Test sound**: Use the "Test sound" button to preview the audio alert
6. **Start**: Click the Start button to begin

### Multiple Timer Mode
1. **Add timers**: Click the "+" button to create new timers
2. **Configure each timer**: Set intervals, max time, volume, and warning settings for each timer
3. **Choose execution mode**: Select between sequential (one after another) or simultaneous (all at once)
4. **Start execution**: Use "Start All" or "Start Sequence" to begin
5. **Manage timers**: Add, remove, or modify timers as needed

### General Features
- **Language selection**: Use the language selector in the top-right corner
- **Sound testing**: Test different alert sounds before starting
- **Reset functionality**: Reset all timers and settings when needed
- **Persistent storage**: All settings are automatically saved and restored

## Audio Features

- **Regular alerts**: Gentle, pleasant tones for normal intervals
- **Warning alerts**: Different sound for the last few cycles when maximum time is set
- **Completion sound**: Special tone when the maximum time is reached
- **Sound testing**: Preview all alert types before starting
- **Volume control**: Individual volume control for each timer

## Technology

- **Vue.js 3** with Composition API
- **Vue i18n** for internationalization
- **Vite** for fast development and building
- **Web Audio API** for high-quality sound generation
- **Modern CSS** with CSS custom properties
- **Progressive Web App** (PWA) support
- **Local Storage** for persistent settings

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
- Local Storage

Perfect for desktop and mobile use. Can be installed as a PWA on supported devices.

## Installation as PWA

1. Open the app in a supported browser
2. Look for the "Install" button in your browser's address bar or menu
3. Click "Install" to add the app to your home screen or desktop
4. The app will work offline and behave like a native application

## Release Process

This project uses automated release workflows with version bumping and GitHub releases.

### Creating a Release

#### Option 1: Using GitHub Actions (Recommended)
1. Go to the "Actions" tab in the GitHub repository
2. Select "Release" workflow
3. Click "Run workflow"
4. Choose the release type (patch/minor/major)
5. Click "Run workflow"

#### Option 2: Using NPM Scripts (Local)
```bash
# For a patch release (1.0.0 -> 1.0.1)
npm run version:patch

# For a minor release (1.0.0 -> 1.1.0)
npm run version:minor

# For a major release (1.0.0 -> 2.0.0)
npm run version:major

# Then push the changes and tags
git push origin main --tags
```

### Release Workflow

The release process works in two stages:

#### **Release Workflow (`release.yml`)**
- ✅ Runs tests and builds the application
- ✅ Bumps the version in `package.json` and `package-lock.json`
- ✅ Generates changelog from commits since last release
- ✅ Creates a git commit with the version bump
- ✅ Creates a git tag with the new version
- ✅ Pushes changes and tags to the repository
- ✅ Creates a GitHub release with dynamic changelog

#### **Deploy Workflow (`deploy.yml`)**
- ✅ Deploys to GitHub Pages when a release tag is pushed

### Workflows

The project uses three separate workflows:

#### **Pull Request Workflow (`pr.yml`)**
- **`test`**: Validates builds on pull requests

#### **Deploy Workflow (`deploy.yml`)**
- **`build-and-deploy`**: Deploys to GitHub Pages on tag pushes

#### **Release Workflow (`release.yml`)**
- **`release`**: Complete release process - test, build, version bump, changelog, create release (triggers deploy)

### Version Numbering

- **Patch** (1.0.0 → 1.0.1): Bug fixes, small improvements
- **Minor** (1.0.0 → 1.1.0): New features, enhancements
- **Major** (1.0.0 → 2.0.0): Breaking changes, major rewrites

## Contributing

This project uses modern web technologies and follows clean code principles. The codebase is organized with:

- **Components**: Reusable Vue components in `/src/components/`
- **Services**: Business logic in `/src/services/`
- **Locales**: Internationalization files in `/src/locales/`
- **Clean Architecture**: Separation of concerns and SOLID principles

### Development Workflow

1. Make your changes on a feature branch
2. Test your changes thoroughly
3. Create a pull request to `main`
4. Once merged, create a release using the npm scripts above

### Commit Message Conventions

For better changelog generation, use clear and descriptive commit messages:

- **feat**: New features (e.g., `feat: add multi-timer support`)
- **fix**: Bug fixes (e.g., `fix: resolve timer synchronization issue`)
- **docs**: Documentation changes (e.g., `docs: update README with new features`)
- **style**: Code style changes (e.g., `style: format code with prettier`)
- **refactor**: Code refactoring (e.g., `refactor: extract timer logic to service`)
- **test**: Adding or updating tests (e.g., `test: add unit tests for timer service`)
- **chore**: Maintenance tasks (e.g., `chore: update dependencies`)

The release changelog will automatically include all commits since the last release.
