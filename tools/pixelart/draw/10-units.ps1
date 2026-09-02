. (Join-Path $PSScriptRoot ".." | Join-Path -ChildPath "_lib.ps1")

# =============================================================================
#  UNITS, BUILDINGS AND TOWERS — pixel versions of the shapes the game already
#  draws (the coloured disc, the building square, the tower block), at the unit's
#  REAL drawn size, using the game's REAL colours (from main.js getUnitColor).
#
#  Every sprite is the same construction the renderer uses:
#     circle/square in the unit's colour
#     + a darker band inside the rim   (shade -0.14)
#     + a short lighter arc            (shade +0.26)
#     + a soft dark edge
# =============================================================================

# --- the game's colour map (web/src/main.js getUnitColor) --------------------
$C = @{
    'knight'='#9aa6b2'; 'archers'='#c98fb0'; 'giant'='#e0a458'; 'mini-pekka'='#5566a0'
    'skeletons'='#e6e3d3'; 'skeleton-army'='#e6e3d3'; 'musketeer'='#7c8fc7'
    'elite-musketeer'='#ec7fb4'; 'mega-knight'='#6b5b8a'; 'pekka'='#4b4f86'
    'barbarians'='#d8a24e'; 'fire-spirit'='#ff7a3c'; 'ice-spirit'='#9ddcef'
    'electro-spirit'='#4f9bff'; 'heal-spirit'='#76d98a'; 'minions'='#356b6b'
    'goblins'='#79b44a'; 'spear-goblins'='#8cc04f'; 'bats'='#6a4a78'
    'goblin-demolisher'='#5e9c3a'; 'wizard'='#ff7043'; 'witch'='#8e4fb0'
    'mega-minion'='#2f4f6e'; 'minion-horde'='#356b6b'; 'baby-dragon'='#79c267'
    'inferno-dragon'='#ff5a2c'; 'golem'='#8a8a8a'; 'lava-hound'='#cf5a3c'
    'elixir-golem'='#d56ab5'; 'elite-barbarians'='#e0934a'; 'zappies'='#ffd24d'
    'sparky'='#64c8ff'; 'wall-breakers'='#b5733a'; 'royal-giant'='#e6b15a'
    'electro-giant'='#46b6c4'; 'bowler'='#7456b0'; 'hog-rider'='#b07a45'
    'royal-hogs'='#e89ab5'; 'prince'='#f1c64a'; 'mother-witch'='#7a3f9c'
    'royal-recruits'='#b9a06a'; 'dark-prince'='#4a3f5a'; 'ice-golem'='#a9dcef'
    'lumberjack'='#5a7a3a'; 'hopper'='#6db84a'; 'firecracker'='#e87ea1'
    'valkyrie'='#d16f3a'; 'executioner'='#3f8a72'; 'golemite'='#8a8a8a'
    'lava-pup'='#ff8a4c'; 'elixir-golemite'='#d56ab5'; 'elixir-blob'='#d56ab5'
    'cursed-hog'='#8e4fb0'; 'three-musketeers'='#ec7fb4'; 'guard'='#e6e3d3'
    'graveyard-skeleton'='#e6e3d3'
}

# --- the game's radii (main.js unitRadius: m * 0.88) -------------------------
$R = @{}
foreach ($k in $C.Keys) { $R[$k] = 10 * 0.88 }          # default
foreach ($k in 'skeletons','bats','skeleton-army','graveyard-skeleton','guard') { $R[$k] = 6 * 0.88 }
foreach ($k in 'fire-spirit','ice-spirit','electro-spirit','heal-spirit') { $R[$k] = 8 * 0.88 }
foreach ($k in 'goblins','spear-goblins','archers','wall-breakers') { $R[$k] = 8 * 0.88 }
foreach ($k in 'barbarians','elite-barbarians','royal-recruits') { $R[$k] = 12 * 0.88 }
foreach ($k in 'mega-knight','pekka') { $R[$k] = 20 * 0.88 }
foreach ($k in 'sparky','bowler') { $R[$k] = 18 * 0.88 }
foreach ($k in 'baby-dragon','inferno-dragon','lava-hound') { $R[$k] = 16 * 0.88 }
foreach ($k in 'giant','golem','elixir-golem','royal-giant','electro-giant') { $R[$k] = 20 * 0.88 }
$R['elixir-golemite'] = 10 * 0.88
$R['elixir-blob'] = 6 * 0.88
$R['lava-pup'] = 6 * 0.88

# shade a hex colour (matches main.js shade())
function Shade($hex, $amt) {
    $h = $hex.TrimStart('#')
    $r = [Convert]::ToInt32($h.Substring(0,2),16); $g = [Convert]::ToInt32($h.Substring(2,2),16); $b = [Convert]::ToInt32($h.Substring(4,2),16)
    $f = { param($v) [Math]::Max(0, [Math]::Min(255, [int][Math]::Round($v + 255 * $amt))) }
    '#{0:x2}{1:x2}{2:x2}' -f (& $f $r), (& $f $g), (& $f $b)
}

