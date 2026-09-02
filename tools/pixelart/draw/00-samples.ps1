. (Join-Path $PSScriptRoot ".." | Join-Path -ChildPath "_lib.ps1")

# =============================== TROOPS ======================================

# Knight — steel helmet + shield, seen 3/4 from above
Save-Sprite -Category troops -Name knight -Size 16 -Palette ($STEEL + '#7a2f2f') -Draw {
    param($g)
    $dark = B '#20242b'; $mid = B '#4a5666'; $lit = B '#8fa3b8'; $hi = B '#d7e3f0'; $red = B '#7a2f2f'
    $g.FillEllipse($dark, 3.2, 3.2, 9.6, 10.4)      # body silhouette
    $g.FillEllipse($mid,  4.0, 4.0, 8.0, 9.0)       # armour
    $g.FillEllipse($lit,  4.6, 4.4, 6.8, 5.4)       # helmet dome
    $g.FillEllipse($hi,   5.6, 5.0, 3.2, 2.2)       # helmet shine
    $g.FillRectangle($dark, 5.8, 7.4, 4.4, 1.5)     # visor slit
    $g.FillEllipse($red,  4.2, 10.2, 7.6, 3.4)      # tunic
    $g.FillEllipse($lit,  2.0, 8.6, 3.6, 4.6)       # shield
    $g.FillEllipse($hi,   2.6, 9.4, 2.2, 2.6)
}

# Giant — big orange-tan bruiser filling the frame
Save-Sprite -Category troops -Name giant -Size 16 -Palette @('#5a3418','#a9713c','#e0a469','#f6d3a4','#6b4a8a') -Draw {
    param($g)
    $dark = B '#5a3418'; $mid = B '#a9713c'; $lit = B '#e0a469'; $hi = B '#f6d3a4'; $belt = B '#6b4a8a'
    $g.FillEllipse($dark, 1.2, 2.0, 13.6, 13.0)
    $g.FillEllipse($mid,  2.0, 2.8, 12.0, 11.6)
    $g.FillEllipse($lit,  3.0, 3.4, 10.0, 6.4)      # chest/shoulders
    $g.FillEllipse($hi,   5.0, 3.0, 6.0, 4.2)       # head
    $g.FillRectangle($dark, 6.0, 4.6, 1.6, 1.6)     # eyes
    $g.FillRectangle($dark, 8.6, 4.6, 1.6, 1.6)
    $g.FillRectangle($belt, 2.6, 10.4, 10.8, 2.4)   # belt
}

# Archers — pink hood + bow
Save-Sprite -Category troops -Name archers -Size 16 -Palette @('#3a1f33','#8c4f7a','#c98fb0','#f0cfe0','#7a5230') -Draw {
    param($g)
    $dark = B '#3a1f33'; $mid = B '#8c4f7a'; $lit = B '#c98fb0'; $hi = B '#f0cfe0'; $wood = P '#7a5230' 1.3
    $g.FillEllipse($dark, 4.0, 3.0, 8.4, 11.0)
    $g.FillEllipse($mid,  4.8, 3.8, 7.0, 9.6)
    $g.FillEllipse($lit,  5.4, 4.0, 5.6, 5.0)       # hood
    $g.FillEllipse($hi,   6.6, 5.2, 3.0, 2.6)       # face
    $g.DrawArc($wood, 1.6, 3.4, 4.6, 9.0, -70, 140) # bow
    $g.DrawLine((P '#e8e4d8' 0.8), 3.0, 8.2, 9.0, 8.2)
}

# Skeletons — little bone figure
Save-Sprite -Category troops -Name skeletons -Size 16 -Palette $BONE -Draw {
    param($g)
    $dark = B '#2b2b28'; $mid = B '#8d8b7d'; $lit = B '#d8d5c2'; $hi = B '#f4f2e6'
    $g.FillEllipse($dark, 4.2, 2.6, 7.6, 7.4)       # skull outline
    $g.FillEllipse($lit,  4.8, 3.2, 6.4, 6.2)
    $g.FillEllipse($hi,   5.6, 3.6, 3.4, 2.8)
    $g.FillEllipse($dark, 6.0, 5.6, 1.8, 2.0)       # eye sockets
    $g.FillEllipse($dark, 8.4, 5.6, 1.8, 2.0)
    $g.FillRectangle($lit, 6.8, 9.6, 2.4, 3.6)      # spine
    $g.FillRectangle($lit, 4.4, 10.4, 7.2, 1.1)     # ribs
    $g.FillRectangle($lit, 5.0, 12.2, 6.0, 1.1)
}

# ============================== BUILDINGS ====================================

