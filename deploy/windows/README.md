# Deploying on Windows Server

The site runs as two Node.js apps on one Windows server, behind IIS:

| App | Folder | Port | What it does |
|---|---|---|---|
| **Backend** (`SparkBackend` service) | `backend/` | 4000 | Admin API, public API, sign-in, uploads, CVs. Stores everything as files on disk. |
| **Website** (`SparkWebsite` service) | repo root | 3000 | The public site and the admin screens. Reads content from the backend. |

IIS listens on ports 80/443. It sends `/api/admin`, `/api/v1` and `/uploads` to the backend, and everything else to the website. Both apps listen on `127.0.0.1` only, so nothing reaches them except through IIS.

The examples below use these folders; any others work too:

```
C:\spark\app        the code (a git clone of this repo)
C:\spark\iis        the IIS site folder (holds only web.config)
C:\spark\logs       service logs
D:\spark-data\data      content, accounts, messages, CVs, backups  ← back this up
D:\spark-data\uploads   uploaded pictures                          ← back this up
```

## 1. Install the prerequisites

1. **Node.js 22 or 24 LTS** (x64) from nodejs.org.
2. **Git** for Windows.
3. **IIS** (Server Manager → Add Roles → Web Server), then:
   - [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
   - [Application Request Routing (ARR)](https://www.iis.net/downloads/microsoft/application-request-routing)
4. **NSSM** from [nssm.cc](https://nssm.cc/download). Put `nssm.exe` somewhere on the PATH, e.g. `C:\Windows\System32`.

Then configure ARR, once, in PowerShell as Administrator:

```powershell
$appcmd = "$env:windir\system32\inetsrv\appcmd.exe"
# Turn on ARR's proxy, keep the visitor's host name (so redirects use your
# domain), and don't buffer responses (pages stream).
& $appcmd set config -section:system.webServer/proxy /enabled:"True" /preserveHostHeader:"True" /responseBufferLimit:"0" /commit:apphost
# Let web.config tell the apps the request came in over HTTPS.
& $appcmd set config -section:system.webServer/rewrite/allowedServerVariables /+"[name='HTTP_X_FORWARDED_PROTO']" /commit:apphost
```

## 2. Get the code and the starting content

```powershell
git clone <repo-url> C:\spark\app
New-Item -ItemType Directory -Force D:\spark-data, C:\spark\iis, C:\spark\logs
# First install only: copy the starting content out of the repo.
Copy-Item C:\spark\app\backend\data D:\spark-data\data -Recurse
Copy-Item C:\spark\app\backend\uploads D:\spark-data\uploads -Recurse
```

From then on, the content lives in `D:\spark-data`. Deploys never touch it.

## 3. Settings

Generate two random values, one for each secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**`C:\spark\app\backend\.env`** (backend; see `backend/.env.example`):

```ini
PORT=4000
HOST=127.0.0.1
SPARK_DATA_DIR=D:\spark-data\data
SPARK_UPLOADS_DIR=D:\spark-data\uploads
FRONTEND_URL=http://127.0.0.1:3000
SPARK_SHARED_SECRET=<random value 1>
AUTH_SECRET=<random value 2>
ADMIN_EMAIL=you@spark-sys.com
ADMIN_PASSWORD=<first admin password>
# Optional, for the dashboard: GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY
```

**`C:\spark\app\.env.production.local`** (website; see `.env.example`):

```ini
BACKEND_URL=http://127.0.0.1:4000
SPARK_SHARED_SECRET=<random value 1, the same as the backend's>
```

Keep `AUTH_SECRET` stable: changing it signs everyone out. The first admin account is created the first time someone signs in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. After that, manage users in the admin under Site → Users.

## 4. First build and the services

```powershell
cd C:\spark\app\backend
npm ci
npm run build
cd C:\spark\app
npm ci
# The website build reads content from the backend, so start the backend first:
$backend = Start-Process node "dist\server.mjs" -WorkingDirectory C:\spark\app\backend -PassThru
npm run build
Stop-Process $backend.Id

# Register both as Windows services (auto-start, restart on crash, logs in C:\spark\logs):
.\deploy\windows\install-services.ps1 -AppDir C:\spark\app
```

Check that both apps are up: <http://127.0.0.1:4000/health> should show `{"ok":true}`, and <http://127.0.0.1:3000> the website.

## 5. The IIS site

1. Copy `deploy\windows\web.config` to `C:\spark\iis\`.
2. In IIS Manager → Sites → **Add Website**: physical path `C:\spark\iis`, binding http port 80 with your host name.
3. **HTTPS:** get a free Let's Encrypt certificate with [win-acme](https://www.win-acme.com/). Run `wacs.exe`, choose the site, and it adds the https binding and renews it automatically. Until then, delete the "Redirect to HTTPS" rule in `web.config`.
4. Windows Firewall: allow inbound 80 and 443 only. Ports 3000 and 4000 stay closed.

## Updating

```powershell
cd C:\spark\app
.\deploy\windows\update.ps1
```

This pulls the code, rebuilds both apps and restarts the services. The site is unavailable for about a minute while the website rebuilds.

## Backups

Back up `D:\spark-data` (both folders). It holds all content, accounts, messages and CVs, so restoring it restores the site. The backend also keeps the last few versions of each document under `data\backups\`.

## When something's wrong

- **Logs:** `C:\spark\logs\SparkBackend.log` and `SparkWebsite.log`.
- **Publishing doesn't update the site:** `SPARK_SHARED_SECRET` must be identical in both settings files, and the backend's log says if it couldn't reach the website.
- **Admin sign-in redirects to `127.0.0.1`:** ARR's `preserveHostHeader` isn't on (step 1).
- **Pages load slowly or all at once:** ARR's `responseBufferLimit` isn't 0 (step 1).
- **`npm ci` fails with "EPERM" or "operation not permitted":** a service still has the files open. Stop it first (`update.ps1` does this).
