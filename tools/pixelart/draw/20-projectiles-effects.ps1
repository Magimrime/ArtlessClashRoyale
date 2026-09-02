. (Join-Path $PSScriptRoot ".." | Join-Path -ChildPath "_lib.ps1")

# =============================================================================
#  PROJECTILES AND EFFECTS — pixel versions of what the game actually draws in
#  Proj.js / main.js drawProj: the bullets, the rolling log, the axe, the spark
#  burst, the explosion ring, the zap bolt, the chain lightning, and so on.
# =============================================================================

Write-Output "projectiles:"

# The plain bullet every ranged unit fires (a small dark ball)
Save-Sprite -Category projectiles -Name bullet -Size 10 -Palette @('#1c1f24','#3a4048','#5b636e') -Draw {
    param($g)
    $g.FillEllipse((B '#1c1f24'), 1.0, 1.0, 8.0, 8.0)
    $g.FillEllipse((B '#3a4048'), 1.8, 1.8, 6.4, 6.4)
    $g.FillEllipse((B '#5b636e'), 2.6, 2.4, 2.8, 2.4)
}

# Royal Giant's cannonball — heavier, with a highlight
Save-Sprite -Category projectiles -Name cannonball -Size 16 -Palette @('#141619','#292d33','#474d57','#6e7682') -Draw {
    param($g)
    $g.FillEllipse((B '#141619'), 1.0, 1.0, 14.0, 14.0)
    $g.FillEllipse((B '#292d33'), 2.0, 2.0, 12.0, 12.0)
    $g.FillEllipse((B '#474d57'), 3.2, 3.0, 6.0, 5.4)
    $g.FillEllipse((B '#6e7682'), 4.2, 4.0, 2.8, 2.4)
}

# The Log — brown roller with its scrolling bands
Save-Sprite -Category projectiles -Name the-log -Size 64 -Palette @('#4a2a10','#6b4423','#8b4513','#a86a34') -Draw {
    param($g)
    $g.FillRectangle((B '#4a2a10'), 0.0, 21.0, 64.0, 22.0)
    $g.FillRectangle((B '#8b4513'), 0.0, 22.5, 64.0, 19.0)
    foreach ($x in 6, 18, 30, 42, 54) { $g.DrawLine((P '#6b4423' 2.2), $x, 23.0, $x, 41.0) }
    $g.FillRectangle((B '#a86a34'), 0.0, 24.0, 64.0, 3.0)
}
Save-Sprite -Category projectiles -Name the-log-enemy -Size 64 -Palette @('#3a0808','#6b1212','#8b0000','#a83030') -Draw {
    param($g)
    $g.FillRectangle((B '#3a0808'), 0.0, 21.0, 64.0, 22.0)
    $g.FillRectangle((B '#8b0000'), 0.0, 22.5, 64.0, 19.0)
    foreach ($x in 6, 18, 30, 42, 54) { $g.DrawLine((P '#6b1212' 2.2), $x, 23.0, $x, 41.0) }
    $g.FillRectangle((B '#a83030'), 0.0, 24.0, 64.0, 3.0)
}

# Barbarian Barrel — the rolling barrel with hoops
Save-Sprite -Category projectiles -Name barbarian-barrel -Size 44 -Palette @('#4a2a10','#6b4423','#9c6b3a','#bb8a52') -Draw {
    param($g)
    $g.FillRectangle((B '#4a2a10'), 1.0, 9.0, 42.0, 26.0)
    $g.FillRectangle((B '#9c6b3a'), 2.0, 10.0, 40.0, 24.0)
    $g.FillRectangle((B '#4a2a10'), 12.0, 10.0, 3.0, 24.0)
    $g.FillRectangle((B '#4a2a10'), 29.0, 10.0, 3.0, 24.0)
    $g.FillRectangle((B '#bb8a52'), 3.0, 12.0, 38.0, 3.0)
    $g.DrawLine((P '#6b4423' 1.6), 3.0, 22.0, 41.0, 22.0)
}

