
# 🛠️ Git Workflow for Adding Changes to a Project

This guide outlines the steps to make changes to your project and push them to a GitHub repository.

---

## 🔄 1. Pull the Latest Changes

Make sure your local copy is up to date:

```bash
git pull origin main
```

---

## ✍️ 2. Make Your Changes

Edit files, add features, fix bugs, etc.

---

## ➕ 3. Stage the Changed Files

Stage **all** modified files:

```bash
git add .
```

Or stage specific files:

```bash
git add path/to/file1 path/to/file2
```

---

## 📝 4. Commit Your Changes

Write a clear commit message describing what you changed:

```bash
git commit -m "Add feature: card sorting by rarity"
```

---

## ⬆️ 5. Push Your Changes to GitHub

```bash
git push origin main
```

---

## ✅ Done!

Your changes are now live on the repository.

---

## 🔁 Optional: Repeat Often

Make small, frequent commits instead of big ones. This makes it easier to track changes and roll back if needed.

---

## 🧠 Tips

- Use `git status` to see which files are staged or modified
- Use `git log` to view recent commits
- Use branches for large features or experiments
