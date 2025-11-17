# Test Checklist ✅

Run through these tests to verify everything works:

## 🎨 Design System Tests

### HomePage
- [ ] No gradients visible
- [ ] Clean zinc borders
- [ ] White primary button
- [ ] Hover states work smoothly
- [ ] All icons render correctly

### GeneratePage
- [ ] Form inputs have zinc-800 background
- [ ] Username extraction shows below input
- [ ] Validation works (try invalid username)
- [ ] Loading states show all 4 stages
- [ ] Each stage shows correct icon

## 🔄 Generation Flow Tests

### Initial Generation
- [ ] Enter token and username
- [ ] See "Fetching GitHub data..." (📥)
- [ ] See "AI models analyzing..." (🧠)
- [ ] See "Generating HTML portfolio..." (📄)
- [ ] See "Generating PDF portfolio..." (📑)
- [ ] Redirects to edit page

### Data Filtering
- [ ] Open browser DevTools → Application → LocalStorage
- [ ] Check `portfolio_${username}` has max 5 skills
- [ ] Check `portfolio_${username}` has max 3 projects
- [ ] Check `portfolio_full_${username}` has all data

## ✏️ Editor Tests

### Profile Tab
- [ ] All fields editable
- [ ] Avatar displays if available
- [ ] Changes reflected in preview
- [ ] Auto-save indicator appears

### Behavior Tab
- [ ] Type dropdown works
- [ ] Description textarea editable
- [ ] Can add/remove traits
- [ ] Info cards display correctly

### Skills Tab
- [ ] Current skills shown as badges
- [ ] Click X removes skill
- [ ] Add custom skill works
- [ ] "Add from GitHub" button present
- [ ] Modal shows available skills
- [ ] Can select multiple skills
- [ ] Selected skills add to portfolio

### Projects Tab
- [ ] Projects show with rank (#1, #2, #3)
- [ ] Can edit name inline
- [ ] Can edit description inline
- [ ] Drag handle visible (grip icon)
- [ ] Drag project changes order
- [ ] Rank numbers update after drag
- [ ] "Add from GitHub" button present
- [ ] Modal shows available projects
- [ ] Can add projects from modal

## 🖥️ Live Preview Tests

### Real-time Updates
- [ ] Change name → preview updates
- [ ] Change headline → preview updates
- [ ] Add skill → preview updates
- [ ] Remove skill → preview updates
- [ ] Reorder projects → preview updates
- [ ] Change behavior type → preview updates

### Preview Panel
- [ ] Shows avatar
- [ ] Shows name and headline
- [ ] Shows developer type
- [ ] Shows stats (followers, stars, etc.)
- [ ] Shows skill count
- [ ] Shows project count
- [ ] Refresh button works

## 💾 Auto-save Tests

### Auto-save Functionality
- [ ] Make a change
- [ ] See "Auto-saving..." indicator
- [ ] Indicator disappears after save
- [ ] Refresh page → changes persist
- [ ] Manual save button works
- [ ] Save button disabled when no changes

## 🎯 Preview Page Tests

### Preview & Download
- [ ] Click "Preview" from editor
- [ ] See full-page HTML preview
- [ ] "Download HTML" button works
- [ ] "Download PDF" button works (if generated)
- [ ] "Open HTML" opens in new tab
- [ ] "Edit" button returns to editor

### Regeneration
- [ ] Click "Regenerate" button
- [ ] See "Generating HTML..." indicator
- [ ] See "Generating PDF..." indicator
- [ ] Progress bar/spinner visible
- [ ] Preview updates after generation

## 🐛 Edge Cases

### Empty States
- [ ] Portfolio with no skills shows empty state
- [ ] Portfolio with no projects shows empty state
- [ ] "Add Your First Project" button works

### Data Validation
- [ ] Can't add duplicate skills
- [ ] Can't add duplicate projects
- [ ] Invalid GitHub URL shows warning
- [ ] Required fields show error messages

### Drag-and-Drop
- [ ] Drag first project to last position
- [ ] Drag last project to first position
- [ ] Drag project to middle
- [ ] Cancel drag (drag outside) works
- [ ] Opacity changes during drag

## 📱 Responsive Tests (Optional)

- [ ] Mobile: Forms work
- [ ] Mobile: Editor tabs accessible
- [ ] Mobile: Drag-drop works (touch)
- [ ] Tablet: Layout looks good
- [ ] Desktop: All features work

## ⚡ Performance Tests

### Speed
- [ ] Page loads quickly
- [ ] Live preview updates instantly
- [ ] No lag when typing
- [ ] Smooth drag-and-drop
- [ ] Auto-save doesn't block UI

### Data
- [ ] LocalStorage size reasonable (<5MB)
- [ ] No memory leaks (check DevTools)
- [ ] Iframe doesn't slow down editor

## 🎨 Visual Tests

### Consistency
- [ ] All buttons same style
- [ ] All inputs same style
- [ ] Colors consistent (zinc palette)
- [ ] Spacing consistent
- [ ] Border styles match

### Accessibility
- [ ] Tab navigation works
- [ ] Focus states visible
- [ ] Buttons have clear labels
- [ ] Error messages readable

## 🚀 Integration Tests

### Full Flow
1. [ ] Start from homepage
2. [ ] Generate portfolio (use real GitHub account)
3. [ ] Verify top 5 skills, top 3 projects
4. [ ] Add custom skill
5. [ ] Add project from GitHub
6. [ ] Drag project to #1 position
7. [ ] See live preview update
8. [ ] Click Preview
9. [ ] Download HTML
10. [ ] Download PDF
11. [ ] Success! 🎉

## 📊 Browser Tests

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

## ✅ Final Checklist

Before considering complete:
- [ ] All design elements match shadcn style
- [ ] No gradients anywhere
- [ ] Loading states work perfectly
- [ ] Live preview updates in real-time
- [ ] Drag-and-drop ranking works
- [ ] Can add skills/projects from GitHub
- [ ] Starts with top 5 skills, top 3 projects
- [ ] Auto-save works reliably
- [ ] Preview page shows loading states
- [ ] Can download HTML and PDF

---

## 🐛 If Something Doesn't Work

1. **Check browser console** for errors
2. **Clear localStorage**: `localStorage.clear()`
3. **Restart dev server**: `Ctrl+C` then `npm run dev`
4. **Check backend is running**: Visit `http://127.0.0.1:8000/api/health`
5. **Verify token is valid**: Try fetching from GitHub API directly

---

**Happy Testing!** 🎉