# Executioner's axe — haft + curved head (as drawn in main.js)
Save-Sprite -Category projectiles -Name axe -Size 40 -Palette @('#4a3216','#7a5228','#9aa6ae','#cfd8de') -Draw {
    param($g)
    $g.FillRectangle((B '#7a5228'), 4.0, 17.5, 30.0, 5.0)
    $g.FillRectangle((B '#4a3216'), 4.0, 17.5, 6.0, 5.0)
    $pts = @( (New-Object System.Drawing.PointF(27,16)), (New-Object System.Drawing.PointF(38,10)),
              (New-Object System.Drawing.PointF(38,30)), (New-Object System.Drawing.PointF(27,24)) )
    $g.FillPolygon((B '#cfd8de'), $pts)
    $g.FillRectangle((B '#9aa6ae'), 25.0, 15.0, 5.0, 10.0)
}

# Firecracker's rocket and one of its burst sparks
Save-Sprite -Category projectiles -Name firework-rocket -Size 16 -Palette @('#a83a6c','#ff6fae','#ffb0d4','#ffffff') -Draw {
    param($g)
    $g.FillEllipse((B '#a83a6c'), 1.0, 1.0, 14.0, 14.0)
    $g.FillEllipse((B '#ff6fae'), 2.0, 2.0, 12.0, 12.0)
    $g.FillEllipse((B '#ffb0d4'), 3.4, 3.2, 5.6, 5.0)
    $g.FillEllipse((B '#ffffff'), 5.4, 5.4, 5.2, 5.2)
}
Save-Sprite -Category projectiles -Name firework-spark -Size 20 -Palette @('#c4547f','#ffbee0','#ffd9ec','#ffffff') -Draw {
    param($g)
    $g.DrawLine((P '#ffbee0' 3.4), 2.0, 16.0, 13.0, 5.0)
    $g.FillEllipse((B '#ffd9ec'), 11.0, 3.0, 7.0, 7.0)
    $g.FillEllipse((B '#ffffff'), 13.0, 5.0, 3.0, 3.0)
}

# Goblin Demolisher's dynamite
Save-Sprite -Category projectiles -Name dynamite -Size 16 -Palette @('#7a1414','#cc2b2b','#f0e3b0','#ffcf3c','#444444') -Draw {
    param($g)
    $g.FillRectangle((B '#7a1414'), 5.0, 3.0, 6.0, 11.0)
    $g.FillRectangle((B '#cc2b2b'), 5.8, 3.8, 4.4, 9.6)
    $g.FillRectangle((B '#f0e3b0'), 5.8, 3.8, 4.4, 2.2)
    $g.DrawLine((P '#444444' 1.2), 8.0, 3.2, 10.5, 1.2)
    $g.FillEllipse((B '#ffcf3c'), 9.6, 0.4, 2.6, 2.6)
}

# Giant Snowball — the big packed ball
Save-Sprite -Category projectiles -Name giant-snowball -Size 44 -Palette @('#7ba6c6','#93bcdc','#cfe4f5','#e9f6ff','#ffffff') -Draw {
    param($g)
    $g.FillEllipse((B '#7ba6c6'), 1.0, 1.0, 42.0, 42.0)
    $g.FillEllipse((B '#e9f6ff'), 2.4, 2.4, 39.2, 39.2)
    $g.FillEllipse((B '#cfe4f5'), 24.0, 22.0, 12.0, 12.0)
    $g.FillEllipse((B '#cfe4f5'), 9.0, 27.0, 8.0, 8.0)
    $g.FillEllipse((B '#ffffff'), 9.0, 8.0, 13.0, 13.0)
}

# Fireball and Rocket (the thrown arc spells)
Save-Sprite -Category projectiles -Name fireball -Size 26 -Palette @('#8f2a06','#e8521a','#ff8c2b','#ffd24d') -Draw {
    param($g)
    $g.FillEllipse((B '#8f2a06'), 1.0, 1.0, 24.0, 24.0)
    $g.FillEllipse((B '#e8521a'), 2.4, 2.4, 21.2, 21.2)
    $g.FillEllipse((B '#ff8c2b'), 6.0, 5.4, 12.0, 12.0)
    $g.FillEllipse((B '#ffd24d'), 9.0, 8.4, 6.4, 6.4)
}
Save-Sprite -Category projectiles -Name rocket -Size 32 -Palette @('#46301c','#6e4a2b','#8a5f38','#f2eede','#241509') -Draw {
    param($g)
    $g.FillEllipse((B '#46301c'), 1.0, 1.0, 30.0, 30.0)
    $g.FillEllipse((B '#6e4a2b'), 2.4, 2.4, 27.2, 27.2)
    $g.FillEllipse((B '#8a5f38'), 6.0, 5.0, 9.0, 9.0)
    $g.FillEllipse((B '#f2eede'), 8.5, 8.0, 15.0, 15.0)          # skull
    $g.FillRectangle((B '#f2eede'), 12.0, 21.0, 8.0, 5.0)
    $g.FillEllipse((B '#241509'), 11.5, 12.5, 4.2, 4.2)
    $g.FillEllipse((B '#241509'), 17.5, 12.5, 4.2, 4.2)
}

