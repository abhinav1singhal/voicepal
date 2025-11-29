# Load environment variables from .env file
$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "Loaded: $name" -ForegroundColor Green
        }
    }
} else {
    Write-Error ".env file not found!"
    exit 1
}

# Get the API key from environment
$apiKey = $env:VITE_GEMINI_API_KEY
if (-not $apiKey) {
    Write-Error "VITE_GEMINI_API_KEY not found in .env file!"
    exit 1
}

Write-Host "`n🚀 Starting deployment with API key from .env..." -ForegroundColor Cyan

# Submit build using cloudbuild.yaml
Write-Host "`n📦 Building container..." -ForegroundColor Yellow
gcloud builds submit --config cloudbuild.yaml --substitutions=_VITE_GEMINI_API_KEY="$apiKey"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}

# Deploy to Cloud Run
Write-Host "`n🚀 Deploying to Cloud Run..." -ForegroundColor Yellow
$projectId = (gcloud config get-value project)
gcloud run deploy voicepal `
    --image "gcr.io/$projectId/voicepal" `
    --platform managed `
    --region us-central1 `
    --allow-unauthenticated

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
}
