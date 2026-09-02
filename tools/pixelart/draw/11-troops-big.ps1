. (Join-Path $PSScriptRoot ".." | Join-Path -ChildPath "_lib.ps1")

# Royal Giant — orange-tan bruiser with a dark cannon slung across his body
Save-Sprite -Category troops -Name royal-giant -Size 16 -Palette @('#5a3418','#a9713c','#e0a469','#f6d3a4','#26282c','#5a626e') -Draw {
    param($g)
    $dk = B '#5a3418'; $md = B '#a9713c'; $lt = B '#e0a469'; $hi = B '#f6d3a4'
    $gun = B '#26282c'; $gunL = B '#5a626e'
    $g.FillEllipse($dk, 1.4, 2.2, 13.2, 12.8)          # bulk
    $g.FillEllipse($md, 2.2, 3.0, 11.6, 11.4)
    $g.FillEllipse($lt, 3.2, 3.6, 9.6, 6.0)            # chest / shoulders
    $g.FillEllipse($hi, 5.2, 2.6, 5.6, 4.4)            # head
    $g.FillRectangle($dk, 6.2, 4.4, 1.5, 1.5)          # eyes
    $g.FillRectangle($dk, 8.6, 4.4, 1.5, 1.5)
    $barrel = @( (New-Object System.Drawing.PointF(1.8, 10.7)),
                 (New-Object System.Drawing.PointF(2.6, 7.7)),
                 (New-Object System.Drawing.PointF(13.2, 10.7)),
                 (New-Object System.Drawing.PointF(12.4, 13.7)) )
    $g.FillPolygon($gun, $barrel)                      # cannon
    $g.FillEllipse($gun, 0.4, 7.2, 4.0, 4.0)           # muzzle
    $g.DrawLine((P '#5a626e' 1.0), 3.8, 9.2, 11.8, 11.4)
}

# Electro Giant — teal bruiser with a crackling chest coil
Save-Sprite -Category troops -Name electro-giant -Size 16 -Palette @('#0d2f38','#1d6470','#31a0aa','#7fd8de','#f7ef9a') -Draw {
    param($g)
    $dk = B '#0d2f38'; $md = B '#1d6470'; $lt = B '#31a0aa'; $hi = B '#7fd8de'
    $g.FillEllipse($dk, 1.4, 2.2, 13.2, 12.8)
    $g.FillEllipse($md, 2.2, 3.0, 11.6, 11.4)
    $g.FillEllipse($lt, 3.2, 3.4, 9.6, 5.8)            # shoulders
    $g.FillEllipse($hi, 5.2, 2.4, 5.6, 4.4)            # head
    $g.FillRectangle($dk, 6.2, 4.2, 1.5, 1.5)          # eyes
    $g.FillRectangle($dk, 8.6, 4.2, 1.5, 1.5)
    $g.FillEllipse($dk, 4.2, 8.0, 7.6, 6.8)            # coil housing
    $g.DrawEllipse((P '#7fd8de' 1.3), 5.4, 9.0, 5.2, 4.8)
    $bolt = P '#f7ef9a' 1.1
    $g.DrawLine($bolt, 8.8, 9.6, 7.0, 11.6)            # spark
    $g.DrawLine($bolt, 7.0, 11.6, 9.0, 11.4)
    $g.DrawLine($bolt, 9.0, 11.4, 7.4, 13.4)
}