# Arrows volley
Save-Sprite -Category projectiles -Name arrows -Size 24 -Palette @('#4a3018','#6b4423','#caa15a','#d9d9d9') -Draw {
    param($g)
    foreach ($x in 4, 11, 18) {
        $g.DrawLine((P '#6b4423' 2.0), $x, 3.0, ($x-1), 17.0)
        $g.FillEllipse((B '#d9d9d9'), ($x-2.5), 16.0, 4.0, 5.0)
        $g.DrawLine((P '#caa15a' 1.0), $x, 4.0, ($x-0.5), 9.0)
    }
}

Write-Output "effects:"

# Explosion burst — the flash + expanding ring + radial sparks
Save-Sprite -Category effects -Name explosion-burst -Size 48 -Palette @('#8f2a06','#ff4500','#ffb03a','#ffe680','#ffffff') -Draw {
    param($g)
    $g.FillEllipse((B '#ff4500'), 8.0, 8.0, 32.0, 32.0)
    $g.FillEllipse((B '#ffb03a'), 13.0, 13.0, 22.0, 22.0)
    $g.FillEllipse((B '#ffe680'), 18.0, 18.0, 12.0, 12.0)
    $g.DrawEllipse((P '#ffffff' 2.6), 3.0, 3.0, 42.0, 42.0)
    for ($i = 0; $i -lt 6; $i++) {
        $a = $i * [Math]::PI / 3 + 0.35
        $x1 = 24 + [Math]::Cos($a) * 20; $y1 = 24 + [Math]::Sin($a) * 20
        $x2 = 24 + [Math]::Cos($a) * 25; $y2 = 24 + [Math]::Sin($a) * 25
        $g.DrawLine((P '#ffffff' 2.2), $x1, $y1, $x2, $y2)
    }
}

# Shockwave ring (Mega Knight slam / Royal Giant evo)
Save-Sprite -Category effects -Name shockwave -Size 48 -Palette @('#6f8296','#b8cadc','#e8f2fb') -Draw {
    param($g)
    $g.DrawEllipse((P '#6f8296' 4.0), 4.0, 4.0, 40.0, 40.0)
    $g.DrawEllipse((P '#e8f2fb' 2.0), 6.0, 6.0, 36.0, 36.0)
    $g.DrawEllipse((P '#b8cadc' 2.0), 12.0, 12.0, 24.0, 24.0)
}

# Valkyrie's 360 spin sweep
Save-Sprite -Category effects -Name spin-sweep -Size 40 -Palette @('#8a6033','#d8a45e','#ffe3b8','#cfd8de') -Draw {
    param($g)
    $g.DrawArc((P '#ffe3b8' 5.0), 4.0, 4.0, 32.0, 32.0, 200, 150)
    $g.DrawArc((P '#d8a45e' 3.0), 4.0, 4.0, 32.0, 32.0, 130, 70)
    $g.FillRectangle((B '#8a6033'), 30.0, 12.0, 4.0, 12.0)
    $g.FillRectangle((B '#cfd8de'), 28.0, 9.0, 8.0, 6.0)
}