# Cannon — round wooden base with a barrel pointing up-screen
Save-Sprite -Category buildings -Name cannon -Size 24 -Palette @('#3a2410','#6b4423','#a06a34','#c99257','#26282c','#4a4e55') -Draw {
    param($g)
    $dk = B '#3a2410'; $wd = B '#6b4423'; $wl = B '#a06a34'; $wh = B '#c99257'
    $mt = B '#26282c'; $ml = B '#4a4e55'
    $g.FillEllipse($dk, 1.5, 5.0, 21.0, 17.0)       # base
    $g.FillEllipse($wd, 2.5, 6.0, 19.0, 15.0)
    $g.FillEllipse($wl, 4.0, 7.2, 16.0, 11.0)
    $g.DrawLine((P '#3a2410' 1.1), 4.5, 12.0, 19.5, 12.0)   # plank seams
    $g.DrawLine((P '#3a2410' 1.1), 5.5, 16.0, 18.5, 16.0)
    $g.FillEllipse($ml, 7.0, 8.0, 10.0, 10.0)       # turret
    $g.FillRectangle($mt, 10.0, 1.5, 4.0, 9.0)      # barrel
    $g.FillRectangle($ml, 10.4, 2.0, 1.4, 8.0)      # barrel highlight
    $g.FillEllipse($mt, 9.6, 0.8, 4.8, 3.4)         # muzzle
}

# =============================== TOWERS ======================================

# Princess tower (blue)
Save-Sprite -Category towers -Name princess-tower-blue -Size 32 -Palette @('#123a63','#2b5f9e','#4f8fe0','#9fc8f5','#2b2f36','#565d68') -Draw {
    param($g)
    $dk = B '#123a63'; $md = B '#2b5f9e'; $lt = B '#4f8fe0'; $hi = B '#9fc8f5'
    $gun = B '#2b2f36'; $gunL = B '#565d68'
    $g.FillRectangle($dk, 3, 6, 26, 24)             # keep
    $g.FillRectangle($md, 5, 8, 22, 21)
    $g.FillRectangle($lt, 6, 9, 20, 12)             # lit top face
    $g.FillRectangle($hi, 7, 10, 8, 4)              # highlight
    for ($i = 0; $i -lt 4; $i++) {                  # battlements
        $g.FillRectangle($dk, (4 + $i * 6.5), 3.0, 4.5, 5.0)
        $g.FillRectangle($md, (4.6 + $i * 6.5), 3.6, 3.3, 4.0)
    }
    $g.FillEllipse($gun, 10, 13, 12, 12)            # turret
    $g.FillEllipse($gunL, 12, 15, 8, 8)
    $g.FillRectangle($gun, 14.5, 5, 3, 10)          # barrel
}

# ================================= UI ========================================

Save-Sprite -Category ui -Name button-green -Size 16 -Palette @('#1d5c2c','#2e8b45','#4cc267','#8ee8a0') -Draw {
    param($g)
    $dk = B '#1d5c2c'; $md = B '#2e8b45'; $lt = B '#4cc267'; $hi = B '#8ee8a0'
    $g.FillEllipse($dk, 0.0, 1.0, 16.0, 14.0)
    $g.FillEllipse($md, 0.8, 1.8, 14.4, 12.0)
    $g.FillEllipse($lt, 1.4, 2.4, 13.2, 7.0)
    $g.FillEllipse($hi, 3.0, 3.0, 9.0, 3.0)
}

Save-Sprite -Category ui -Name elixir-drop -Size 16 -Palette @('#5a1a63','#a83bbd','#e05fe8','#f7b8fb') -Draw {
    param($g)
    $dk = B '#5a1a63'; $md = B '#a83bbd'; $lt = B '#e05fe8'; $hi = B '#f7b8fb'
    $pts = @( (New-Object System.Drawing.PointF(8,1.5)),
              (New-Object System.Drawing.PointF(13.5,9)),
              (New-Object System.Drawing.PointF(8,14.5)),
              (New-Object System.Drawing.PointF(2.5,9)) )
    $g.FillPolygon($dk, $pts)
    $pts2 = @( (New-Object System.Drawing.PointF(8,3.0)),
               (New-Object System.Drawing.PointF(12.2,9)),
               (New-Object System.Drawing.PointF(8,13.0)),
               (New-Object System.Drawing.PointF(3.8,9)) )
    $g.FillPolygon($md, $pts2)
    $g.FillEllipse($lt, 5.4, 6.0, 4.2, 5.0)
    $g.FillEllipse($hi, 6.0, 6.4, 2.0, 2.4)
}

# ================================ MAP ========================================

Save-Sprite -Category map -Name tile-ocean -Size 16 -Opaque -Palette @('#256a8a','#2e7da0','#3a92b8','#4aa7cc') -Draw {
    param($g)
    $g.FillRectangle((B '#2e7da0'), 0, 0, 16, 16)
    $g.FillRectangle((B '#256a8a'), 0, 6, 16, 3)
    $g.FillRectangle((B '#3a92b8'), 0, 11, 16, 2)
    $g.FillEllipse((B '#4aa7cc'), 2, 2, 5, 1.6)
    $g.FillEllipse((B '#4aa7cc'), 9, 13, 5, 1.6)
}

Save-Sprite -Category map -Name tile-bridge-wood -Size 16 -Opaque -Palette @('#5c3a18','#7a5228','#9c6b3a','#b98a52') -Draw {
    param($g)
    $g.FillRectangle((B '#9c6b3a'), 0, 0, 16, 16)
    $p = P '#5c3a18' 1.0
    foreach ($y in 0, 4, 8, 12) { $g.DrawLine($p, 0, $y, 16, $y) }
    $g.FillRectangle((B '#b98a52'), 0, 1, 16, 2)
    $g.FillRectangle((B '#7a5228'), 0, 9, 16, 2)
}

