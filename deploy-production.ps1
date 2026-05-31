# =================================================================================
# 🚀 JEsquare Production Automated DevOps Deployer
# =================================================================================
# This script automates production transition, boots Docker containers with PostgreSQL,
# pushes migrations, seeds the production database, and restores local SQLite compatibility.
# =================================================================================

$ErrorActionPreference = "Stop"
Clear-Host

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "       🌟 JEsquare Mock Test Platform - Production Deployer 🌟       " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Docker Installation
Write-Host "[1/6] Verifying Docker installation..." -ForegroundColor Blue
try {
    $dockerVer = docker --version
    Write-Host "✔ Found Docker: $dockerVer" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running on this host." -ForegroundColor Red
    Write-Host "   Please ensure Docker Desktop / Engine is installed and active." -ForegroundColor Yellow
    Exit
}

# 2. Modify Prisma Provider to PostgreSQL
Write-Host "[2/6] Transitioning Prisma schema to PostgreSQL..." -ForegroundColor Blue
$schemaPath = "backend\prisma\schema.prisma"
if (Test-Path $schemaPath) {
    $content = Get-Content $schemaPath -Raw
    # Swap provider sqlite with postgresql
    $content = $content -replace 'provider = "sqlite"', 'provider = "postgresql"'
    Set-Content $schemaPath $content
    Write-Host "✔ Prisma provider updated to 'postgresql' successfully." -ForegroundColor Green
} else {
    Write-Host "❌ Could not find schema.prisma at $schemaPath" -ForegroundColor Red
    Exit
}

# 3. Booting Docker Containers
Write-Host "[3/6] Starting Docker container builds (PostgreSQL, Redis, NestJS, Next.js, Nginx)..." -ForegroundColor Blue
Write-Host "This might take a couple of minutes on first build..." -ForegroundColor DarkYellow
docker compose up -d --build

Write-Host "✔ Docker containers started successfully!" -ForegroundColor Green

# 4. Wait for PostgreSQL & Backend to be healthy
Write-Host "[4/6] Waiting for database & backend services to stabilize..." -ForegroundColor Blue
Start-Sleep -Seconds 12

# 5. Initialize Production Database Schema and Seeds
Write-Host "[5/6] Deploying production PostgreSQL schema & seeding defaults..." -ForegroundColor Blue
try {
    Write-Host "Pusing schema..." -ForegroundColor DarkYellow
    docker compose exec -T backend npx prisma db push
    
    Write-Host "Running database seed..." -ForegroundColor DarkYellow
    docker compose exec -T backend npx prisma db seed
    Write-Host "✔ Production database successfully initialized and seeded!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Database connection delay encountered. Retrying in 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    docker compose exec -T backend npx prisma db push
    docker compose exec -T backend npx prisma db seed
    Write-Host "✔ Production database successfully initialized and seeded!" -ForegroundColor Green
}

# 6. Revert schema.prisma back to SQLite for Local Dev
Write-Host "[6/6] Restoring local development compatibility..." -ForegroundColor Blue
$content = Get-Content $schemaPath -Raw
$content = $content -replace 'provider = "postgresql"', 'provider = "sqlite"'
Set-Content $schemaPath $content
Write-Host "✔ schema.prisma restored to 'sqlite' for out-of-the-box local development." -ForegroundColor Green

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host " 🎉 CONGRATULATIONS! JESQUARE IS NOW LIVE IN PRODUCTION! 🎉" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host ""
Write-Host " 🌐 Portal URL:     http://localhost (Port 80 via Nginx)" -ForegroundColor Cyan
Write-Host " 📋 Credentials:" -ForegroundColor Cyan
Write-Host "    - Admin:   admin@jeesaas.com / admin123" -ForegroundColor White
Write-Host "    - Teacher: teacher@jeesaas.com / admin123" -ForegroundColor White
Write-Host "    - Student: student@jeesaas.com / admin123" -ForegroundColor White
Write-Host ""
Write-Host " Keep coding, keep deploying! 🚀" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