# Golem — heavy cracked grey rock
Save-Sprite -Category troops -Name golem -Size 16 -Palette @('#23262b','#414750','#666e79','#8f98a4','#bcc4cf') -Draw {
    param($g)
    $dk = B '#23262b'; $md = B '#414750'; $lt = B '#666e79'; $hi = B '#8f98a4'; $tp = B '#bcc4cf'
    $body = @( (New-Object System.Drawing.PointF(2.2, 14.8)),
               (New-Object System.Drawing.PointF(1.4, 7.0)),
               (New-Object System.Drawing.PointF(4.2, 2.8)),
               (New-Object System.Drawing.PointF(8.0, 1.6)),
               (New-Object System.Drawing.PointF(12.2, 3.2)),
               (New-Object System.Drawing.PointF(14.6, 7.2)),
               (New-Object System.Drawing.PointF(13.8, 14.8)) )
    $g.FillPolygon($dk, $body)
    $inner = @( (New-Object System.Drawing.PointF(3.2, 14.2)),
                (New-Object System.Drawing.PointF(2.6, 7.4)),
                (New-Object System.Drawing.PointF(5.0, 3.9)),
                (New-Object System.Drawing.PointF(8.0, 2.9)),
                (New-Object System.Drawing.PointF(11.6, 4.3)),
                (New-Object System.Drawing.PointF(13.6, 7.6)),
                (New-Object System.Drawing.PointF(12.8, 14.2)) )
    $g.FillPolygon($md, $inner)
    $face = @( (New-Object System.Drawing.PointF(4.0, 7.8)),
               (New-Object System.Drawing.PointF(5.4, 4.4)),
               (New-Object System.Drawing.PointF(8.0, 3.8)),
               (New-Object System.Drawing.PointF(10.8, 4.6)),
               (New-Object System.Drawing.PointF(12.0, 7.8)) )
    $g.FillPolygon($lt, $face)
    $shine = @( (New-Object System.Drawing.PointF(5.6, 6.6)),
                (New-Object System.Drawing.PointF(6.6, 4.8)),
                (New-Object System.Drawing.PointF(8.6, 4.6)),
                (New-Object System.Drawing.PointF(8.2, 6.6)) )
    $g.FillPolygon($hi, $shine)
    $g.FillRectangle($tp, 5.8, 8.6, 1.6, 1.4)          # glinting eyes
    $g.FillRectangle($tp, 8.6, 8.6, 1.6, 1.4)
    $ck = P '#23262b' 1.0
    $g.DrawLine($ck, 8.0, 10.6, 6.2, 14.2)             # cracks
    $g.DrawLine($ck, 9.0, 11.4, 11.6, 13.4)
}

# Golemite — the small grey rock split
Save-Sprite -Category troops -Name golemite -Size 16 -Palette @('#23262b','#414750','#666e79','#8f98a4','#bcc4cf') -Draw {
    param($g)
    $dk = B '#23262b'; $md = B '#414750'; $lt = B '#666e79'; $hi = B '#8f98a4'; $tp = B '#bcc4cf'
    $body = @( (New-Object System.Drawing.PointF(3.0, 14.8)),
               (New-Object System.Drawing.PointF(2.4, 9.2)),
               (New-Object System.Drawing.PointF(4.6, 5.8)),
               (New-Object System.Drawing.PointF(8.0, 4.8)),
               (New-Object System.Drawing.PointF(11.4, 6.0)),
               (New-Object System.Drawing.PointF(13.4, 9.4)),
               (New-Object System.Drawing.PointF(12.8, 14.8)) )
    $g.FillPolygon($dk, $body)
    $inner = @( (New-Object System.Drawing.PointF(3.9, 14.2)),
                (New-Object System.Drawing.PointF(3.5, 9.5)),
                (New-Object System.Drawing.PointF(5.4, 6.8)),
                (New-Object System.Drawing.PointF(8.0, 6.0)),
                (New-Object System.Drawing.PointF(10.8, 7.0)),
                (New-Object System.Drawing.PointF(12.4, 9.7)),
                (New-Object System.Drawing.PointF(11.9, 14.2)) )
    $g.FillPolygon($md, $inner)
    $face = @( (New-Object System.Drawing.PointF(4.6, 10.0)),
               (New-Object System.Drawing.PointF(5.8, 7.4)),
               (New-Object System.Drawing.PointF(8.0, 6.8)),
               (New-Object System.Drawing.PointF(10.4, 7.6)),
               (New-Object System.Drawing.PointF(11.4, 10.0)) )
    $g.FillPolygon($lt, $face)
    $g.FillEllipse($hi, 5.8, 7.6, 2.6, 1.8)
    $g.FillRectangle($tp, 6.0, 10.4, 1.4, 1.3)
    $g.FillRectangle($tp, 8.6, 10.4, 1.4, 1.3)
    $g.DrawLine((P '#23262b' 0.9), 8.0, 12.2, 6.6, 14.4)
}