# The standard troop disc, exactly as the renderer builds it.
function New-TroopSprite($name, $hex, $rad) {
    $size = [int][Math]::Round($rad * 2) + 4
    if ($size % 2 -ne 0) { $size++ }
    $edge = Shade $hex -0.30
    $band = Shade $hex -0.14
    $lite = Shade $hex 0.26
    Save-Sprite -Category troops -Name $name -Size $size -Palette @($edge, $band, $hex, $lite) -Draw {
        param($g)
        $cx = $size / 2.0
        $r = $rad
        $g.FillEllipse((B $edge), ($cx-$r), ($cx-$r), (2*$r), (2*$r))              # soft dark edge
        $g.FillEllipse((B $hex),  ($cx-$r+0.9), ($cx-$r+0.9), (2*$r-1.8), (2*$r-1.8))
        $bw = [Math]::Max(1.2, $r * 0.22)                                          # darker rim band
        $pen = P $band $bw
        $g.DrawEllipse($pen, ($cx-$r+$bw/2+0.6), ($cx-$r+$bw/2+0.6), (2*$r-$bw-1.2), (2*$r-$bw-1.2))
        $lw = [Math]::Max(1.0, $r * 0.16)                                          # light arc, upper-left
        $g.DrawArc((P $lite $lw), ($cx - $r*0.52), ($cx - $r*0.52), ($r*1.04), ($r*1.04), 190, 90)
    }
}

Write-Output "troops (the game's real discs, real colours, real sizes):"
foreach ($name in ($C.Keys | Sort-Object)) { New-TroopSprite $name $C[$name] $R[$name] }

# --- BUILDINGS: the square the renderer draws -------------------------------
function New-BuildingSprite($name, $hex, $rad) {
    $size = [int][Math]::Round($rad * 2) + 4
    if ($size % 2 -ne 0) { $size++ }
    $edge = Shade $hex -0.30; $band = Shade $hex -0.13; $lite = Shade $hex 0.24
    Save-Sprite -Category buildings -Name $name -Size $size -Palette @($edge, $band, $hex, $lite) -Draw {
        param($g)
        $c = $size / 2.0; $s = $rad
        $g.FillRectangle((B $edge), ($c-$s), ($c-$s), (2*$s), (2*$s))
        $g.FillRectangle((B $hex),  ($c-$s+1), ($c-$s+1), (2*$s-2), (2*$s-2))
        $ib = [Math]::Max(1.2, $s * 0.18)
        $g.DrawRectangle((P $band $ib), ($c-$s+$ib/2+1), ($c-$s+$ib/2+1), (2*$s-$ib-2), (2*$s-$ib-2))
        $g.DrawLine((P $lite ([Math]::Max(1.0,$ib*0.6))), ($c-$s+$ib+1), ($c-$s+$ib), ($c+$s-$ib-1), ($c-$s+$ib))
    }
}

Write-Output "buildings:"
New-BuildingSprite 'crate' '#9c7b4a' (14 * 0.88)
New-BuildingSprite 'elixir-collector' '#c46fb0' (20 * 0.88)

# Cannon — wooden round base + turret + barrel (as drawEntityBody draws it)
Save-Sprite -Category buildings -Name cannon -Size 32 -Palette @('#5c3a18','#6b4423','#8a5c33','#a8703f','#26282c','#4a4e55') -Draw {
    param($g)
    $s = 15 * 0.88
    $g.FillEllipse((B '#5c3a18'), (16-$s*1.05), (16-$s*1.05), ($s*2.1), ($s*2.1))
    $g.FillEllipse((B '#8a5c33'), (16-$s), (16-$s), ($s*2), ($s*2))
    $g.DrawLine((P '#6b4423' 1.4), (16-$s*0.95), (16-$s*0.35), (16+$s*0.95), (16-$s*0.35))
    $g.DrawLine((P '#6b4423' 1.4), (16-$s*0.95), (16+$s*0.35), (16+$s*0.95), (16+$s*0.35))
    $g.FillRectangle((B '#26282c'), 14.6, 2.0, 2.8, 12.0)          # barrel (aims up-screen)
    $g.FillEllipse((B '#4a4e55'), (16-$s*0.48), (16-$s*0.48), ($s*0.96), ($s*0.96))
    $g.FillEllipse((B '#26282c'), (16-$s*0.2), (16-$s*0.2), ($s*0.4), ($s*0.4))
}

