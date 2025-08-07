# 🚀 Feature Development Git Workflow

This document outlines the steps to properly use version control (Git) when adding a new feature to a project.

---

## ✅ 1. Start from the Main Branch

Make sure you're on the `main` (or `master`) branch and it's up to date:

```bash
git checkout main
git pull origin main
```

---

## ✅ 2. Create a Feature Branch

Create a new branch using a descriptive name:

```bash
git checkout -b feature/your-feature-name
```

---

## ✅ 3. Make Your Changes

Write code, add files, and test your new feature.

---

## ✅ 4. Stage and Commit Your Changes

Stage and commit your changes with a clear message:

```bash
git add .
# or
git add path/to/file.js

git commit -m "Add login page with form and basic validation"
```

---


## ✅ 5. Push Your Feature Branch

Upload your branch to the remote:

```bash
git push origin feature/your-feature-name
```

---

## ✅ 6. Open a Pull Request (PR)

On GitHub/GitLab/Bitbucket:
- Open a PR from your feature branch into `main`
- Request reviews if needed

---

## ✅ 7. Review and Fix Issues

Respond to feedback, make changes, and push them:

```bash
git add .
git commit -m "Fix form validation issues"
git push
```

---

## ✅ 8. Merge the PR

Once approved, merge it into `main`:

```bash
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main
```

---

## ✅ 9. Delete the Feature Branch

Clean up your local and remote branches:

```bash
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## ✅ 10. Start from the Main Branch

Make sure you're on the `main` (or `master`) branch and it's up to date:

```bash
git checkout main
git pull origin main
```

---

## ✅ (Optional) Tag the Release

If this feature is part of a release:

```bash
git tag v1.1.0
git push origin v1.1.0
```

---