# Ice Golem — pale ice-blue rock
Save-Sprite -Category troops -Name ice-golem -Size 16 -Palette @('#153a55','#2b6d99','#4f9fd0','#8fd0ee','#dff4ff') -Draw {
    param($g)
    $dk = B '#153a55'; $md = B '#2b6d99'; $lt = B '#4f9fd0'; $hi = B '#8fd0ee'; $wh = B '#dff4ff'
    $body = @( (New-Object System.Drawing.PointF(2.6, 14.8)),
               (New-Object System.Drawing.PointF(1.8, 8.0)),
               (New-Object System.Drawing.PointF(4.4, 3.4)),
               (New-Object System.Drawing.PointF(8.0, 2.0)),
               (New-Object System.Drawing.PointF(11.8, 3.6)),
               (New-Object System.Drawing.PointF(14.2, 8.2)),
               (New-Object System.Drawing.PointF(13.4, 14.8)) )
    $g.FillPolygon($dk, $body)
    $inner = @( (New-Object System.Drawing.PointF(3.5, 14.2)),
                (New-Object System.Drawing.PointF(2.9, 8.4)),
                (New-Object System.Drawing.PointF(5.1, 4.5)),
                (New-Object System.Drawing.PointF(8.0, 3.3)),
                (New-Object System.Drawing.PointF(11.2, 4.7)),
                (New-Object System.Drawing.PointF(13.2, 8.6)),
                (New-Object System.Drawing.PointF(12.5, 14.2)) )
    $g.FillPolygon($md, $inner)
    $facet = @( (New-Object System.Drawing.PointF(4.2, 9.0)),
                (New-Object System.Drawing.PointF(5.6, 5.0)),
                (New-Object System.Drawing.PointF(8.0, 4.2)),
                (New-Object System.Drawing.PointF(10.6, 5.2)),
                (New-Object System.Drawing.PointF(11.8, 9.0)) )
    $g.FillPolygon($lt, $facet)
    $shard = @( (New-Object System.Drawing.PointF(5.8, 8.0)),
                (New-Object System.Drawing.PointF(7.0, 4.8)),
                (New-Object System.Drawing.PointF(8.8, 5.0)),
                (New-Object System.Drawing.PointF(8.0, 8.2)) )
    $g.FillPolygon($hi, $shard)
    $g.FillRectangle($wh, 5.8, 9.6, 1.6, 1.4)          # frosty eyes
    $g.FillRectangle($wh, 8.6, 9.6, 1.6, 1.4)
    $g.DrawLine((P '#dff4ff' 0.9), 11.0, 6.0, 12.4, 9.4)
}

# Elixir Golem — glossy magenta blob-golem
Save-Sprite -Category troops -Name elixir-golem -Size 16 -Palette @('#4a1358','#8e2ba8','#c94ad8','#ef86f0','#fbd4fb') -Draw {
    param($g)
    $dk = B '#4a1358'; $md = B '#8e2ba8'; $lt = B '#c94ad8'; $hi = B '#ef86f0'; $wh = B '#fbd4fb'
    $g.FillEllipse($dk, 1.4, 4.2, 13.2, 10.8)          # body
    $g.FillEllipse($dk, 4.0, 1.0, 8.0, 6.8)            # head
    $g.FillEllipse($md, 2.3, 5.1, 11.4, 9.2)
    $g.FillEllipse($md, 4.8, 1.9, 6.4, 5.4)
    $g.FillEllipse($lt, 3.4, 5.6, 9.4, 4.6)            # glossy band
    $g.FillEllipse($hi, 5.4, 2.6, 3.2, 2.2)            # head shine
    $g.FillEllipse($wh, 6.0, 3.0, 1.6, 1.2)
    $g.FillEllipse($hi, 4.4, 6.2, 3.0, 2.0)            # body shine
    $g.FillRectangle($dk, 5.8, 4.4, 1.4, 1.4)          # eyes
    $g.FillRectangle($dk, 8.8, 4.4, 1.4, 1.4)
}

