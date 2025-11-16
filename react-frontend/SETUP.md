# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd react-frontend
npm install
```

This will install all dependencies including:
- React 19
- React Router
- TanStack Query
- Tailwind CSS 4
- Lucide React (icons)
- React Hook Form

## Step 2: Configure Backend URL (Optional)

Create a `.env` file in `react-frontend/` directory:

```env
VITE_API_BASE=http://127.0.0.1:8000
```

**Note**: If not set, defaults to `http://127.0.0.1:8000`

## Step 3: Start Development Server

```bash
npm run dev
```

The app will automatically open at `http://localhost:3000`

## Step 4: Ensure Backend is Running

Before using the app, make sure your FastAPI backend is running:

```bash
# In the project root directory
python -m uvicorn backend:app --reload
```

Backend should be accessible at `http://127.0.0.1:8000`

## 🎯 First Usage

1. **Navigate** to `http://localhost:3000`
2. **Click** "Generate Portfolio"
3. **Enter** your GitHub token and username
4. **Wait** for AI analysis (~30-60 seconds)
5. **Edit** your portfolio in the live editor
6. **Preview & Download** HTML/PDF

## 📁 Project Structure

```
react-frontend/
├── src/
│   ├── pages/           # Page components
│   │   ├── HomePage.jsx
│   │   ├── GeneratePage.jsx
│   │   ├── EditPage.jsx
│   │   └── PreviewPage.jsx
│   ├── components/      # Reusable components
│   │   ├── editor/     # Editor components
│   │   └── preview/    # Preview components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── App.jsx         # Main app with routing
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── package.json
├── vite.config.js
└── index.html
```

## 🎨 Features

### ✅ Implemented

- ✅ Modern landing page with animations
- ✅ Portfolio generation with loading states
- ✅ Live editing with 4 tabs (Profile, Behavior, Skills, Projects)
- ✅ Real-time preview panel
- ✅ Auto-save to localStorage
- ✅ Unsaved changes indicator
- ✅ Download HTML/PDF
- ✅ Responsive design
- ✅ TanStack Query for API calls
- ✅ React Router for navigation
- ✅ Custom hooks for state management
- ✅ Tailwind CSS styling
- ✅ Lucide React icons

### 📝 Component Breakdown

**Pages:**
- `HomePage` - Landing page with features
- `GeneratePage` - Form + AI generation flow
- `EditPage` - Main editor with tabs
- `PreviewPage` - Full portfolio preview

**Editor Components:**
- `ProfileEditor` - Basic info (name, headline, summary, etc.)
- `BehaviorEditor` - Developer type, traits, description
- `SkillsEditor` - Add/remove skills with suggestions
- `ProjectsEditor` - Manage projects list

**Preview:**
- `PreviewPanel` - Live sidebar preview

**Hooks:**
- `usePortfolio` - Portfolio state management

**Services:**
- `api.js` - Centralized API calls

## 🔧 Customization

### Change Colors

Edit `src/index.css`:

```css
/* Primary gradient */
.btn-primary {
  background: linear-gradient(to right, #YOUR_COLOR_1, #YOUR_COLOR_2);
}
```

### Add New Fields

1. Update `ProfileEditor.jsx` with new input
2. Use `updateField('new_field', value)` to save
3. Field automatically saved to localStorage

### Modify API Endpoint

Edit `src/services/api.js`:

```javascript
const API_BASE = 'http://your-backend-url';
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Use different port
npm run dev -- --port 3001
```

### Backend Not Connecting

1. Check backend is running: `curl http://127.0.0.1:8000/api/health`
2. Check CORS settings in backend
3. Verify `VITE_API_BASE` in `.env`

### Build Fails

```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Styles Not Loading

1. Ensure Tailwind is configured: `@import "tailwindcss"` in index.css
2. Check `vite.config.js` has `tailwindcss()` plugin
3. Clear cache: `rm -rf node_modules/.vite`

## 📦 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to your host
```

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com)

## 💡 Tips

1. **Auto-save**: Changes auto-save to localStorage every time you edit
2. **Preview**: Click "Preview" button to see full HTML version
3. **Shortcuts**: Press `Ctrl+S` / `Cmd+S` to manually save (coming soon)
4. **Validation**: Form validation prevents invalid GitHub tokens
5. **Loading States**: Beautiful loading animations during API calls

---

**Need Help?** Check the full README.md for detailed documentation.

