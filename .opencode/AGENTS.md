# AGENTS.md - Cinema Web Application Project

This project uses Opencode multi-agent architecture for a cinema-themed web application.

## Project Overview

- **Stack**: HTML, CSS, JavaScript (vanilla)
- **Architecture**: Multi-agent orchestration (Architect → Specialists)
- **API Integration**: External cinema API with environment-managed credentials

---

## Build & Development Commands

This is a vanilla HTML/CSS/JS project with no build system. Development is file-based:

```bash
# Open files directly in browser or use a simple HTTP server
python -m http.server 8000    # Python 3
npx serve .                    # Node.js

# No linting/testing framework currently configured
```

---

## Agent Architecture

### Agent Hierarchy

| Agent | Role | Tools | Model |
|-------|------|-------|-------|
| **Architect** | Primary coordinator, planning | write, edit | ollama/llama3.2:1b |
| **Backend Developer** | API integration, data layer | write, edit | ollama/llama3.2:1b |
| **Frontend Developer** | UI/UX, components | write, edit | ollama/llama3.2:1b |
| **Cinema Specialist** | Film analysis, recommendations | read only | ollama/llama3.2:1b |
| **Security Specialist** | Code audit, security review | write, edit | ollama/llama3.2:1b |

### Agent Communication Flow

```
Architect → Backend (data logic)
Architect → Frontend (UI implementation)  
Backend → Frontend (structured data only)
Architect → Security (audit after implementation)
```

---

## Code Style Guidelines

### Required Skills

**MUST invoke these skills when working in their domain:**

| Task | Required Skill |
|------|----------------|
| Frontend work | `frontend-design` |
| Backend/API work | `senior-backend` |
| Code reviews | `receiving-code-review` |
| Multi-step tasks | `writing-plans` |
| Task delegation | `subagent-driven-development` |
| Cinema topics | `cine-expert` |

### HTML Guidelines

- **Modular files**: Separate HTML, CSS, and JS files by feature
- **No inline events**: NEVER use `onclick`, `onload`, etc. in HTML tags
- **Semantic markup**: Use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`
- **SEO optimization**: Proper heading hierarchy, meta tags, semantic elements
- **Accessibility (A11y)**: ARIA labels, keyboard navigation, alt text

### CSS Guidelines

- **CSS Variables**: Define colors, spacing, typography in `:root` for consistency
- **DRY principle**: Use variables and mixins, avoid repetition
- **Responsive design**: Mobile-first, use media queries for breakpoints
- **No inline styles**: All styles in separate CSS files
- **Accessibility safe**: Color contrast, focus states, readable fonts

### JavaScript Guidelines

- **Event listeners only**: All interactions via `addEventListener`
- **Modular code**: Separate modules for different features
- **Async/await**: For API calls with proper error handling
- **No direct API calls from frontend**: Backend handles API communication
- **Environment variables**: API keys stored in `.env`, never in code

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `movie-card.js`, `search-bar.css` |
| CSS classes | kebab-case | `.movie-card`, `.search-input` |
| CSS variables | kebal-case | `--primary-color`, `--spacing-md` |
| JS functions | camelCase | `fetchMovies()`, `renderCard()` |
| JS constants | UPPER_SNAKE | `API_KEY`, `MAX_RESULTS` |

### Error Handling

```javascript
// API error handling pattern
async function fetchMovies(query) {
  try {
    const response = await fetch(/* ... */);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error.message);
    // Display user-friendly error message
    showError('Failed to load movies. Please try again.');
  }
}

// Rate limit handling
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        await sleep(1000 * (i + 1)); // Exponential backoff
        continue;
      }
      return response;
    } catch (e) {
      if (i === retries - 1) throw e;
    }
  }
}
```

### Security Guidelines

- **Never commit secrets**: API keys go in `.env`, add `.env` to `.gitignore`
- **Validate all inputs**: Sanitize user input before display
- **XSS prevention**: Never use `innerHTML` with user content; use `textContent`
- **HTTPS only**: All API calls over HTTPS
- **Input validation**: Validate all form inputs client-side

---

## Required Workflows

### Before Writing Code (Multi-step tasks)

1. **MUST** invoke `writing-plans` skill
2. Create detailed plan in `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`
3. Execute with `subagent-driven-development` or inline

### Code Review Process

1. Security Specialist reviews after implementation
2. Invoke `receiving-code-review` skill for feedback handling
3. Verify suggestions against codebase before implementing
4. Push back with technical reasoning if suggestions are incorrect

### Task Delegation

1. Architect assigns task to appropriate specialist
2. Backend prepares data → Frontend renders UI
3. Security audits final result
4. Document all decisions for project memory

---

## File Structure (To Be Created)

```
project/
├── index.html          # Main entry
├── css/
│   ├── variables.css   # Design tokens
│   ├── reset.css       # CSS reset
│   ├── components.css  # Reusable components
│   └── pages.css       # Page-specific styles
├── js/
│   ├── api.js          # API communication (Backend)
│   ├── state.js        # Application state
│   ├── components/     # UI components
│   └── utils/          # Helper functions
├── .env                 # Environment variables (never commit)
├── .gitignore
└── docs/
    └── planes/         # Implementation plans
```

---

## Critical Restrictions

1. **NO inline event handlers** in HTML (`onclick="..."` is forbidden)
2. **NO API calls from frontend JS** - Backend handles all external communication
3. **NO secrets in code** - Use environment variables
4. **Frontend MUST consume structured data from Backend only**
5. **MUST use addEventListener** for all JavaScript interactions

---

## Git Workflow

- Create feature branches for new work
- Commit frequently with descriptive messages
- Never commit directly to main without review
- Document technical decisions in commit messages

---

## Resources

- Skills: `.agents/skills/`
- Agent config: `opencode.json`
- Project memory: Document in `docs/`
