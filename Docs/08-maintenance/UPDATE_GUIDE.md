# Documentation Update Guide

**Purpose**: How to maintain and update project documentation  
**Last Updated**: 2026-01-08  
**Owner**: Development Team

---

## 📚 Documentation Structure

```
docs/
├── 01-getting-started/      # Setup & quickstart
├── 02-architecture/         # System design
├── 03-features/            # Feature documentation
├── 04-development/         # Dev guidelines & active tasks
├── 05-ui-ux/              # Design system
├── 06-api/                # API reference
├── 07-testing-qa/         # Testing & feedback
├── 08-maintenance/        # This folder
└── 09-archive/            # Historical docs
```

---

## 🎯 When to Update Documentation

### Always Update When:
- ✅ Adding a new feature
- ✅ Changing existing behavior
- ✅ Fixing a bug
- ✅ Modifying APIs
- ✅ Updating dependencies
- ✅ Changing architecture

### Nice to Update:
- Performance improvements
- Code refactoring (no behavior change)
- Internal optimizations

---

## 📝 How to Update Different Types of Docs

### 1. New Feature Documentation

**Steps**:
1. Create feature doc in `docs/03-features/`
2. Use ALL_CAPS naming: `NEW_FEATURE.md`
3. Follow the template below
4. Add link in `docs/README.md`
5. Cross-reference from related docs

**Template**:
```markdown
# Feature Name

**Status**: [Draft/Review/Approved/Deployed]  
**Last Updated**: YYYY-MM-DD  
**Owner**: Team/Person

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Usage](#usage)
- [Testing](#testing)

## Overview
Brief description...

## Architecture
Technical details...

## Usage
Code examples...

## Testing
Test cases...

## Related Documentation
- [Other Doc](../path/to/doc.md)

## Changelog
### v1.0.0 (YYYY-MM-DD)
- Initial release
```

---

### 2. Architecture Changes

**Location**: `docs/02-architecture/`

**Steps**:
1. Update relevant architecture doc
2. Update `DATABASE_SCHEMA.md` if schema changed
3. Update `API_DESIGN.md` if API changed
4. Add entry to `CHANGELOG.md`
5. Update diagrams if needed

**Example**:
```markdown
<!-- DATABASE_SCHEMA.md -->

## Changelog

### 2026-01-08
- Added `progressJson` field to `WorkSession`
- Added indexes on `Document.title` and `Document.content`
```

---

### 3. API Changes

**Location**: `docs/06-api/ENDPOINTS.md`

**Steps**:
1. Document new/changed endpoints
2. Update request/response examples
3. Note breaking changes prominently
4. Update `CHANGELOG.md`

**Example**:
```markdown
## POST /api/search

**Added**: v1.2.0  
**Last Modified**: 2026-01-08

### Parameters
- `q` - Search query
- `tags[]` - Multiple tags (added v1.2.0) ⭐ NEW

### Response
```json
{
  "documents": [...],
  "totalCount": 150
}
```

### Breaking Changes
> [!WARNING]
> v1.2.0: `tag` parameter deprecated, use `tags[]` array instead
```

---

### 4. Bug Fixes

**Location**: Depends on bug type

**Steps**:
1. Document fix in `CHANGELOG.md`
2. Update troubleshooting if applicable
3. Add test case in `docs/07-testing-qa/TEST_CASES.md`
4. Update feedback log if user-reported

**Example**:
```markdown
<!-- CHANGELOG.md -->

### Fixed
- [#123] Vietnamese search now handles uppercase correctly
- [#124] Offline banner no longer overlaps content
```

---

### 5. Testing Results

**Location**: `docs/07-testing-qa/`

**Steps**:
1. Add results to `FEEDBACK_LOG.md`
2. Update test cases in `TEST_CASES.md`
3. Create evaluation doc if major milestone

**Example**:
```markdown
<!-- FEEDBACK_LOG.md -->

### [ISSUE-009] Search Too Slow on Mobile

**Date**: 2026-01-09  
**Reporter**: Field Technician  
**Status**: ✅ Fixed

**Fix**: Added pagination and query optimization
**Verification**: Search now < 200ms on all devices
```

---

## ✍️ Writing Style Guide