# Zap strike — forked bolt with a glow at the strike point
Save-Sprite -Category effects -Name zap-strike -Size 32 -Palette @('#2b7fa0','#4f9bff','#7fdcff','#eaffff','#ffffff') -Draw {
    param($g)
    $g.DrawLine((P '#7fdcff' 4.0), 16.0, 1.0, 13.0, 11.0)
    $g.DrawLine((P '#7fdcff' 4.0), 13.0, 11.0, 19.0, 15.0)
    $g.DrawLine((P '#7fdcff' 4.0), 19.0, 15.0, 15.0, 24.0)
    $g.DrawLine((P '#ffffff' 1.6), 16.0, 2.0, 13.5, 11.0)
    $g.DrawLine((P '#ffffff' 1.6), 13.5, 11.0, 18.5, 15.0)
    $g.DrawLine((P '#ffffff' 1.6), 18.5, 15.0, 15.0, 23.0)
    $g.DrawLine((P '#4f9bff' 2.0), 8.0, 6.0, 11.0, 13.0)
    $g.DrawLine((P '#4f9bff' 2.0), 24.0, 6.0, 21.0, 13.0)
    $g.FillEllipse((B '#eaffff'), 10.0, 21.0, 12.0, 9.0)
}
Save-Sprite -Category effects -Name zap-strike-evo -Size 32 -Palette @('#6b2b9c','#a24fd8','#d98cff','#f2d9ff','#ffffff') -Draw {
    param($g)
    $g.DrawLine((P '#d98cff' 4.0), 16.0, 1.0, 13.0, 11.0)
    $g.DrawLine((P '#d98cff' 4.0), 13.0, 11.0, 19.0, 15.0)
    $g.DrawLine((P '#d98cff' 4.0), 19.0, 15.0, 15.0, 24.0)
    $g.DrawLine((P '#ffffff' 1.6), 16.0, 2.0, 13.5, 11.0)
    $g.DrawLine((P '#ffffff' 1.6), 13.5, 11.0, 18.5, 15.0)
    $g.DrawLine((P '#a24fd8' 2.0), 8.0, 6.0, 11.0, 13.0)
    $g.DrawLine((P '#a24fd8' 2.0), 24.0, 6.0, 21.0, 13.0)
    $g.FillEllipse((B '#f2d9ff'), 10.0, 21.0, 12.0, 9.0)
}

# Electro chain — one jagged link of the current
Save-Sprite -Category effects -Name chain-lightning -Size 40 -Palette @('#2b6fc4','#4f9bff','#9fd4ff','#eaffff') -Draw {
    param($g)
    $g.DrawLine((P '#4f9bff' 4.0), 2.0, 20.0, 11.0, 13.0)
    $g.DrawLine((P '#4f9bff' 4.0), 11.0, 13.0, 20.0, 26.0)
    $g.DrawLine((P '#4f9bff' 4.0), 20.0, 26.0, 29.0, 14.0)
    $g.DrawLine((P '#4f9bff' 4.0), 29.0, 14.0, 38.0, 20.0)
    $g.DrawLine((P '#eaffff' 1.6), 2.0, 20.0, 11.0, 13.0)
    $g.DrawLine((P '#eaffff' 1.6), 11.0, 13.0, 20.0, 26.0)
    $g.DrawLine((P '#eaffff' 1.6), 20.0, 26.0, 29.0, 14.0)
    $g.DrawLine((P '#eaffff' 1.6), 29.0, 14.0, 38.0, 20.0)
    $g.DrawLine((P '#9fd4ff' 2.0), 11.0, 13.0, 8.0, 6.0)
    $g.DrawLine((P '#9fd4ff' 2.0), 29.0, 14.0, 33.0, 7.0)
}

# Ice nova (Ice Golem death) and the freeze area
Save-Sprite -Category effects -Name ice-nova -Size 40 -Palette @('#4a86a8','#87cefa','#c8ecff','#ffffff') -Draw {
    param($g)
    $g.FillEllipse((B '#87cefa'), 2.0, 2.0, 36.0, 36.0)
    $g.FillEllipse((B '#c8ecff'), 8.0, 8.0, 24.0, 24.0)
    $g.DrawEllipse((P '#ffffff' 2.4), 3.0, 3.0, 34.0, 34.0)
    for ($i = 0; $i -lt 6; $i++) {
        $a = $i * [Math]::PI / 3
        $g.DrawLine((P '#ffffff' 2.0), (20 + [Math]::Cos($a)*7), (20 + [Math]::Sin($a)*7), (20 + [Math]::Cos($a)*16), (20 + [Math]::Sin($a)*16))
    }
}
Save-Sprite -Category effects -Name freeze-area -Size 48 -Palette @('#5a93b8','#8fd0ee','#bfe8ff','#eaf7ff') -Draw {
    param($g)
    $g.FillEllipse((B '#8fd0ee'), 1.0, 1.0, 46.0, 46.0)
    $g.FillEllipse((B '#bfe8ff'), 8.0, 8.0, 32.0, 32.0)
    $g.DrawEllipse((P '#eaf7ff' 2.6), 2.0, 2.0, 44.0, 44.0)
    for ($i = 0; $i -lt 6; $i++) {
        $a = $i * [Math]::PI / 3
        $g.DrawLine((P '#eaf7ff' 2.4), 24, 24, (24 + [Math]::Cos($a)*16), (24 + [Math]::Sin($a)*16))
    }
}

