# TypinGramingPage

This is a client-side React forum app that stores data in localStorage. It uses react-router for navigation.

Deploy to GitHub Pages

1. Install dependencies (locally):

```powershell
npm install
npm install --save-dev gh-pages
```

2. Configure `package.json`:
- `homepage` is set to `.` for relative paths. You can replace with `https://<username>.github.io/<repo>` if you prefer.

3. Deploy:

```powershell
npm run deploy
```

Notes

- This app uses HashRouter so client-side routes work on GitHub Pages without server redirects.
- Data is persisted in `localStorage` per browser; deploying will not migrate existing localStorage data from other machines.
- For production, consider removing or rotating any demo master keys in `src/utils/data.js` and the admin bootstrap password in `src/contexts/AuthContext.js`.
