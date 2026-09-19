# Super Admin Frontend deployment notes
#
# Full guide: backend repository DEPLOYMENT.md
#
# Build:
#   npm ci
#   VITE_API_BASE_URL=https://<api-domain> \
#   VITE_COMPANY_APP_BASE_URL=https://<company-app-domain> \
#   npm run build
#
# Serve `dist/` with SPA rewrite to index.html (see vercel.json and public/_redirects).
# Requires Node.js 20+.
#
# Platform admin accounts are created via backend:
#   node scripts/bootstrap-platform-admin.js --confirm
