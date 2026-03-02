param(
  [ValidateSet("vercel", "firebase", "none")]
  [string]$Provider = "vercel",
  [ValidateSet("pwa", "apk", "both")]
  [string]$PhoneTest = "both",
  [switch]$SkipBuild,
  [switch]$SkipPublish
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Title,
    [Parameter(Mandatory = $true)]
    [scriptblock]$Action
  )

  Write-Host ""
  Write-Host "==> $Title" -ForegroundColor Cyan
  & $Action
}

function Require-Command {
  param([string]$CommandName, [string]$HelpText)
  if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
    throw "$CommandName is not installed. $HelpText"
  }
}

function Run-Command {
  param(
    [Parameter(Mandatory = $true)]
    [scriptblock]$Command,
    [Parameter(Mandatory = $true)]
    [string]$Name
  )

  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Name failed with exit code $LASTEXITCODE."
  }
}

if (-not $SkipBuild) {
  Invoke-Step -Title "Build web app" -Action {
    Run-Command -Name "npm run build" -Command { npm run build }
  }
}

if (-not $SkipPublish -and $Provider -ne "none") {
  switch ($Provider) {
    "vercel" {
      Invoke-Step -Title "Publish PWA to Vercel" -Action {
        Require-Command -CommandName "vercel" -HelpText "Install it with: npm i -g vercel"
        Run-Command -Name "vercel --prod --yes" -Command { vercel --prod --yes }
      }
    }
    "firebase" {
      Invoke-Step -Title "Publish PWA to Firebase Hosting" -Action {
        if (-not (Test-Path "firebase.json")) {
          throw "firebase.json not found in project root."
        }
        Require-Command -CommandName "firebase" -HelpText "Install it with: npm i -g firebase-tools"
        Run-Command -Name "firebase deploy --only hosting --non-interactive" -Command { firebase deploy --only hosting --non-interactive }
      }
    }
  }
}

if ($PhoneTest -eq "pwa" -or $PhoneTest -eq "both") {
  Invoke-Step -Title "PWA phone test instructions" -Action {
    Write-Host "1) Run: npm run preview -- --host --port 4173"
    Write-Host "2) Open http://<YOUR_PC_LAN_IP>:4173 on phone (same Wi-Fi)"
    Write-Host "3) On Android Chrome: Install app / Add to Home screen"
    Write-Host "4) For real install prompt/offline trust, test on HTTPS deployed URL"
  }
}

if ($PhoneTest -eq "apk" -or $PhoneTest -eq "both") {
  Invoke-Step -Title "Build Android APK for phone testing" -Action {
    Run-Command -Name "npm run mobile:build:android:debug" -Command { npm run mobile:build:android:debug }
  }

  $apkPath = "android/app/build/outputs/apk/debug/app-debug.apk"
  Write-Host ""
  if (Test-Path $apkPath) {
    Write-Host "APK ready: $apkPath" -ForegroundColor Green
    if (Get-Command adb -ErrorAction SilentlyContinue) {
      Write-Host "Install via USB: adb install -r $apkPath"
    } else {
      Write-Host "adb not found. Install Android platform-tools to use one-command install."
    }
  } else {
    Write-Host "APK build finished but file not found at expected path: $apkPath" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Flow completed." -ForegroundColor Green