# Elixir Golemite — half-size magenta blob
Save-Sprite -Category troops -Name elixir-golemite -Size 16 -Palette @('#4a1358','#8e2ba8','#c94ad8','#ef86f0','#fbd4fb') -Draw {
    param($g)
    $dk = B '#4a1358'; $md = B '#8e2ba8'; $lt = B '#c94ad8'; $hi = B '#ef86f0'; $wh = B '#fbd4fb'
    $g.FillEllipse($dk, 2.6, 6.8, 10.8, 8.2)
    $g.FillEllipse($dk, 4.6, 4.0, 6.8, 5.8)
    $g.FillEllipse($md, 3.4, 7.6, 9.2, 6.8)
    $g.FillEllipse($md, 5.3, 4.7, 5.4, 4.6)
    $g.FillEllipse($lt, 4.4, 8.0, 7.2, 3.4)
    $g.FillEllipse($hi, 5.8, 5.2, 2.8, 1.9)
    $g.FillEllipse($wh, 6.3, 5.6, 1.4, 1.0)
    $g.FillRectangle($dk, 6.0, 7.0, 1.3, 1.3)
    $g.FillRectangle($dk, 8.7, 7.0, 1.3, 1.3)
}

# Elixir Blob — tiny magenta droplet
Save-Sprite -Category troops -Name elixir-blob -Size 16 -Palette @('#4a1358','#8e2ba8','#c94ad8','#ef86f0','#fbd4fb') -Draw {
    param($g)
    $dk = B '#4a1358'; $md = B '#8e2ba8'; $lt = B '#c94ad8'; $hi = B '#ef86f0'; $wh = B '#fbd4fb'
    $tip = @( (New-Object System.Drawing.PointF(8.0, 3.2)),
              (New-Object System.Drawing.PointF(11.2, 9.4)),
              (New-Object System.Drawing.PointF(4.8, 9.4)) )
    $g.FillPolygon($dk, $tip)
    $g.FillEllipse($dk, 4.2, 6.6, 7.6, 7.8)
    $tip2 = @( (New-Object System.Drawing.PointF(8.0, 4.8)),
               (New-Object System.Drawing.PointF(10.4, 9.6)),
               (New-Object System.Drawing.PointF(5.6, 9.6)) )
    $g.FillPolygon($md, $tip2)
    $g.FillEllipse($md, 5.0, 7.4, 6.0, 6.2)
    $g.FillEllipse($lt, 5.6, 8.0, 4.6, 4.4)
    $g.FillEllipse($hi, 6.2, 8.6, 2.4, 2.0)
    $g.FillEllipse($wh, 6.6, 8.9, 1.2, 1.0)
}

