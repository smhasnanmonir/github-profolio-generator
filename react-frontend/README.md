# AI Portfolio Generator - React Frontend

A modern, interactive React application for generating and editing AI-powered GitHub portfolios with live preview and export capabilities.

## ✨ Features

- 🤖 **AI-Powered Analysis**: ML models analyze GitHub activity to generate professional portfolios
- ✏️ **Live Editing**: Real-time portfolio editing with instant preview
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 📊 **Smart State Management**: React Query for efficient data fetching and caching
- 💾 **Local Storage**: Auto-save changes with localStorage persistence
- 📥 **Export Options**: Download portfolios as HTML or PDF
- 🔄 **Loading States**: Smooth transitions and loading indicators
- 🎭 **Animations**: Fluid animations for better UX

## 🏗️ Project Structure

```
react-frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx         # Landing page
│   │   ├── GeneratePage.jsx     # Portfolio generation form
│   │   ├── EditPage.jsx         # Main editor with tabs
│   │   └── PreviewPage.jsx      # Full portfolio preview
│   ├── components/
│   │   ├── editor/
│   │   │   ├── ProfileEditor.jsx      # Basic info editor
│   │   │   ├── BehaviorEditor.jsx     # Behavior profile editor
│   │   │   ├── SkillsEditor.jsx       # Skills manager
│   │   │   └── ProjectsEditor.jsx     # Projects list editor
│   │   └── preview/
│   │       └── PreviewPanel.jsx       # Live preview sidebar
│   ├── hooks/
│   │   └── usePortfolio.js      # Portfolio state management hook
│   ├── services/
│   │   └── api.js               # API service layer
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://127.0.0.1:8000`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install additional icon library**:
   ```bash
   npm install lucide-react
   ```

3. **Set up environment variables** (optional):
   Create a `.env` file in the root:
   ```env
   VITE_API_BASE=http://127.0.0.1:8000
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

## 🎯 Usage Guide

### 1. Generate Portfolio

1. Navigate to the homepage
2. Click "Generate Portfolio"
3. Enter your GitHub token and username
4. Wait for AI analysis (30-60 seconds)
5. Automatically redirected to editor

### 2. Edit Portfolio

**Profile Tab:**
- Edit name, headline, summary
- Update location and website
- View statistics

**Behavior Tab:**
- Select developer type (Team Player, Maintainer, etc.)
- Edit description
- Add/remove traits

**Skills Tab:**
- Add new skills
- Remove existing skills
- Select from popular skills
- Drag to reorder (coming soon)

**Projects Tab:**
- Edit project details
- Add new projects
- Remove projects
- Reorder by dragging (coming soon)

### 3. Preview & Export

- Click "Preview" to see full portfolio
- Download HTML for web hosting
- Download PDF for applications
- Share preview link

## 🎨 Key Features Explained

### State Management

The app uses a custom `usePortfolio` hook for managing portfolio state:

```javascript
const {
  portfolio,        // Current portfolio data
  hasChanges,       // Unsaved changes indicator
  updateField,      // Update top-level field
  updateNestedField, // Update nested field
  updateProject,    // Update specific project
  addProject,       // Add new project
  removeProject,    // Remove project
  updateSkills,     // Update skills array
  saveToLocalStorage // Persist changes
} = usePortfolio(initialData);
```

### API Integration

All API calls are handled through the `api.js` service with React Query:

```javascript
const generateMutation = useMutation({
  mutationFn: ({ token, profile }) => api.generatePortfolio(token, profile),
  onSuccess: (data) => {
    // Handle success
  },
});
```

### Live Preview

The PreviewPanel component provides real-time preview as you edit:
- Updates instantly on any change
- Shows avatar, stats, skills
- Displays behavior profile
- Lists project count

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Customization

### Themes

Modify `index.css` to change color scheme:

```css
/* Custom gradient */
.gradient-primary {
  background: linear-gradient(to right, #your-color-1, #your-color-2);
}
```

### Animations

Add custom animations in `index.css`:

```css
@keyframes your-animation {
  from { /* start state */ }
  to { /* end state */ }
}
```

## 🔧 Configuration

### Backend URL

Change in `src/services/api.js`:
```javascript
const API_BASE = 'http://your-backend-url:8000';
```

Or use environment variable:
```env
VITE_API_BASE=http://your-backend-url:8000
```

### Router Base Path

Update in `App.jsx`:
```javascript
<Router basename="/your-base-path">
```

## 📦 Production Build

1. Build the app:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains production files

3. Serve with any static file server:
   ```bash
   npm run preview
   ```

## 🐛 Troubleshooting

### Backend Connection Issues

- Ensure backend is running on port 8000
- Check CORS settings in backend
- Verify API_BASE URL is correct

### Build Errors

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Update dependencies: `npm update`

### Styling Issues

- Check Tailwind config is correct
- Ensure `@import "tailwindcss"` is in index.css
- Clear browser cache and rebuild

## 🚀 Deployment

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### Manual
1. Build: `npm run build`
2. Upload `dist/` folder to your host
3. Configure redirect rules for SPA

## 📝 License

MIT - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 💬 Support

For issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review API documentation

---

**Built with React, Vite, Tailwind CSS, and React Query** 💙