# Tesla — raised (blue circle + core) and covered (wooden lid), as the game draws them
Save-Sprite -Category buildings -Name tesla-up -Size 32 -Palette @('#2d6d80','#3f96b0','#57b8d8','#9fdcf2','#1e3742') -Draw {
    param($g)
    $s = 16 * 0.88 * 0.85
    $g.FillEllipse((B '#2d6d80'), (16-$s), (16-$s), ($s*2), ($s*2))
    $g.FillEllipse((B '#57b8d8'), (16-$s+1), (16-$s+1), ($s*2-2), ($s*2-2))
    $g.DrawEllipse((P '#3f96b0' 2.4), (16-$s*0.8), (16-$s*0.8), ($s*1.6), ($s*1.6))
    $g.FillEllipse((B '#1e3742'), (16-$s*0.5), (16-$s*0.5), ($s), ($s))
    $g.FillEllipse((B '#9fdcf2'), (16-$s*0.26), (16-$s*0.26), ($s*0.52), ($s*0.52))
}
Save-Sprite -Category buildings -Name tesla-covered -Size 32 -Palette @('#5c3a18','#6b4423','#8a5c33','#a8703f') -Draw {
    param($g)
    $s = 16 * 0.88 * 0.85
    $g.FillRectangle((B '#5c3a18'), (16-$s), (16-$s), ($s*2), ($s*2))
    $g.FillRectangle((B '#8a5c33'), (16-$s+1), (16-$s+1), ($s*2-2), ($s*2-2))
    $g.DrawLine((P '#6b4423' 1.6), (16-$s+1), (16-$s*0.33), (16+$s-1), (16-$s*0.33))
    $g.DrawLine((P '#6b4423' 1.6), (16-$s+1), (16+$s*0.33), (16+$s-1), (16+$s*0.33))
    $g.DrawLine((P '#a8703f' 1.0), (16-$s+1), (16-$s+1.5), (16+$s-1), (16-$s+1.5))
}

# Bomb Tower — circle + darker inner disc
Save-Sprite -Category buildings -Name bomb-tower -Size 34 -Palette @('#5d6169','#6f747d','#8a8f99','#adb2bb') -Draw {
    param($g)
    $s = 17 * 0.88
    $g.FillEllipse((B '#5d6169'), (17-$s), (17-$s), ($s*2), ($s*2))
    $g.FillEllipse((B '#8a8f99'), (17-$s+1), (17-$s+1), ($s*2-2), ($s*2-2))
    $g.DrawEllipse((P '#6f747d' 2.6), (17-$s*0.78), (17-$s*0.78), ($s*1.56), ($s*1.56))
    $g.DrawArc((P '#adb2bb' 2.0), (17-$s*0.52), (17-$s*0.52), ($s*1.04), ($s*1.04), 190, 90)
    $g.FillEllipse((B '#6f747d'), (17-$s*0.42), (17-$s*0.42), ($s*0.84), ($s*0.84))
}

# Tombstone — the standard building square with a cross on its face
Save-Sprite -Category buildings -Name tombstone -Size 40 -Palette @('#6b7078','#7f858d','#9aa0a8','#bcc2c9') -Draw {
    param($g)
    $s = 20 * 0.88
    $g.FillRectangle((B '#6b7078'), (20-$s), (20-$s), ($s*2), ($s*2))
    $g.FillRectangle((B '#9aa0a8'), (20-$s+1), (20-$s+1), ($s*2-2), ($s*2-2))
    $ib = $s * 0.18
    $g.DrawRectangle((P '#7f858d' $ib), (20-$s+$ib/2+1), (20-$s+$ib/2+1), (2*$s-$ib-2), (2*$s-$ib-2))
    $g.DrawLine((P '#6b7078' 2.6), 20, (20-$s*0.42), 20, (20+$s*0.38))
    $g.DrawLine((P '#6b7078' 2.6), (20-$s*0.28), (20-$s*0.14), (20+$s*0.28), (20-$s*0.14))
}

# Inferno Tower — circle + dark core + glowing centre
Save-Sprite -Category buildings -Name inferno-tower -Size 40 -Palette @('#6e3222','#8f4430','#b5563a','#e06a2c','#ffb63c','#2c2118') -Draw {
    param($g)
    $s = 20 * 0.88
    $g.FillEllipse((B '#6e3222'), (20-$s), (20-$s), ($s*2), ($s*2))
    $g.FillEllipse((B '#b5563a'), (20-$s+1), (20-$s+1), ($s*2-2), ($s*2-2))
    $g.DrawEllipse((P '#8f4430' 3.0), (20-$s*0.78), (20-$s*0.78), ($s*1.56), ($s*1.56))
    $g.FillEllipse((B '#2c2118'), (20-$s*0.5), (20-$s*0.5), ($s), ($s))
    $g.FillEllipse((B '#e06a2c'), (20-$s*0.3), (20-$s*0.3), ($s*0.6), ($s*0.6))
    $g.FillEllipse((B '#ffb63c'), (20-$s*0.16), (20-$s*0.16), ($s*0.32), ($s*0.32))
}