### Do's ✅
- **Use clear, concise language**
- **Include code examples**
- **Add screenshots/diagrams**
- **Use tables for comparisons**
- **Link to related docs**
- **Update "Last Updated" date**
- **Use proper markdown formatting**

### Don'ts ❌
- **Don't use jargon without explanation**
- **Don't write wall of text**
- **Don't forget code syntax highlighting**
- **Don't leave broken links**
- **Don't duplicate information**
- **Don't write subjective opinions**

---

## 🎨 Formatting Standards

### File Naming
```
✅ GOOD: SEARCH_FEATURE.md, API_ENDPOINTS.md
❌ BAD: search.md, api.md, MyFeature.md
```

### Heading Levels
```markdown
# H1 - Document Title (only one per doc)
## H2 - Major Sections
### H3 - Subsections
#### H4 - Minor points
```

### Code Blocks
```markdown
<!-- Always specify language -->
```typescript
const example = 'with syntax highlighting';
```

<!-- Use diff for changes -->
```diff
-const old = 'removed';
+const new = 'added';
```
```

### Links
```markdown
<!-- Relative links to other docs -->
[Architecture](../02-architecture/API_DESIGN.md)

<!-- File links with line numbers -->
[SearchInput.tsx:50-60](file:///path/to/file.tsx#L50-L60)

<!-- External links -->
[Next.js Docs](https://nextjs.org/docs)
```

### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
```

### Alerts
```markdown
> [!NOTE]
> Helpful information

> [!WARNING]
> Breaking changes

> [!CAUTION]
> Dangerous actions
```

---

## 🔄 Review Process

### Before Committing Docs:

- [ ] All code examples work
- [ ] All links are functional
- [ ] Screenshots are up-to-date
- [ ] Spelling/grammar checked
- [ ] "Last Updated" date is current
- [ ] Related docs updated
- [ ] CHANGELOG.md updated
- [ ] No orphaned files

### Peer Review Checklist:

- [ ] Technical accuracy
- [ ] Clarity and readability
- [ ] Completeness
- [ ] Consistency with existing docs
- [ ] No breaking changes undocumented

---

## 📊 Documentation Metrics

Track these to ensure quality:

| Metric | Target | How to Check |
|--------|--------|--------------|
| Broken links | 0 | Run link checker |
| Outdated docs | < 10% | Check "Last Updated" |
| Coverage | > 80% | All features documented |
| Readability | Grade 8-10 | Hemingway Editor |

---

## 🛠️ Tools & Automation

### Recommended Tools:
- **VS Code Extensions**:
  - Markdown All in One
  - Markdown Lint
  - Code Spell Checker
  
- **Link Checkers**:
  - markdown-link-check
  - broken-link-checker

- **Diagram Tools**:
  - Mermaid (built into GitHub)
  - draw.io
  - Excalidraw

### Automation Scripts:
```bash
# Check for broken links
npm run docs:check-links

# Generate API docs from code
npm run docs:generate-api

# Lint markdown files
npm run docs:lint
```

---

## 🗂️ Archive Process

### When to Archive:

Move to `docs/09-archive/` when:
- Feature is deprecated
- Documentation is replaced
- Tasks are completed
- Historical reference needed

### How to Archive:

1. Move file to appropriate archive subfolder
2. Add archive notice to original location:
```markdown
> [!NOTE]
> This feature has been deprecated. See [New Feature](../path/to/new.md)
```
3. Update links pointing to archived doc
4. Add entry to archive README

---

## 📞 Getting Help

### Questions About Docs?
- Check existing docs first
- Ask in team chat
- Review this guide
- Create issue if unclear

### Suggest Improvements:
- Open PR with proposed changes
- Discuss in team meeting
- Document in FEEDBACK_LOG.md

---

## ✅ Quick Reference

### Common Tasks:

| Task | Command | Location |
|------|---------|----------|
| New feature doc | Copy template | `docs/03-features/` |
| Update API | Edit ENDPOINTS.md | `docs/06-api/` |
| Add test case | Edit TEST_CASES.md | `docs/07-testing-qa/` |
| Bug fix | Update CHANGELOG | `docs/01-getting-started/` |
| Archive old doc | Move to archive | `docs/09-archive/` |

---

**Questions?** See [README](../README.md) or contact the development team.

**Last Updated**: 2026-01-08  
**Next Review**: 2026-02-08