# Lava Hound — orange-red rocky flier with stubby wings
Save-Sprite -Category troops -Name lava-hound -Size 16 -Palette @('#3d1206','#8a2c0d','#d4541b','#f79733','#ffd98a') -Draw {
    param($g)
    $dk = B '#3d1206'; $md = B '#8a2c0d'; $lt = B '#d4541b'; $hi = B '#f79733'; $glow = B '#ffd98a'
    $wl = @( (New-Object System.Drawing.PointF(0.6, 3.2)),
             (New-Object System.Drawing.PointF(5.0, 5.8)),
             (New-Object System.Drawing.PointF(2.6, 9.8)) )
    $wr = @( (New-Object System.Drawing.PointF(15.4, 3.2)),
             (New-Object System.Drawing.PointF(11.0, 5.8)),
             (New-Object System.Drawing.PointF(13.4, 9.8)) )
    $g.FillPolygon($md, $wl)
    $g.FillPolygon($md, $wr)
    $g.FillEllipse($dk, 2.4, 2.8, 11.2, 11.4)          # rocky body
    $g.FillEllipse($md, 3.2, 3.6, 9.6, 9.8)
    $g.FillEllipse($lt, 4.0, 4.0, 8.0, 5.0)            # lit back
    $g.FillEllipse($dk, 5.0, 9.2, 6.0, 5.0)            # muzzle
    $g.FillEllipse($hi, 5.6, 9.8, 4.8, 3.6)
    $g.FillRectangle($dk, 6.6, 11.0, 0.9, 1.2)         # nostrils
    $g.FillRectangle($dk, 8.6, 11.0, 0.9, 1.2)
    $g.FillRectangle($glow, 5.6, 6.0, 1.6, 1.5)        # burning eyes
    $g.FillRectangle($glow, 9.0, 6.0, 1.6, 1.5)
    $g.DrawLine((P '#ffd98a' 0.9), 4.4, 5.0, 6.0, 8.2) # lava cracks
    $g.DrawLine((P '#ffd98a' 0.9), 11.4, 5.2, 10.2, 8.4)
}

# Lava Pup — little orange flier
Save-Sprite -Category troops -Name lava-pup -Size 16 -Palette @('#3d1206','#8a2c0d','#d4541b','#f79733','#ffd98a') -Draw {
    param($g)
    $dk = B '#3d1206'; $md = B '#8a2c0d'; $lt = B '#d4541b'; $hi = B '#f79733'; $glow = B '#ffd98a'
    $wl = @( (New-Object System.Drawing.PointF(1.2, 4.4)),
             (New-Object System.Drawing.PointF(5.4, 6.4)),
             (New-Object System.Drawing.PointF(3.4, 9.6)) )
    $wr = @( (New-Object System.Drawing.PointF(14.8, 4.4)),
             (New-Object System.Drawing.PointF(10.6, 6.4)),
             (New-Object System.Drawing.PointF(12.6, 9.6)) )
    $g.FillPolygon($md, $wl)
    $g.FillPolygon($md, $wr)
    $g.FillEllipse($dk, 3.8, 4.4, 8.4, 9.0)
    $g.FillEllipse($md, 4.5, 5.1, 7.0, 7.6)
    $g.FillEllipse($lt, 5.1, 5.4, 5.8, 3.8)
    $g.FillEllipse($dk, 5.6, 9.4, 4.8, 4.0)            # muzzle
    $g.FillEllipse($hi, 6.1, 9.9, 3.8, 2.9)
    $g.FillRectangle($glow, 6.0, 6.8, 1.4, 1.3)
    $g.FillRectangle($glow, 8.6, 6.8, 1.4, 1.3)
    $g.DrawLine((P '#ffd98a' 0.8), 5.4, 6.2, 6.4, 8.4)
}

