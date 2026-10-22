param(
  [string]$OutputPath = (Join-Path (Split-Path -Parent $PSScriptRoot) "deploy.zip")
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path.TrimEnd("\")
$output = [System.IO.Path]::GetFullPath($OutputPath)
$frontendBuild = Join-Path $root "frontend\build"

if (-not (Test-Path -LiteralPath $frontendBuild -PathType Container)) {
  throw "Missing frontend/build. Run the frontend production build before packaging."
}

if (Test-Path -LiteralPath $output) {
  Remove-Item -LiteralPath $output -Force
}

$outputDirectory = Split-Path -Parent $output
if (-not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

$archive = $null
$filesAdded = 0

function Add-FileToArchive {
  param(
    [System.IO.Compression.ZipArchive]$Archive,
    [string]$SourcePath,
    [string]$ArchivePath
  )

  $entryName = $ArchivePath.Replace("\", "/")
  if ($entryName.StartsWith("/") -or $entryName.Contains("..")) {
    throw "Unsafe archive path: $entryName"
  }

  $entry = $Archive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
  $inputStream = [System.IO.File]::OpenRead($SourcePath)
  $outputStream = $entry.Open()
  try {
    $inputStream.CopyTo($outputStream)
  } finally {
    $outputStream.Dispose()
    $inputStream.Dispose()
  }
}

function Add-DirectoryToArchive {
  param(
    [System.IO.Compression.ZipArchive]$Archive,
    [string]$SourceDirectory,
    [string]$ArchivePrefix
  )

  $sourceRoot = (Resolve-Path -LiteralPath $SourceDirectory).Path.TrimEnd("\")
  Get-ChildItem -LiteralPath $sourceRoot -File -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourceRoot.Length).TrimStart("\")
    Add-FileToArchive -Archive $Archive -SourcePath $_.FullName -ArchivePath "$ArchivePrefix\$relativePath"
    $script:filesAdded++
  }
}

try {
  $archive = [System.IO.Compression.ZipFile]::Open(
    $output,
    [System.IO.Compression.ZipArchiveMode]::Create
  )

  Add-FileToArchive -Archive $archive -SourcePath (Join-Path $root "package.json") -ArchivePath "package.json"
  Add-FileToArchive -Archive $archive -SourcePath (Join-Path $root "package-lock.json") -ArchivePath "package-lock.json"
  $filesAdded += 2

  Add-DirectoryToArchive -Archive $archive -SourceDirectory (Join-Path $root ".platform") -ArchivePrefix ".platform"
  Add-DirectoryToArchive -Archive $archive -SourceDirectory (Join-Path $root "frontend\build") -ArchivePrefix "frontend\build"

  $backendRoot = Join-Path $root "backend"
  Get-ChildItem -LiteralPath $backendRoot -File -Recurse |
    Where-Object {
      $_.Name -ne ".env" -and
      $_.FullName -notmatch "\\node_modules\\"
    } |
    ForEach-Object {
      $relativePath = $_.FullName.Substring($backendRoot.Length).TrimStart("\")
      Add-FileToArchive -Archive $archive -SourcePath $_.FullName -ArchivePath "backend\$relativePath"
      $filesAdded++
    }
} finally {
  if ($null -ne $archive) {
    $archive.Dispose()
  }
}

$entries = [System.IO.Compression.ZipFile]::OpenRead($output)
try {
  $invalidEntries = @($entries.Entries | Where-Object { $_.FullName.Contains("\") })
  if ($invalidEntries.Count -gt 0) {
    throw "Archive contains non-POSIX paths: $($invalidEntries.FullName -join ', ')"
  }
} finally {
  $entries.Dispose()
}

Write-Output "Created $output with $filesAdded files and POSIX archive paths."