# Balloon — circle envelope with the little basket poking out below
Save-Sprite -Category troops -Name balloon-blue -Size 60 -Palette @('#2f5f96','#4f8fe0','#7fb3ee','#6b4423','#8a5c33') -Draw {
    param($g)
    $R = 24 * 0.88 * 1.3 * 0.5
    $g.FillRectangle((B '#6b4423'), (30-$R*0.34), (30+$R*0.35), ($R*0.68), ($R*0.9))
    $g.FillRectangle((B '#8a5c33'), (30-$R*0.28), (30+$R*0.42), ($R*0.56), ($R*0.7))
    $g.FillEllipse((B '#2f5f96'), (30-$R), (30-$R*1.1), ($R*2), ($R*2))
    $g.FillEllipse((B '#4f8fe0'), (30-$R+1.2), (30-$R*1.1+1.2), ($R*2-2.4), ($R*2-2.4))
    $g.DrawArc((P '#7fb3ee' 3.0), (30-$R*0.55), (30-$R*0.65), ($R*1.1), ($R*1.1), 190, 90)
}

# Skeleton Barrel — brown disc with hoop bands
Save-Sprite -Category troops -Name skeleton-barrel -Size 26 -Palette @('#6b4423','#8a5c33','#a5713a','#c08a52') -Draw {
    param($g)
    $r = 12 * 0.88
    $g.FillEllipse((B '#6b4423'), (13-$r), (13-$r), ($r*2), ($r*2))
    $g.FillEllipse((B '#a5713a'), (13-$r+1), (13-$r+1), ($r*2-2), ($r*2-2))
    $g.DrawLine((P '#6b4423' 2.0), (13-$r*0.9), (13-$r*0.35), (13+$r*0.9), (13-$r*0.35))
    $g.DrawLine((P '#6b4423' 2.0), (13-$r*0.9), (13+$r*0.35), (13+$r*0.9), (13+$r*0.35))
    $g.DrawArc((P '#c08a52' 1.6), (13-$r*0.5), (13-$r*0.5), ($r), ($r), 190, 90)
}

# --- TOWERS: the rounded block + turret the renderer draws -------------------
function New-Tower($name, $edge, $band, $base, $lite, $rad, $king) {
    $size = [int][Math]::Round($rad * 2) + 6
    Save-Sprite -Category towers -Name $name -Size $size -Palette @($edge, $band, $base, $lite, '#2b2f36', '#4a4e55') -Draw {
        param($g)
        $c = $size / 2.0; $r = $rad
        $g.FillRectangle((B $edge), ($c-$r), ($c-$r), (2*$r), (2*$r))
        $g.FillRectangle((B $base), ($c-$r+1.2), ($c-$r+1.2), (2*$r-2.4), (2*$r-2.4))
        $tb = [Math]::Max(1.4, $r * 0.13)
        $g.DrawRectangle((P $band $tb), ($c-$r+$tb/2+1.2), ($c-$r+$tb/2+1.2), (2*$r-$tb-2.4), (2*$r-$tb-2.4))
        $g.DrawArc((P $lite ([Math]::Max(1.2,$r*0.1))), ($c-$r*0.55), ($c-$r*0.55), ($r*1.1), ($r*1.1), 190, 80)
        $tr = $r * 0.5                                            # turret
        $g.FillEllipse((B '#4a4e55'), ($c-$tr), ($c-$tr), ($tr*2), ($tr*2))
        $g.FillEllipse((B '#2b2f36'), ($c-$tr*0.45), ($c-$tr*0.45), ($tr*0.9), ($tr*0.9))
        if ($king) { $g.FillRectangle((B '#2b2f36'), ($c-$r*0.16), ($c-$r*1.05), ($r*0.32), ($r*0.55)) }
        else { $g.FillRectangle((B '#2b2f36'), ($c-$r*0.13), ($c-$r*1.0), ($r*0.26), ($r*0.5)) }
    }
}

Write-Output "towers:"
New-Tower 'princess-tower-blue' '#123a63' '#2b5f9e' '#4f8fe0' '#9fc8f5' 20 $false
New-Tower 'princess-tower-red'  '#5c1a1a' '#9e2b2b' '#e05555' '#f5a0a0' 20 $false
New-Tower 'king-tower-blue'     '#123a63' '#2b5f9e' '#4f8fe0' '#9fc8f5' 26 $true
New-Tower 'king-tower-red'      '#5c1a1a' '#9e2b2b' '#e05555' '#f5a0a0' 26 $true