# Poison, rage and heal zones (the spell areas)
Save-Sprite -Category effects -Name poison-cloud -Size 48 -Palette @('#2f5c22','#4f8a34','#7ab84a','#a8dc74') -Draw {
    param($g)
    $g.FillEllipse((B '#4f8a34'), 1.0, 1.0, 46.0, 46.0)
    $g.FillEllipse((B '#7ab84a'), 7.0, 9.0, 20.0, 20.0)
    $g.FillEllipse((B '#7ab84a'), 24.0, 18.0, 18.0, 18.0)
    $g.FillEllipse((B '#a8dc74'), 15.0, 6.0, 14.0, 14.0)
    $g.DrawEllipse((P '#2f5c22' 2.2), 2.0, 2.0, 44.0, 44.0)
}
Save-Sprite -Category effects -Name rage-zone -Size 48 -Palette @('#8a2f6b','#d94f9c','#ff8ec6','#ffc4e2') -Draw {
    param($g)
    $g.FillEllipse((B '#d94f9c'), 1.0, 1.0, 46.0, 46.0)
    $g.FillEllipse((B '#ff8ec6'), 8.0, 8.0, 32.0, 32.0)
    $g.FillEllipse((B '#ffc4e2'), 16.0, 14.0, 14.0, 14.0)
    $g.DrawEllipse((P '#8a2f6b' 2.4), 2.0, 2.0, 44.0, 44.0)
}
Save-Sprite -Category effects -Name heal-zone -Size 40 -Palette @('#2c6b3a','#4fb063','#8fe0a0','#d8f7e0') -Draw {
    param($g)
    $g.DrawEllipse((P '#4fb063' 4.0), 3.0, 3.0, 34.0, 34.0)
    $g.DrawEllipse((P '#8fe0a0' 2.0), 6.0, 6.0, 28.0, 28.0)
    $g.FillRectangle((B '#d8f7e0'), 17.0, 11.0, 6.0, 18.0)
    $g.FillRectangle((B '#d8f7e0'), 11.0, 17.0, 18.0, 6.0)
}

# Electric ring (evo zap) and the spectral phantom burst (evo lumberjack)
Save-Sprite -Category effects -Name electric-ring -Size 44 -Palette @('#6b2b9c','#a24fd8','#d98cff','#f7e6ff') -Draw {
    param($g)
    $g.DrawEllipse((P '#a24fd8' 4.0), 3.0, 3.0, 38.0, 38.0)
    $g.DrawEllipse((P '#f7e6ff' 1.8), 5.0, 5.0, 34.0, 34.0)
    for ($i = 0; $i -lt 8; $i++) {
        $a = $i * [Math]::PI / 4
        $g.DrawLine((P '#d98cff' 2.2), (22 + [Math]::Cos($a)*17), (22 + [Math]::Sin($a)*17), (22 + [Math]::Cos($a)*21), (22 + [Math]::Sin($a)*21))
    }
}
Save-Sprite -Category effects -Name phantom-burst -Size 40 -Palette @('#3f5a6b','#7fa8bf','#c8e4f2','#ffffff') -Draw {
    param($g)
    $g.DrawEllipse((P '#7fa8bf' 3.4), 4.0, 4.0, 32.0, 32.0)
    $g.DrawEllipse((P '#c8e4f2' 1.6), 9.0, 9.0, 22.0, 22.0)
    $g.FillEllipse((B '#ffffff'), 17.0, 17.0, 6.0, 6.0)
}

# Death bomb (Bomb Tower / Goblin Demolisher), fuse lit
Save-Sprite -Category effects -Name death-bomb -Size 24 -Palette @('#141619','#2b2f36','#4a4e55','#6b5a2e','#ffb63c') -Draw {
    param($g)
    $g.FillEllipse((B '#141619'), 2.0, 5.0, 20.0, 18.0)
    $g.FillEllipse((B '#2b2f36'), 3.2, 6.2, 17.6, 15.6)
    $g.FillEllipse((B '#4a4e55'), 6.0, 8.4, 5.6, 4.6)
    $g.DrawLine((P '#6b5a2e' 2.0), 12.0, 5.0, 16.0, 1.6)
    $g.FillEllipse((B '#ffb63c'), 15.0, 0.4, 3.6, 3.6)
}

