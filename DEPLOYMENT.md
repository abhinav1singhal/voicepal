# VoicePal - Google Cloud Run Deployment Guide

This guide walks you through deploying VoicePal to Google Cloud Run step-by-step using **PowerShell**.

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK** installed ([Download here](https://cloud.google.com/sdk/docs/install))
3. **Docker** installed (optional, Cloud Build handles this)
4. **Your Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🔧 Setup

### Step 1: Authenticate with Google Cloud

```powershell
gcloud auth login
```

This opens a browser window for you to sign in to your Google account.

### Step 2: Set Your Project

Replace `YOUR_PROJECT_ID` with your actual GCP project ID:

```powershell
gcloud config set project YOUR_PROJECT_ID
```

To see your project ID, run:
```powershell
gcloud projects list
```

### Step 3: Enable Required APIs

```powershell
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🚀 Deployment (Manual PowerShell)

### Step 4: Build the Container Image

Extract the API key from your `.env` file and build:

```powershell
$apiKey = (Get-Content .env | Select-String "VITE_GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1] })
gcloud builds submit --config cloudbuild.yaml --substitutions=_VITE_GEMINI_API_KEY="$apiKey"
```

**What this does:**
- Reads the API key from your `.env` file
- Uses `cloudbuild.yaml` to define the build steps
- Builds and pushes the image to Container Registry

**Expected output:** You'll see build logs. Wait for "SUCCESS" message (~2-5 minutes).

### Step 5: Deploy to Cloud Run

```powershell
$projectId = gcloud config get-value project
gcloud run deploy voicepal `
  --image "gcr.io/$projectId/voicepal" `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated
```

**What this does:**
- Gets your current project ID
- Creates a Cloud Run service named "voicepal"
- Uses the container image you just built
- Deploys to `us-central1` region
- Makes it publicly accessible (no authentication required)

**Expected output:** You'll see a URL like `https://voicepal-xyz-uc.a.run.app`

## 🔄 Updating the Deployment

When you make code changes (like upgrading the model), run these commands again:

```powershell
# 1. Rebuild
$apiKey = (Get-Content .env | Select-String "VITE_GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1] })
gcloud builds submit --config cloudbuild.yaml --substitutions=_VITE_GEMINI_API_KEY="$apiKey"

# 2. Redeploy
$projectId = gcloud config get-value project
gcloud run deploy voicepal `
  --image "gcr.io/$projectId/voicepal" `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated
```

## 🛠️ Troubleshooting

### Build fails with "permission denied"
Run: `gcloud auth configure-docker`

### Microphone doesn't work
Cloud Run automatically provides HTTPS, which is required for microphone access. Check browser permissions.

### Translation not working
Verify your API key is correct. Check Cloud Run logs:
```powershell
gcloud run logs read voicepal --region us-central1
```

### Want to change the region?
Available regions: `us-central1`, `us-east1`, `europe-west1`, `asia-northeast1`, etc.
See all: `gcloud run regions list`

## 💰 Cost Estimation

Cloud Run pricing (as of 2024):
- **Free tier**: 2 million requests/month
- **After free tier**: ~$0.40 per million requests
- **Container storage**: ~$0.026/GB/month

For a hackathon demo, you'll likely stay within the free tier.

## 🗑️ Cleanup

To delete the deployment and avoid charges:

```powershell
# Delete Cloud Run service
gcloud run services delete voicepal --region us-central1

# Delete container image
$projectId = gcloud config get-value project
gcloud container images delete "gcr.io/$projectId/voicepal"
```