# Bowler — purple-robed hurler with a big dark boulder
Save-Sprite -Category troops -Name bowler -Size 16 -Palette @('#241640','#4e2f7d','#7f57b5','#c0a5e8','#2c2f36','#6a717c') -Draw {
    param($g)
    $dk = B '#241640'; $md = B '#4e2f7d'; $lt = B '#7f57b5'; $hi = B '#c0a5e8'
    $rk = B '#2c2f36'; $rkL = B '#6a717c'
    $robe = @( (New-Object System.Drawing.PointF(4.4, 5.6)),
               (New-Object System.Drawing.PointF(11.6, 5.6)),
               (New-Object System.Drawing.PointF(14.4, 15.0)),
               (New-Object System.Drawing.PointF(1.6, 15.0)) )
    $g.FillPolygon($dk, $robe)
    $robe2 = @( (New-Object System.Drawing.PointF(5.2, 6.4)),
                (New-Object System.Drawing.PointF(10.8, 6.4)),
                (New-Object System.Drawing.PointF(13.2, 14.3)),
                (New-Object System.Drawing.PointF(2.8, 14.3)) )
    $g.FillPolygon($md, $robe2)
    $g.FillPolygon($lt, @( (New-Object System.Drawing.PointF(6.0, 7.0)),
                           (New-Object System.Drawing.PointF(9.0, 7.0)),
                           (New-Object System.Drawing.PointF(10.4, 14.0)),
                           (New-Object System.Drawing.PointF(6.6, 14.0)) ))
    $g.FillEllipse($dk, 4.0, 1.2, 8.0, 7.4)            # hood
    $g.FillEllipse($md, 4.8, 2.0, 6.4, 5.8)
    $g.FillEllipse($hi, 5.8, 2.4, 3.4, 2.4)            # hood shine
    $g.FillEllipse($dk, 5.8, 4.4, 4.4, 3.4)            # shadowed face
    $g.FillEllipse($rk, 0.6, 8.2, 6.6, 6.6)            # boulder
    $g.FillEllipse($rkL, 1.6, 9.1, 4.4, 4.2)
    $g.FillEllipse($rk, 2.6, 10.2, 1.6, 1.4)
}

# Goblin Demolisher — green goblin swinging a red dynamite stick
Save-Sprite -Category troops -Name goblin-demolisher -Size 16 -Palette @('#1e3a1c','#3f7a32','#6db84a','#b6e08a','#9e2418','#f7d95a') -Draw {
    param($g)
    $dk = B '#1e3a1c'; $md = B '#3f7a32'; $lt = B '#6db84a'; $hi = B '#b6e08a'
    $red = B '#9e2418'; $spark = B '#f7d95a'
    $el = @( (New-Object System.Drawing.PointF(3.2, 5.2)),
             (New-Object System.Drawing.PointF(0.8, 2.6)),
             (New-Object System.Drawing.PointF(2.8, 7.4)) )
    $er = @( (New-Object System.Drawing.PointF(10.8, 5.2)),
             (New-Object System.Drawing.PointF(13.2, 2.6)),
             (New-Object System.Drawing.PointF(11.2, 7.4)) )
    $g.FillPolygon($md, $el)
    $g.FillPolygon($md, $er)
    $g.FillEllipse($dk, 2.6, 4.6, 8.8, 10.4)           # body
    $g.FillEllipse($md, 3.3, 5.3, 7.4, 9.0)
    $g.FillEllipse($lt, 3.0, 2.8, 8.0, 7.0)            # head
    $g.FillEllipse($hi, 4.6, 3.6, 4.6, 3.4)            # brow shine
    $g.FillRectangle($dk, 4.8, 6.0, 1.5, 1.4)          # eyes
    $g.FillRectangle($dk, 7.8, 6.0, 1.5, 1.4)
    $stick = @( (New-Object System.Drawing.PointF(4.0, 14.0)),
                (New-Object System.Drawing.PointF(3.0, 12.0)),
                (New-Object System.Drawing.PointF(12.0, 7.0)),
                (New-Object System.Drawing.PointF(13.0, 9.0)) )
    $g.FillPolygon($red, $stick)                       # dynamite
    $g.FillEllipse($spark, 11.8, 4.6, 3.2, 3.2)        # lit fuse
}

