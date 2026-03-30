# Deployment — ResumeAI on AWS EC2

## Server Details
- **IP**: 65.1.131.61
- **SSH alias**: `ssh kamal` (configured in `~/.ssh/config`)
- **SSH key**: `/Users/kamalkumar/Downloads/kamal.pem`
- **User**: ubuntu
- **OS**: Ubuntu 24.04 (Linux 6.17)
- **App path**: `/projects/resume-builder`

## Server Stack
- **Node.js**: 22.22.0
- **npm**: 10.9.4
- **PM2**: Process manager (auto-restart, startup on reboot)
- **Nginx**: 1.24.0 (reverse proxy on port 80 → 3000)
- **Swap**: 2GB (`/swapfile`) — needed for builds on 911MB RAM

## SSH Config (`~/.ssh/config`)
```
Host kamal
  HostName 65.1.131.61
  User ubuntu
  IdentityFile /Users/kamalkumar/Downloads/kamal.pem
```

## GitHub Repo
- **URL**: https://github.com/k-kamal-techie/resume-builder.git
- **Account**: k-kamal-techie (switch with `gh auth switch --user k-kamal-techie`)
- **Visibility**: Public

## Deploy Steps (from local machine)

### Quick Deploy (code changes only)
```bash
# 1. Commit and push
git add -A && git commit -m "your message" && git push

# 2. Pull, build, restart on server
ssh kamal 'cd /projects/resume-builder && git pull && npm install && NODE_OPTIONS="--max-old-space-size=768" npm run build && pm2 restart resume-builder'
```

### First-Time Setup (already done)
```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
sudo npm install -g pm2

# Add swap (needed for builds with 911MB RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo "/swapfile swap swap defaults 0 0" | sudo tee -a /etc/fstab

# Clone and setup
git clone https://github.com/k-kamal-techie/resume-builder.git /projects/resume-builder
cd /projects/resume-builder
# Create .env.local with production values
npm install
NODE_OPTIONS="--max-old-space-size=768" npm run build

# Start with PM2
pm2 start npm --name "resume-builder" -- start
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Nginx Config (`/etc/nginx/sites-available/resume-builder`)
```nginx
server {
    listen 80;
    server_name 65.1.131.61;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

## Environment Variables (`.env.local`)
```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://65.1.131.61
NEXTAUTH_SECRET=...
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ANTHROPIC_OAUTH_TOKEN=...
ANTHROPIC_MODEL=claude-opus-4-6
NEXT_PUBLIC_APP_URL=http://65.1.131.61
```

Key differences from local:
- `NEXTAUTH_URL` = `http://65.1.131.61` (not localhost)
- `AUTH_TRUST_HOST=true` (required for non-localhost)
- `NEXT_PUBLIC_APP_URL` = `http://65.1.131.61`

## Useful Commands

```bash
# Check app status
ssh kamal 'pm2 status'

# View logs
ssh kamal 'pm2 logs resume-builder --lines 50'

# Restart app
ssh kamal 'pm2 restart resume-builder'

# Rebuild and restart
ssh kamal 'cd /projects/resume-builder && git pull && npm install && NODE_OPTIONS="--max-old-space-size=768" npm run build && pm2 restart resume-builder'

# Check Nginx
ssh kamal 'sudo nginx -t && sudo systemctl status nginx'

# Check disk/memory
ssh kamal 'df -h / && free -h'
```

## Google OAuth Note
The Google OAuth redirect URI must include `http://65.1.131.61/api/auth/callback/google` in the Google Cloud Console. Without this, Google login will fail on the deployed server.
