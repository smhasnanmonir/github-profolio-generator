# React Portfolio Editor - Setup Guide

## 🎨 Features Implemented

### ✅ Design System
- **Shadcn-inspired UI**: Clean, minimalist design with zinc color palette
- **No gradients**: Simple, professional borders and backgrounds
- **Consistent spacing**: Using Tailwind's spacing system

### ✅ Loading States
- **PDF Generation**: Visual feedback when PDF is being created
- **HTML Generation**: Live progress indicator
- **Multi-stage generation**: Shows fetching → analyzing → generating HTML → generating PDF

### ✅ Live Editor
- **Real-time preview**: See changes instantly in the preview panel
- **Auto-save**: Changes are automatically saved after 1 second
- **HTML iframe preview**: Live rendering of portfolio as HTML

### ✅ Project Management
- **Drag-and-drop ranking**: Reorder projects by dragging
- **Manual ranking**: Override AI rankings easily
- **Add from GitHub**: Select additional projects from fetched data
- **Top 3 initial**: Portfolio starts with top 3 projects

### ✅ Skills Management
- **Top 5 initial**: Portfolio starts with top 5 skills
- **Add from GitHub**: Select more skills from your repositories
- **Custom skills**: Add skills manually
- **Easy removal**: Click X to remove any skill

### ✅ Data Management
- **Full data storage**: All fetched GitHub data is stored in `localStorage`
- **Filtered display**: Only top 5 skills and top 3 projects shown initially
- **Expandable**: Add more from stored data anytime

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd react-frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Start Backend (in separate terminal)
```bash
cd ..
python organized_structure/main.py
```

## 📦 Dependencies

All required packages are already in `package.json`:
- `react` & `react-dom` - Core React
- `react-router-dom` - Routing
- `react-hook-form` - Form management
- `@tanstack/react-query` - Data fetching & caching
- `lucide-react` - Icons
- `tailwindcss` - Styling

## 🎯 Usage Flow

### 1. Generate Portfolio
1. Navigate to `/generate`
2. Enter GitHub token and username/URL
3. Watch the multi-stage generation process:
   - 📥 Fetching GitHub data
   - 🧠 AI models analyzing
   - 📄 Generating HTML portfolio
   - 📑 Generating PDF portfolio

### 2. Edit Portfolio
1. Automatic redirect to `/edit/:username`
2. Four tabs available:
   - **Profile**: Name, headline, summary, location, etc.
   - **Behavior**: AI-analyzed developer type and traits
   - **Skills**: Manage skills (starts with top 5)
   - **Projects**: Rank and manage projects (starts with top 3)

3. **Add More Content**:
   - Click "Add from GitHub" to select from fetched data
   - Add custom skills manually
   - Drag projects to reorder them

4. **Auto-save**: Changes save automatically after 1 second

### 3. Preview & Export
1. Click "Preview" button
2. View generated HTML
3. Download options:
   - Download HTML
   - Download PDF
4. Click "Regenerate" if you made changes

## 🎨 Design Principles

### Shadcn-like Style
- **Colors**: Zinc palette (900, 800, 700)
- **Borders**: Single pixel, subtle
- **Backgrounds**: Layered zinc shades
- **Hover states**: Minimal, smooth transitions
- **Focus states**: Ring-2 with zinc-600

### No Gradients
- Replaced all `bg-gradient-*` with solid colors
- Simple border colors instead of gradient borders
- Clean, professional appearance

## 📂 File Structure

```
react-frontend/
├── src/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── ProfileEditor.jsx       # Edit profile info
│   │   │   ├── BehaviorEditor.jsx      # Edit behavior type
│   │   │   ├── SkillsEditor.jsx        # Manage skills
│   │   │   └── ProjectsEditor.jsx      # Rank projects (drag-drop)
│   │   └── preview/
│   │       ├── LivePreview.jsx         # Real-time HTML preview
│   │       └── PreviewPanel.jsx        # Quick stats preview
│   ├── hooks/
│   │   └── usePortfolio.js             # Portfolio state management
│   ├── pages/
│   │   ├── HomePage.jsx                # Landing page
│   │   ├── GeneratePage.jsx            # Generation with loading
│   │   ├── EditPage.jsx                # Main editor
│   │   └── PreviewPage.jsx             # Full preview & download
│   ├── services/
│   │   └── api.js                      # API calls
│   ├── utils/
│   │   └── github.js                   # Username extraction
│   └── App.jsx                         # Routes & providers
```

## 🔧 Key Components

### usePortfolio Hook
Manages all portfolio state with these functions:
- `updateField(field, value)` - Update top-level fields
- `updateNestedField(path, value)` - Update nested fields (e.g., 'behavior_profile.type')
- `updateProject(index, field, value)` - Update specific project
- `moveProject(from, to)` - Drag-drop ranking
- `addProject(project)` - Add from GitHub data
- `removeProject(index)` - Remove project
- `addSkill(skill)` - Add skill
- `removeSkill(index)` - Remove skill
- `saveToLocalStorage(username)` - Save changes

### LivePreview Component
- Generates HTML from portfolio data in real-time
- Renders in iframe for instant preview
- Shows quick stats (skills count, projects count, type)
- Refresh button to reload preview

### ProjectsEditor
- Drag-and-drop using native HTML5 drag API
- Visual feedback during drag
- Shows project rank (#1, #2, #3, etc.)
- Editable name and description inline
- Add more projects from GitHub modal

### SkillsEditor
- Display current skills as badges
- Add custom skills via form
- Add from GitHub data modal
- Remove skills with X button

## 💾 LocalStorage Structure

```javascript
// Filtered portfolio (top 5 skills, top 3 projects)
localStorage.setItem(`portfolio_${username}`, JSON.stringify({
  name, headline, skills: [top 5], 
  top_projects: [top 3], ...
}));

// Full GitHub data (all projects, all skills)
localStorage.setItem(`portfolio_full_${username}`, JSON.stringify({
  portfolio: { skills: [all], top_projects: [all], ... },
  ...
}));

// Credentials
localStorage.setItem('gh_token', 'ghp_xxx');
localStorage.setItem('gh_profile', 'username');
```

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js` to customize the zinc palette or add your own colors.

### Modify Initial Counts
In `GeneratePage.jsx`:
```javascript
// Change from top 5 to top 10 skills
skills: (data.portfolio?.skills || []).slice(0, 10),

// Change from top 3 to top 5 projects  
top_projects: (data.portfolio?.top_projects || []).slice(0, 5),
```

### Add More Fields
1. Add to `ProfileEditor.jsx` or create new editor
2. Update `usePortfolio` hook if needed
3. Update `LivePreview.jsx` to display new fields

## 🐛 Troubleshooting

### Portfolio not loading
- Check browser console for errors
- Verify localStorage has data: `localStorage.getItem('portfolio_username')`
- Try regenerating the portfolio

### Preview not updating
- Click the refresh button in preview panel
- Check if auto-save is working (look for "Auto-saving..." indicator)

### Drag-and-drop not working
- Ensure you're grabbing the drag handle (grip icon)
- Try refreshing the page
- Check browser console for errors

## 📝 Notes

- **Username extraction**: Automatically extracts username from full GitHub URLs
- **Validation**: Validates GitHub username format before API call
- **Error handling**: Shows user-friendly error messages
- **Responsive**: Works on desktop and mobile (optimized for desktop editing)

## 🚀 Production Build

```bash
npm run build
```

Outputs to `dist/` folder. Serve with any static file server.

---

**Need help?** Check the main project README or open an issue.

