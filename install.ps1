# Installs the dsh-jp-font host plugin into a dsh profile.
#
#   pwsh -File C:\Code\dsh-jp-font\install.ps1              # profile: web
#   pwsh -File C:\Code\dsh-jp-font\install.ps1 -Profile web
#
# Idempotent: re-run it after a dsh update, or after editing lib/index.js, to
# refresh the installed copy. The profile directory lives outside the dsh
# installation, so it already survives `npm i -g @deepseek-ai/dsh@latest`.
[CmdletBinding()]
param(
  [string]$Profile = 'web',
  [string]$DshHome = $(if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE '.dsh' })
)

$ErrorActionPreference = 'Stop'
$source = $PSScriptRoot
$profileDir = Join-Path $DshHome "profiles\$Profile"
$target = Join-Path $profileDir "node_modules\dsh-jp-font"
$patchFile = Join-Path $profileDir 'cordis.patch.yml'

if (-not (Test-Path (Join-Path $profileDir 'package.json'))) {
  throw "profile '$Profile' is not initialized at $profileDir — boot it once with: dsh --profile $Profile"
}

# 1. Refresh the installed copy (plain directory, no symlink: no admin needed).
New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
if (Test-Path $target) { Remove-Item -Recurse -Force $target }
Copy-Item -Recurse -Force $source $target
Remove-Item -Force (Join-Path $target 'install.ps1') -ErrorAction SilentlyContinue
Write-Host "installed  $target"

# 2. Register the plugin in the profile's user patch layer, once.
$patch = if (Test-Path $patchFile) { Get-Content -Raw $patchFile } else { '' }
if ($patch -match 'dsh-jp-font') {
  Write-Host "patch      already registered in $patchFile"
} else {
  $entry = @(
    ''
    '# Japanese-first font stack for the web UI (source: C:\Code\dsh-jp-font).'
    '# Removes the Microsoft YaHei CJK fallback that made Japanese text look wrong.'
    '- insert:'
    '    - id: jp-font'
    '      name: dsh-jp-font'
  ) -join "`n"
  Add-Content -Path $patchFile -Value $entry -Encoding utf8
  Write-Host "patch      registered in $patchFile"
}

Write-Host ''
Write-Host "Restart the harness to pick it up:  dsh web"
