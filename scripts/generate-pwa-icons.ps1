param(
  [string]$Source = "public/AICodeverse.png",
  [string]$OutDir = "public/icons"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path $Source)) {
  throw "Source image not found: $Source"
}

if (-not (Test-Path $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

Add-Type -AssemblyName System.Drawing

function New-ResizedPng {
  param(
    [System.Drawing.Image]$InputImage,
    [int]$Size,
    [string]$OutputPath
  )

  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.DrawImage($InputImage, 0, 0, $Size, $Size)
  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$sourcePath = (Resolve-Path $Source).Path
$outPath = (Resolve-Path $OutDir).Path
$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

try {
  $sizes = 48, 72, 96, 128, 192, 256, 384, 512
  foreach ($size in $sizes) {
    New-ResizedPng -InputImage $sourceImage -Size $size -OutputPath (Join-Path $outPath "icon-$size.png")
  }

  Copy-Item (Join-Path $outPath "icon-512.png") (Join-Path $outPath "icon-maskable-512.png") -Force
  New-ResizedPng -InputImage $sourceImage -Size 180 -OutputPath (Join-Path $outPath "apple-touch-icon.png")
  New-ResizedPng -InputImage $sourceImage -Size 32 -OutputPath (Join-Path $outPath "favicon-32x32.png")
}
finally {
  $sourceImage.Dispose()
}

Write-Output "PWA icons generated in $OutDir"