# Sparky — yellow wheeled machine with a huge coil
Save-Sprite -Category troops -Name sparky -Size 16 -Palette @('#2a2410','#8a6a16','#e3b929','#f9ea86','#262a31','#7e8896') -Draw {
    param($g)
    $dk = B '#2a2410'; $md = B '#8a6a16'; $lt = B '#e3b929'; $hi = B '#f9ea86'
    $mt = B '#262a31'; $mtL = B '#7e8896'
    $g.FillEllipse($mt, 0.8, 9.6, 5.6, 5.6)            # wheels
    $g.FillEllipse($mt, 9.6, 9.6, 5.6, 5.6)
    $g.FillEllipse($mtL, 2.2, 11.0, 2.8, 2.8)
    $g.FillEllipse($mtL, 11.0, 11.0, 2.8, 2.8)
    $g.FillRectangle($dk, 2.0, 8.2, 12.0, 4.4)         # chassis
    $g.FillRectangle($md, 2.6, 8.8, 10.8, 3.0)
    $g.FillRectangle($lt, 3.2, 9.2, 9.6, 1.4)
    $g.FillEllipse($dk, 3.0, 0.8, 10.0, 9.0)           # coil
    $g.FillEllipse($md, 3.8, 1.6, 8.4, 7.4)
    $g.FillEllipse($lt, 4.6, 2.2, 6.6, 5.2)
    $g.FillEllipse($hi, 5.8, 2.8, 3.4, 2.6)
    $g.DrawArc((P '#7e8896' 1.0), 4.2, 2.0, 7.6, 6.6, 20, 140)
    $g.DrawLine((P '#f9ea86' 1.0), 8.0, 1.0, 8.0, 3.0) # discharge
}

# Cursed Hog — purple-tinted charging hog
Save-Sprite -Category troops -Name cursed-hog -Size 16 -Palette @('#2a1636','#5a2f6e','#8f55a8','#c99ad8','#f2dbf7') -Draw {
    param($g)
    $dk = B '#2a1636'; $md = B '#5a2f6e'; $lt = B '#8f55a8'; $hi = B '#c99ad8'; $wh = B '#f2dbf7'
    $g.FillRectangle($dk, 3.2, 11.6, 2.2, 3.4)         # legs
    $g.FillRectangle($dk, 7.0, 11.6, 2.2, 3.4)
    $g.FillRectangle($dk, 10.2, 11.8, 2.0, 3.0)
    $g.FillEllipse($dk, 1.2, 4.6, 12.4, 8.8)           # body
    $g.FillEllipse($md, 2.0, 5.4, 10.8, 7.2)
    $g.FillEllipse($lt, 2.8, 5.6, 8.6, 3.4)            # lit back
    $ear = @( (New-Object System.Drawing.PointF(10.0, 5.2)),
              (New-Object System.Drawing.PointF(11.2, 1.8)),
              (New-Object System.Drawing.PointF(12.8, 5.0)) )
    $g.FillPolygon($md, $ear)
    $g.FillEllipse($dk, 9.2, 3.8, 6.2, 7.0)            # head
    $g.FillEllipse($md, 9.9, 4.5, 5.0, 5.8)
    $g.FillEllipse($hi, 12.4, 7.2, 3.0, 2.8)           # snout
    $g.FillRectangle($dk, 13.2, 8.0, 0.8, 1.2)
    $g.FillRectangle($dk, 11.2, 6.0, 1.3, 1.2)         # eye
    $g.FillEllipse($wh, 11.6, 9.4, 1.6, 1.4)           # tusk
}

