# =============================================================================
#  Sprite drawing — Artless Clash Royale
#
#  Each sprite is DRAWN with real graphics primitives (ellipses, polygons,
#  curves, shading) at 8x size, then downsampled and snapped to a tight palette
#  so it comes out as clean pixel art.
#
#      powershell -ExecutionPolicy Bypass -File tools\pixelart\draw-sprites.ps1
#
#  Output: web\images\pixel\<category>\<name>.png   (real, editable PNG files)
#  Nothing here is wired into the game.
# =============================================================================
Add-Type -AssemblyName System.Drawing

$OUT = Join-Path $PSScriptRoot "..\..\web\images\pixel"
$SS  = 8    # supersample factor: draw big, shrink down

function B($hex) {  # solid brush from "#rrggbb"
    $h = $hex.TrimStart('#')
    $c = [System.Drawing.Color]::FromArgb(255, [Convert]::ToInt32($h.Substring(0,2),16),
                                               [Convert]::ToInt32($h.Substring(2,2),16),
                                               [Convert]::ToInt32($h.Substring(4,2),16))
    New-Object System.Drawing.SolidBrush($c)
}
function P($hex, $w) {  # pen from "#rrggbb"
    $h = $hex.TrimStart('#')
    $c = [System.Drawing.Color]::FromArgb(255, [Convert]::ToInt32($h.Substring(0,2),16),
                                               [Convert]::ToInt32($h.Substring(2,2),16),
                                               [Convert]::ToInt32($h.Substring(4,2),16))
    $p = New-Object System.Drawing.Pen($c, [float]$w)
    $p.StartCap = 'Round'; $p.EndCap = 'Round'; $p.LineJoin = 'Round'
    $p
}

# Draw one sprite and write it out.
#   -Size    final pixel size (16 troops/spells/icons/tiles, 24 buildings, 32 towers)
#   -Palette the colours this sprite is allowed to use; every output pixel snaps to
#            the nearest one, which is what turns the smooth drawing into pixel art
#   -Draw    scriptblock: param($g) — draws in a 0..Size coordinate space
function Save-Sprite {
    param(
        [string]$Category,
        [string]$Name,
        [int]$Size,
        [string[]]$Palette,
        [scriptblock]$Draw,
        [switch]$Opaque        # map tiles: no transparency, fill edge to edge
    )

    $big = New-Object System.Drawing.Bitmap(($Size * $SS), ($Size * $SS), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($big)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.ScaleTransform([float]$SS, [float]$SS)
    & $Draw $g
    $g.Dispose()

    # Shrink with a box-style average, then snap to the palette.
    $small = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g2 = [System.Drawing.Graphics]::FromImage($small)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g2.DrawImage($big, (New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)))
    $g2.Dispose(); $big.Dispose()

    # palette as RGB triples
    $pal = @()
    foreach ($hx in $Palette) {
        $h = $hx.TrimStart('#')
        $pal += ,@([Convert]::ToInt32($h.Substring(0,2),16), [Convert]::ToInt32($h.Substring(2,2),16), [Convert]::ToInt32($h.Substring(4,2),16))
    }

    for ($y = 0; $y -lt $Size; $y++) {
        for ($x = 0; $x -lt $Size; $x++) {
            $px = $small.GetPixel($x, $y)
            if (-not $Opaque -and $px.A -lt 110) {          # mostly-empty stays empty
                $small.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0,0,0,0))
                continue
            }
            $best = 0; $bestD = [double]::MaxValue
            for ($i = 0; $i -lt $pal.Count; $i++) {
                $dr = $px.R - $pal[$i][0]; $dg = $px.G - $pal[$i][1]; $db = $px.B - $pal[$i][2]
                $d = $dr*$dr + $dg*$dg + $db*$db
                if ($d -lt $bestD) { $bestD = $d; $best = $i }
            }
            $small.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $pal[$best][0], $pal[$best][1], $pal[$best][2]))
        }
    }

    $dir = Join-Path $OUT $Category
    New-Item -ItemType Directory -Force $dir | Out-Null
    $small.Save((Join-Path $dir "$Name.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $small.Dispose()
    Write-Output "  $Category/$Name.png  ($Size x $Size)"
}

# --- shared palettes ---------------------------------------------------------
$STEEL = @('#20242b', '#4a5666', '#8fa3b8', '#d7e3f0')
$BONE  = @('#2b2b28', '#8d8b7d', '#d8d5c2', '#f4f2e6')
$GREEN = @('#1e3a1c', '#3f7a32', '#6db84a', '#b6e08a')
$SKIN  = @('#5a3418', '#a9713c', '#e0a469', '#f6d3a4')

Write-Output "drawing sprites..."