# The fall-over corpse (the flattened, fading body a dying unit leaves)
Save-Sprite -Category effects -Name corpse-fade -Size 24 -Palette @('#4a4a48','#6e6e6a','#8d8b7d') -Draw {
    param($g)
    $g.FillEllipse((B '#4a4a48'), 1.0, 8.0, 22.0, 8.0)
    $g.FillEllipse((B '#6e6e6a'), 2.4, 9.0, 19.2, 6.0)
    $g.FillEllipse((B '#8d8b7d'), 6.0, 10.0, 8.0, 3.0)
}

# The deploy clock that ticks down over a just-placed unit
Save-Sprite -Category effects -Name deploy-clock -Size 24 -Palette @('#1c2630','#42566b','#c8d8e8','#ffffff') -Draw {
    param($g)
    $g.FillEllipse((B '#1c2630'), 1.0, 1.0, 22.0, 22.0)
    $g.FillEllipse((B '#c8d8e8'), 2.6, 2.6, 18.8, 18.8)
    $g.FillPie((B '#42566b'), 2.6, 2.6, 18.8, 18.8, -90, 250)
    $g.DrawLine((P '#1c2630' 1.6), 12.0, 12.0, 12.0, 4.5)
    $g.DrawLine((P '#1c2630' 1.6), 12.0, 12.0, 17.5, 12.0)
}

# Evolution gem (the purple crystal on evolved units)
Save-Sprite -Category effects -Name evo-gem -Size 16 -Palette @('#5c1a8a','#9a3fd8','#c45cff','#f0c4ff') -Draw {
    param($g)
    $pts = @( (New-Object System.Drawing.PointF(8,0.8)), (New-Object System.Drawing.PointF(15.2,8)),
              (New-Object System.Drawing.PointF(8,15.2)), (New-Object System.Drawing.PointF(0.8,8)) )
    $g.FillPolygon((B '#5c1a8a'), $pts)
    $pts2 = @( (New-Object System.Drawing.PointF(8,2.6)), (New-Object System.Drawing.PointF(13.4,8)),
               (New-Object System.Drawing.PointF(8,13.4)), (New-Object System.Drawing.PointF(2.6,8)) )
    $g.FillPolygon((B '#c45cff'), $pts2)
    $g.FillEllipse((B '#f0c4ff'), 5.4, 5.0, 3.6, 3.2)
}

# Elixir drop
Save-Sprite -Category effects -Name elixir-drop -Size 16 -Palette @('#5a1a63','#a83bbd','#e05fe8','#f7b8fb') -Draw {
    param($g)
    $pts = @( (New-Object System.Drawing.PointF(8,1.0)), (New-Object System.Drawing.PointF(14.0,9.0)),
              (New-Object System.Drawing.PointF(8,15.0)), (New-Object System.Drawing.PointF(2.0,9.0)) )
    $g.FillPolygon((B '#5a1a63'), $pts)
    $pts2 = @( (New-Object System.Drawing.PointF(8,3.0)), (New-Object System.Drawing.PointF(12.4,9.0)),
               (New-Object System.Drawing.PointF(8,13.2)), (New-Object System.Drawing.PointF(3.6,9.0)) )
    $g.FillPolygon((B '#e05fe8'), $pts2)
    $g.FillEllipse((B '#f7b8fb'), 5.6, 6.2, 3.2, 3.4)
}

# Placement ghost: the white "you can drop here" ring, and the red "you can't"
Save-Sprite -Category effects -Name place-ghost-ok -Size 32 -Palette @('#7f8f9f','#ffffff') -Draw {
    param($g)
    $g.DrawEllipse((P '#ffffff' 3.0), 2.0, 2.0, 28.0, 28.0)
    $g.DrawEllipse((P '#7f8f9f' 1.4), 8.0, 8.0, 16.0, 16.0)
}
Save-Sprite -Category effects -Name place-ghost-blocked -Size 32 -Palette @('#8f2f2f','#ff5a5a','#ffb0b0') -Draw {
    param($g)
    $g.DrawEllipse((P '#ff5a5a' 3.0), 2.0, 2.0, 28.0, 28.0)
    $g.DrawLine((P '#ffb0b0' 3.0), 8.0, 8.0, 24.0, 24.0)
    $g.DrawLine((P '#ffb0b0' 3.0), 24.0, 8.0, 8.0, 24.0)
}