# Skeleton Barrel — wooden barrel with a bone skull painted on
Save-Sprite -Category troops -Name skeleton-barrel -Size 16 -Palette @('#3a2410','#6b4423','#a06a34','#c99257','#e8e4d8','#2b2b28') -Draw {
    param($g)
    $dk = B '#3a2410'; $md = B '#6b4423'; $lt = B '#a06a34'; $hi = B '#c99257'
    $bone = B '#e8e4d8'; $bk = B '#2b2b28'
    $g.FillEllipse($dk, 1.6, 1.2, 12.8, 13.6)          # barrel
    $g.FillEllipse($md, 2.4, 2.0, 11.2, 12.0)
    $g.FillRectangle($lt, 3.6, 2.8, 2.6, 10.6)         # lit stave
    $g.FillRectangle($hi, 4.2, 3.2, 1.1, 9.6)
    $g.FillRectangle($dk, 2.0, 3.8, 12.0, 1.5)         # hoops
    $g.FillRectangle($dk, 2.0, 10.8, 12.0, 1.5)
    $g.FillEllipse($bone, 5.2, 5.6, 5.8, 5.6)          # skull
    $g.FillRectangle($bk, 6.2, 7.2, 1.5, 1.6)          # eye sockets
    $g.FillRectangle($bk, 8.6, 7.2, 1.5, 1.6)
    $g.FillRectangle($bk, 7.2, 9.8, 1.8, 0.9)          # jaw
}

# Executioner — green hood swinging a steel axe
Save-Sprite -Category troops -Name executioner -Size 16 -Palette @('#16301a','#2f6a2c','#5aa843','#20242b','#7e8b99','#d7e3f0') -Draw {
    param($g)
    $dk = B '#16301a'; $md = B '#2f6a2c'; $lt = B '#5aa843'
    $g.FillEllipse($dk, 2.8, 4.6, 9.4, 10.6)           # robe
    $g.FillEllipse($md, 3.5, 5.3, 8.0, 9.2)
    $g.FillEllipse($lt, 4.2, 5.6, 6.4, 4.2)
    $g.FillEllipse($dk, 3.4, 1.2, 8.2, 7.6)            # hood
    $g.FillEllipse($md, 4.1, 1.9, 6.8, 6.2)
    $g.FillEllipse($lt, 5.0, 2.3, 3.8, 2.6)
    $g.FillRectangle((B '#20242b'), 5.2, 4.9, 5.2, 2.0) # face slit
    $g.DrawLine((P '#20242b' 1.5), 12.2, 14.6, 11.0, 4.4)  # haft
    $g.FillPie((B '#20242b'), 8.0, 1.0, 7.2, 9.6, -62, 124) # axe head
    $g.FillPie((B '#7e8b99'), 8.6, 1.9, 6.0, 7.8, -56, 112)
    $g.DrawArc((P '#d7e3f0' 1.0), 9.2, 2.7, 4.8, 6.2, -46, 92)
}

# Firecracker — pink outfit shouldering a rocket tube
Save-Sprite -Category troops -Name firecracker -Size 16 -Palette @('#4d1830','#a83a63','#e87a9e','#f9d3de','#3a2a14','#f5b93a') -Draw {
    param($g)
    $dk = B '#4d1830'; $md = B '#a83a63'; $lt = B '#e87a9e'; $hi = B '#f9d3de'
    $g.FillEllipse($dk, 1.6, 5.0, 9.6, 10.0)           # dress
    $g.FillEllipse($md, 2.4, 5.8, 8.0, 8.6)
    $g.FillEllipse($lt, 3.0, 6.0, 6.2, 3.6)
    $g.FillEllipse($dk, 2.6, 1.6, 7.8, 7.0)            # hood
    $g.FillEllipse($md, 3.3, 2.3, 6.4, 5.6)
    $g.FillEllipse($hi, 4.4, 3.4, 4.0, 3.4)            # face
    $g.FillRectangle($dk, 5.0, 4.4, 1.3, 1.3)          # eyes
    $g.FillRectangle($dk, 7.0, 4.4, 1.3, 1.3)
    $g.DrawLine((P '#3a2a14' 2.8), 10.8, 14.4, 12.8, 5.0)  # rocket tube
    $g.DrawLine((P '#4d1830' 1.0), 11.4, 13.0, 12.6, 7.2)
    $g.FillEllipse((B '#f5b93a'), 10.8, 1.6, 4.2, 4.2) # muzzle flash
    $g.FillEllipse($hi, 11.9, 2.7, 2.0, 2.0)
}
