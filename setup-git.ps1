# BadgerFlix Git Setup Script
# Run this script to initialize git and prepare for GitHub push

Write-Host "`n🎬 BadgerFlix Git Setup`n" -ForegroundColor Cyan

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Initialize git repository
Write-Host "`n📦 Initializing git repository...`n" -ForegroundColor Cyan

if (Test-Path .git) {
    Write-Host "⚠️  Git repository already initialized" -ForegroundColor Yellow
} else {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Add all files
Write-Host "`n📝 Adding files to git...`n" -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "✅ Files ready to commit" -ForegroundColor Green
    Write-Host "`n📋 Files to be committed:" -ForegroundColor Cyan
    git status --short
    
    Write-Host "`n⚠️  IMPORTANT: Before committing, make sure:" -ForegroundColor Yellow
    Write-Host "1. You have created a GitHub repository" -ForegroundColor Yellow
    Write-Host "2. Repository name: badgerflix (or your preferred name)" -ForegroundColor Yellow
    Write-Host "3. Repository URL: https://github.com/kesavn-13/badgerflix.git" -ForegroundColor Yellow
    
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create repository at: https://github.com/new" -ForegroundColor White
    Write-Host "2. Name it: badgerflix" -ForegroundColor White
    Write-Host "3. Don't initialize with README (we already have one)" -ForegroundColor White
    Write-Host "4. Then run these commands:" -ForegroundColor White
    Write-Host "   git commit -m 'Initial commit - BadgerFlix'" -ForegroundColor Gray
    Write-Host "   git branch -M main" -ForegroundColor Gray
    Write-Host "   git remote add origin https://github.com/kesavn-13/badgerflix.git" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
} else {
    Write-Host "✅ All files already committed" -ForegroundColor Green
    Write-Host "`n📋 Current git status:" -ForegroundColor Cyan
    git status
}

Write-Host "`n✨ Setup complete!`n" -ForegroundColor Green

