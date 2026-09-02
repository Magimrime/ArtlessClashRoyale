# Draws every sprite: runs each set in tools\pixelart\draw\*.ps1, then builds the
# contact sheet at web\images\pixel\index.html.
#
#     powershell -ExecutionPolicy Bypass -File tools\pixelart\draw-all.ps1
#
# Each set dot-sources _lib.ps1 (which provides B, P and Save-Sprite) and draws its
# sprites with real graphics primitives. Nothing here is wired into the game.
$ErrorActionPreference = 'Continue'
$sets = Get-ChildItem (Join-Path $PSScriptRoot 'draw') -Filter *.ps1 | Sort-Object Name
foreach ($s in $sets) {
    Write-Output "== $($s.BaseName) =="
    & $s.FullName
}
Write-Output ""
Write-Output "building the viewer page..."
& node (Join-Path $PSScriptRoot 'make-viewer.js')
