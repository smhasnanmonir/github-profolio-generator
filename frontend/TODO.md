# Portfolio Download Issue - Fix Plan

## Problem Description

- Portfolio preview updates correctly when editing is finished
- Downloaded files do not contain manual changes made during editing
- Preview shows edits but download uses original/unchanged data

## Analysis Steps

- [ ] Examine the usePortfolio hook to understand state management
- [ ] Analyze how preview components get data vs how download works
- [ ] Check the API endpoints for generation/download
- [ ] Review the EditPage and GeneratePage workflows
- [ ] Identify data flow disconnect between edit state and download process

## Fix Implementation

- [ ] Ensure edited portfolio data is properly saved/updated
- [ ] Fix download endpoint to use current portfolio state
- [ ] Verify data flow from edit → save → generate → download
- [ ] Test the complete workflow end-to-end

## Files to Investigate

- usePortfolio.js (state management)
- EditPage.jsx (editing workflow)
- GeneratePage.jsx (generation workflow)
- api.js (backend communication)
- PreviewPanel.jsx (preview display)
- LivePreview.jsx (live preview updates)
