. (Join-Path $PSScriptRoot ".." | Join-Path -ChildPath "_lib.ps1")

# Musketeer — blue coat, wide brimmed hat, long musket over the shoulder
Save-Sprite -Category troops -Name musketeer -Size 16 -Palette @('#16233f','#2f4d80','#5b86c4','#f6d3a4','#3a2a1c','#9aa3ad') -Draw {
    param($g)
    $dk = B '#16233f'; $md = B '#2f4d80'; $lt = B '#5b86c4'; $sk = B '#f6d3a4'; $mtl = B '#9aa3ad'
    $g.FillEllipse($dk, 3.6, 5.4, 8.8, 9.6)          # coat silhouette
    $g.FillEllipse($md, 4.3, 6.1, 7.4, 8.6)
    $g.FillEllipse($lt, 5.8, 7.6, 3.6, 6.4)          # lit coat front
    $g.FillEllipse($dk, 5.0, 3.4, 6.0, 5.6)          # head shadow
    $g.FillEllipse($sk, 5.7, 4.0, 4.6, 4.4)          # face
    $g.FillEllipse($dk, 2.6, 2.4, 10.8, 3.0)         # wide hat brim
    $g.FillEllipse($md, 5.0, 0.8, 6.0, 3.2)          # crown
    $g.FillEllipse($lt, 6.0, 1.2, 3.0, 1.4)
    $g.DrawLine((P '#3a2a1c' 1.4), 9.4, 14.6, 13.6, 3.6)   # musket
    $g.FillEllipse($mtl, 12.4, 2.4, 2.4, 2.4)        # muzzle
}

# Elite Musketeer — deeper blue coat with gold trim
Save-Sprite -Category troops -Name elite-musketeer -Size 16 -Palette @('#0e1730','#1e3468','#3a63b0','#e8b23c','#f6d3a4','#2b2118') -Draw {
    param($g)
    $dk = B '#0e1730'; $md = B '#1e3468'; $lt = B '#3a63b0'; $gd = B '#e8b23c'; $sk = B '#f6d3a4'
    $g.FillEllipse($dk, 3.4, 5.2, 9.2, 9.8)
    $g.FillEllipse($md, 4.1, 5.9, 7.8, 8.8)
    $g.FillEllipse($lt, 5.8, 7.4, 3.4, 6.6)
    $g.FillRectangle($gd, 7.2, 7.6, 1.2, 6.4)        # gold coat trim
    $g.FillRectangle($gd, 4.6, 9.4, 6.8, 1.0)        # gold sash
    $g.FillEllipse($dk, 5.0, 3.2, 6.0, 5.6)
    $g.FillEllipse($sk, 5.7, 3.8, 4.6, 4.4)
    $g.FillEllipse($dk, 2.4, 2.2, 11.2, 3.0)         # wide brim
    $g.FillEllipse($md, 4.9, 0.6, 6.2, 3.2)          # crown
    $g.FillRectangle($gd, 4.9, 2.7, 6.2, 1.0)        # gold hat band
    $g.DrawLine((P '#2b2118' 1.4), 9.4, 14.6, 13.6, 3.4)
    $g.FillEllipse($gd, 12.4, 2.2, 2.4, 2.4)
}

# Three Musketeers — pink coat, a second musketeer behind
Save-Sprite -Category troops -Name three-musketeers -Size 16 -Palette @('#45182e','#93375f','#d2648f','#f8c3d8','#f6d3a4','#3a2a1c') -Draw {
    param($g)
    $dk = B '#45182e'; $md = B '#93375f'; $lt = B '#d2648f'; $hi = B '#f8c3d8'; $sk = B '#f6d3a4'
    $g.FillEllipse($dk, 0.7, 6.2, 6.4, 8.6)          # rear musketeer
    $g.FillEllipse($md, 1.2, 6.8, 5.4, 7.6)
    $g.FillEllipse($dk, 1.6, 4.4, 4.8, 4.4)
    $g.FillEllipse($sk, 2.1, 4.9, 3.6, 3.4)
    $g.FillEllipse($dk, 0.5, 3.7, 6.8, 2.1)          # rear brim
    $g.FillEllipse($md, 2.0, 2.4, 3.8, 2.4)          # rear crown
    $g.FillEllipse($dk, 5.4, 5.2, 8.6, 9.6)          # front musketeer
    $g.FillEllipse($md, 6.0, 5.9, 7.4, 8.6)
    $g.FillEllipse($lt, 7.4, 7.4, 3.6, 6.4)
    $g.FillEllipse($dk, 6.5, 3.2, 6.0, 5.6)
    $g.FillEllipse($sk, 7.2, 3.8, 4.6, 4.4)
    $g.FillEllipse($dk, 4.6, 2.2, 9.8, 2.9)          # wide brim
    $g.FillEllipse($md, 6.9, 0.6, 5.6, 3.1)
    $g.FillEllipse($hi, 7.8, 1.1, 2.6, 1.3)
    $g.DrawLine((P '#3a2a1c' 1.2), 10.6, 14.4, 13.8, 5.0)
}

# Wizard — orange robe, pointed hat, fireball in hand
Save-Sprite -Category troops -Name wizard -Size 16 -Palette @('#5a2408','#a8480f','#e8781c','#f9c04e','#f6d3a4','#fff3c0') -Draw {
    param($g)
    $dk = B '#5a2408'; $md = B '#a8480f'; $lt = B '#e8781c'; $hi = B '#f9c04e'; $sk = B '#f6d3a4'; $fire = B '#fff3c0'
    $robe = @( (New-Object System.Drawing.PointF(8.0,5.2)),
               (New-Object System.Drawing.PointF(13.4,14.6)),
               (New-Object System.Drawing.PointF(2.6,14.6)) )
    $g.FillPolygon($dk, $robe)
    $robe2 = @( (New-Object System.Drawing.PointF(8.0,6.5)),
                (New-Object System.Drawing.PointF(12.2,14.0)),
                (New-Object System.Drawing.PointF(3.8,14.0)) )
    $g.FillPolygon($md, $robe2)
    $g.FillEllipse($lt, 6.6, 8.2, 2.8, 5.6)          # lit robe front
    $g.FillEllipse($dk, 5.2, 3.0, 5.6, 5.2)
    $g.FillEllipse($sk, 5.8, 3.6, 4.4, 4.4)          # face
    $hat = @( (New-Object System.Drawing.PointF(7.8,0.2)),
              (New-Object System.Drawing.PointF(11.4,4.9)),
              (New-Object System.Drawing.PointF(4.2,4.9)) )
    $g.FillPolygon($dk, $hat)
    $hat2 = @( (New-Object System.Drawing.PointF(7.8,1.5)),
               (New-Object System.Drawing.PointF(10.2,4.5)),
               (New-Object System.Drawing.PointF(5.4,4.5)) )
    $g.FillPolygon($hi, $hat2)
    $g.FillEllipse($md, 3.2, 8.4, 3.8, 2.8)          # arm
    $g.FillEllipse($hi, 0.9, 7.2, 4.6, 4.6)          # fireball
    $g.FillEllipse($fire, 2.0, 8.3, 2.4, 2.4)
}

# Witch — purple robe, pointed hat, green orb staff
Save-Sprite -Category troops -Name witch -Size 16 -Palette @('#2b1240','#5b2a80','#8f4fc0','#f0d2a8','#2e7a3c','#66ee72') -Draw {
    param($g)
    $dk = B '#2b1240'; $md = B '#5b2a80'; $lt = B '#8f4fc0'; $sk = B '#f0d2a8'
    $go = B '#2e7a3c'; $gl = B '#66ee72'
    $robe = @( (New-Object System.Drawing.PointF(7.8,5.2)),
               (New-Object System.Drawing.PointF(13.2,14.6)),
               (New-Object System.Drawing.PointF(2.4,14.6)) )
    $g.FillPolygon($dk, $robe)
    $robe2 = @( (New-Object System.Drawing.PointF(7.8,6.5)),
                (New-Object System.Drawing.PointF(12.0,14.0)),
                (New-Object System.Drawing.PointF(3.6,14.0)) )
    $g.FillPolygon($md, $robe2)
    $g.FillEllipse($lt, 6.4, 8.2, 2.8, 5.6)
    $g.FillEllipse($dk, 5.0, 3.0, 5.6, 5.2)
    $g.FillEllipse($sk, 5.6, 3.6, 4.4, 4.4)
    $hat = @( (New-Object System.Drawing.PointF(7.0,0.4)),
              (New-Object System.Drawing.PointF(10.8,5.0)),
              (New-Object System.Drawing.PointF(3.2,5.0)) )
    $g.FillPolygon($dk, $hat)
    $hat2 = @( (New-Object System.Drawing.PointF(7.0,1.7)),
               (New-Object System.Drawing.PointF(9.7,4.6)),
               (New-Object System.Drawing.PointF(4.3,4.6)) )
    $g.FillPolygon($md, $hat2)
    $g.DrawLine((P '#2b1240' 1.3), 12.8, 14.2, 12.3, 6.4)   # staff
    $g.FillEllipse($go, 9.8, 1.4, 5.2, 5.2)           # orb
    $g.FillEllipse($gl, 10.9, 2.5, 3.0, 3.0)
}

# Mother Witch — dark purple robe, very wide hat, gold-tipped wand
Save-Sprite -Category troops -Name mother-witch -Size 16 -Palette @('#1e0e2c','#3f1c5c','#663090','#a06fc4','#efd0aa','#f0c24a') -Draw {
    param($g)
    $dk = B '#1e0e2c'; $md = B '#3f1c5c'; $lt = B '#663090'; $hi = B '#a06fc4'
    $sk = B '#efd0aa'; $gd = B '#f0c24a'
    $robe = @( (New-Object System.Drawing.PointF(7.8,5.6)),
               (New-Object System.Drawing.PointF(13.4,14.6)),
               (New-Object System.Drawing.PointF(2.2,14.6)) )
    $g.FillPolygon($dk, $robe)
    $robe2 = @( (New-Object System.Drawing.PointF(7.8,6.8)),
                (New-Object System.Drawing.PointF(12.2,14.0)),
                (New-Object System.Drawing.PointF(3.4,14.0)) )
    $g.FillPolygon($md, $robe2)
    $g.FillEllipse($lt, 6.4, 8.6, 2.8, 5.4)
    $g.FillEllipse($dk, 5.2, 3.6, 5.4, 5.0)
    $g.FillEllipse($sk, 5.8, 4.2, 4.2, 4.2)
    $crown = @( (New-Object System.Drawing.PointF(7.4,0.3)),
                (New-Object System.Drawing.PointF(10.6,4.4)),
                (New-Object System.Drawing.PointF(4.4,4.4)) )
    $g.FillPolygon($dk, $crown)
    $crown2 = @( (New-Object System.Drawing.PointF(7.4,1.5)),
                 (New-Object System.Drawing.PointF(9.6,4.1)),
                 (New-Object System.Drawing.PointF(5.2,4.1)) )
    $g.FillPolygon($lt, $crown2)
    $g.FillEllipse($dk, 1.2, 3.0, 13.4, 3.2)          # very wide brim
    $g.FillEllipse($hi, 2.4, 3.5, 11.0, 1.5)
    $g.DrawLine((P '#3f1c5c' 1.2), 11.0, 12.8, 13.6, 8.8)  # wand
    $g.FillEllipse($gd, 12.6, 7.0, 2.4, 2.4)
}

# Zappies — squat yellow machine on treads with a spark coil
Save-Sprite -Category troops -Name zappies -Size 16 -Palette @('#2e2a12','#6b5a18','#d8bd28','#f6e968','#8fd8ff','#eafbff') -Draw {
    param($g)
    $dk = B '#2e2a12'; $md = B '#6b5a18'; $lt = B '#d8bd28'; $hi = B '#f6e968'
    $sp = B '#8fd8ff'; $spb = B '#eafbff'
    $g.FillRectangle($dk, 1.8, 11.4, 12.4, 3.2)       # treads
    $g.FillRectangle($md, 2.6, 12.4, 10.8, 1.0)
    $g.FillEllipse($dk, 2.4, 4.8, 11.2, 8.4)          # body
    $g.FillEllipse($lt, 3.1, 5.5, 9.8, 7.0)
    $g.FillEllipse($hi, 4.2, 5.9, 6.6, 3.6)           # body shine
    $g.FillEllipse($dk, 4.6, 7.8, 2.4, 2.6)           # eyes
    $g.FillEllipse($dk, 8.6, 7.8, 2.4, 2.6)
    $g.FillRectangle($md, 7.0, 2.4, 2.0, 3.6)         # coil rod
    $g.DrawLine((P '#2e2a12' 1.0), 6.2, 3.2, 9.8, 3.2)
    $g.DrawLine((P '#2e2a12' 1.0), 6.2, 4.8, 9.8, 4.8)
    $g.FillEllipse($sp, 5.4, 0.2, 5.2, 3.4)           # spark ball
    $g.FillEllipse($spb, 6.9, 0.9, 2.2, 1.8)
    $g.DrawLine((P '#eafbff' 0.9), 4.4, 2.6, 2.6, 4.6)
    $g.DrawLine((P '#eafbff' 0.9), 11.6, 2.6, 13.4, 4.6)
}

# Dart Goblin — green goblin with a long blowgun
Save-Sprite -Category troops -Name dart-goblin -Size 16 -Palette @('#1e3a1c','#3f7a32','#6db84a','#b6e08a','#7a5230','#e8d8b0') -Draw {
    param($g)
    $dk = B '#1e3a1c'; $md = B '#3f7a32'; $lt = B '#6db84a'; $hi = B '#b6e08a'
    $g.FillEllipse($dk, 4.0, 7.4, 8.4, 7.6)           # body
    $g.FillEllipse($md, 4.6, 8.0, 7.2, 6.4)
    $g.FillEllipse($lt, 6.0, 8.8, 3.4, 4.6)
    $ear1 = @( (New-Object System.Drawing.PointF(4.8,4.6)),
               (New-Object System.Drawing.PointF(1.1,3.0)),
               (New-Object System.Drawing.PointF(4.6,7.6)) )
    $g.FillPolygon($dk, $ear1)
    $ear2 = @( (New-Object System.Drawing.PointF(11.0,4.6)),
               (New-Object System.Drawing.PointF(14.4,3.0)),
               (New-Object System.Drawing.PointF(11.2,7.6)) )
    $g.FillPolygon($dk, $ear2)
    $g.FillEllipse($dk, 4.2, 2.6, 7.6, 6.8)           # head
    $g.FillEllipse($md, 4.8, 3.2, 6.4, 5.6)
    $g.FillEllipse($hi, 5.6, 3.6, 3.4, 2.4)
    $g.FillEllipse($dk, 5.9, 5.4, 1.6, 1.8)           # eyes
    $g.FillEllipse($dk, 8.5, 5.4, 1.6, 1.8)
    $g.DrawLine((P '#7a5230' 1.4), 5.4, 10.6, 14.2, 3.8)   # blowgun
    $g.FillEllipse((B '#e8d8b0'), 13.2, 2.8, 1.8, 1.8)
}

# Princess archer — pink dress, gold bow
Save-Sprite -Category troops -Name princess-archer -Size 16 -Palette @('#5e2244','#b2497a','#ef8ab0','#ffd0e2','#f6d3a4','#e8b23c') -Draw {
    param($g)
    $dk = B '#5e2244'; $md = B '#b2497a'; $lt = B '#ef8ab0'; $hi = B '#ffd0e2'
    $sk = B '#f6d3a4'; $gd = B '#e8b23c'
    $dress = @( (New-Object System.Drawing.PointF(8.0,5.8)),
                (New-Object System.Drawing.PointF(13.4,14.6)),
                (New-Object System.Drawing.PointF(2.6,14.6)) )
    $g.FillPolygon($dk, $dress)
    $dress2 = @( (New-Object System.Drawing.PointF(8.0,7.0)),
                 (New-Object System.Drawing.PointF(12.2,14.0)),
                 (New-Object System.Drawing.PointF(3.8,14.0)) )
    $g.FillPolygon($md, $dress2)
    $g.FillEllipse($lt, 6.4, 8.8, 3.2, 5.2)
    $g.FillEllipse($hi, 7.0, 9.6, 1.6, 3.0)
    $g.FillEllipse($dk, 5.4, 2.4, 5.4, 5.6)           # head + hair shadow
    $g.FillEllipse($sk, 6.0, 3.4, 4.2, 4.2)
    $g.FillEllipse($gd, 5.5, 2.2, 5.2, 2.8)           # blonde hair
    $g.DrawArc((P '#e8b23c' 1.4), 1.0, 3.2, 4.4, 9.4, -70, 140)   # bow
    $g.DrawLine((P '#ffd0e2' 0.9), 2.2, 8.2, 8.4, 8.2)            # arrow
}

# Ice Wizard — pale blue robe, pointed hood, big white beard
Save-Sprite -Category troops -Name ice-wizard -Size 16 -Palette @('#173a5c','#2f6d9e','#7fb6dd','#d6eefc','#ffffff','#f0d2a8') -Draw {
    param($g)
    $dk = B '#173a5c'; $md = B '#2f6d9e'; $lt = B '#7fb6dd'; $pl = B '#d6eefc'
    $wh = B '#ffffff'; $sk = B '#f0d2a8'
    $robe = @( (New-Object System.Drawing.PointF(8.0,5.4)),
               (New-Object System.Drawing.PointF(13.2,14.6)),
               (New-Object System.Drawing.PointF(2.8,14.6)) )
    $g.FillPolygon($dk, $robe)
    $robe2 = @( (New-Object System.Drawing.PointF(8.0,6.6)),
                (New-Object System.Drawing.PointF(12.0,14.0)),
                (New-Object System.Drawing.PointF(4.0,14.0)) )
    $g.FillPolygon($md, $robe2)
    $g.FillEllipse($lt, 6.4, 10.8, 3.2, 3.2)
    $g.FillEllipse($dk, 5.2, 2.4, 5.6, 5.4)
    $g.FillEllipse($sk, 5.8, 3.0, 4.4, 4.4)
    $hat = @( (New-Object System.Drawing.PointF(7.8,0.0)),
              (New-Object System.Drawing.PointF(11.2,4.2)),
              (New-Object System.Drawing.PointF(4.2,4.2)) )
    $g.FillPolygon($dk, $hat)
    $hat2 = @( (New-Object System.Drawing.PointF(7.8,1.1)),
               (New-Object System.Drawing.PointF(10.2,3.9)),
               (New-Object System.Drawing.PointF(5.4,3.9)) )
    $g.FillPolygon($lt, $hat2)
    $g.FillEllipse($pl, 4.9, 6.4, 6.2, 4.8)           # beard
    $g.FillEllipse($wh, 5.5, 6.8, 5.0, 3.6)
    $g.FillEllipse($dk, 6.2, 4.6, 1.4, 1.5)           # eyes
    $g.FillEllipse($dk, 8.4, 4.6, 1.4, 1.5)
}

# Electro Wizard — white-blue robe, sparks in both hands
Save-Sprite -Category troops -Name electro-wizard -Size 16 -Palette @('#152444','#2b53a0','#6fc8f0','#eafaff','#f6d3a4','#ffffff') -Draw {
    param($g)
    $dk = B '#152444'; $md = B '#2b53a0'; $sp = B '#6fc8f0'; $pl = B '#eafaff'
    $sk = B '#f6d3a4'; $wh = B '#ffffff'
    $robe = @( (New-Object System.Drawing.PointF(8.0,5.6)),
               (New-Object System.Drawing.PointF(12.8,14.6)),
               (New-Object System.Drawing.PointF(3.2,14.6)) )
    $g.FillPolygon($dk, $robe)
    $robe2 = @( (New-Object System.Drawing.PointF(8.0,6.8)),
                (New-Object System.Drawing.PointF(11.6,14.0)),
                (New-Object System.Drawing.PointF(4.4,14.0)) )
    $g.FillPolygon($pl, $robe2)
    $g.FillEllipse($md, 6.9, 7.6, 2.2, 6.4)           # blue trim
    $g.FillEllipse($dk, 5.4, 3.0, 5.4, 5.2)
    $g.FillEllipse($sk, 6.0, 3.6, 4.2, 4.2)
    $mo = @( (New-Object System.Drawing.PointF(8.0,0.4)),
             (New-Object System.Drawing.PointF(9.8,3.8)),
             (New-Object System.Drawing.PointF(6.2,3.8)) )
    $g.FillPolygon($sp, $mo)                          # crackling hair
    $g.FillEllipse($dk, 6.4, 5.0, 1.3, 1.5)
    $g.FillEllipse($dk, 8.5, 5.0, 1.3, 1.5)
    $g.FillEllipse($sp, 0.6, 7.0, 4.0, 4.0)           # left spark
    $g.FillEllipse($wh, 1.6, 8.0, 2.0, 2.0)
    $g.FillEllipse($sp, 11.4, 7.0, 4.0, 4.0)          # right spark
    $g.FillEllipse($wh, 12.4, 8.0, 2.0, 2.0)
}

# Magic Archer — purple cloak and hood, glowing arrow
Save-Sprite -Category troops -Name magic-archer -Size 16 -Palette @('#251340','#4a2878','#7a4fb0','#c9a8ea','#f6d3a4','#ffe98a') -Draw {
    param($g)
    $dk = B '#251340'; $md = B '#4a2878'; $lt = B '#7a4fb0'; $hi = B '#c9a8ea'
    $sk = B '#f6d3a4'; $gw = B '#ffe98a'
    $cloak = @( (New-Object System.Drawing.PointF(8.0,4.4)),
                (New-Object System.Drawing.PointF(13.2,14.6)),
                (New-Object System.Drawing.PointF(2.8,14.6)) )
    $g.FillPolygon($dk, $cloak)
    $cloak2 = @( (New-Object System.Drawing.PointF(8.0,5.8)),
                 (New-Object System.Drawing.PointF(12.0,14.0)),
                 (New-Object System.Drawing.PointF(4.0,14.0)) )
    $g.FillPolygon($md, $cloak2)
    $g.FillEllipse($lt, 6.4, 8.0, 3.0, 5.8)
    $g.FillEllipse($hi, 7.0, 8.8, 1.6, 3.2)
    $g.FillEllipse($dk, 4.6, 1.8, 6.6, 6.4)           # hood
    $g.FillEllipse($md, 5.3, 2.4, 5.2, 5.0)
    $g.FillEllipse($sk, 6.3, 4.2, 3.2, 3.0)           # shadowed face
    $g.DrawArc((P '#7a4fb0' 1.3), 1.2, 5.0, 3.6, 7.8, -70, 140)   # bow
    $g.DrawLine((P '#ffe98a' 1.3), 5.4, 11.0, 13.2, 3.4)          # glowing arrow
    $g.FillEllipse($gw, 12.0, 1.6, 2.8, 2.8)
}

# Night Witch — dark teal robe and hood, bat at her shoulder
Save-Sprite -Category troops -Name night-witch -Size 16 -Palette @('#0d2226','#164a4e','#2b8489','#6cc6c0','#e6c9a4','#1b1226') -Draw {
    param($g)
    $dk = B '#0d2226'; $md = B '#164a4e'; $lt = B '#2b8489'; $hi = B '#6cc6c0'
    $sk = B '#e6c9a4'; $bat = B '#1b1226'
    $robe = @( (New-Object System.Drawing.PointF(7.8,4.8)),
               (New-Object System.Drawing.PointF(12.8,14.6)),
               (New-Object System.Drawing.PointF(2.8,14.6)) )
    $g.FillPolygon($dk, $robe)
    $robe2 = @( (New-Object System.Drawing.PointF(7.8,6.2)),
                (New-Object System.Drawing.PointF(11.6,14.0)),
                (New-Object System.Drawing.PointF(4.0,14.0)) )
    $g.FillPolygon($md, $robe2)
    $g.FillEllipse($lt, 6.2, 8.2, 3.0, 5.6)
    $g.FillEllipse($hi, 6.8, 9.0, 1.6, 3.0)
    $g.FillEllipse($dk, 4.4, 2.4, 6.4, 6.2)           # hood
    $g.FillEllipse($lt, 5.1, 3.0, 5.0, 4.8)
    $g.FillEllipse($sk, 6.0, 4.4, 3.2, 3.0)
    $g.FillEllipse($bat, 12.0, 1.6, 2.2, 2.4)         # bat body
    $bw1 = @( (New-Object System.Drawing.PointF(12.3,2.2)),
              (New-Object System.Drawing.PointF(9.4,0.5)),
              (New-Object System.Drawing.PointF(10.6,3.6)) )
    $g.FillPolygon($bat, $bw1)
    $bw2 = @( (New-Object System.Drawing.PointF(13.9,2.2)),
              (New-Object System.Drawing.PointF(15.2,0.5)),
              (New-Object System.Drawing.PointF(14.6,3.6)) )
    $g.FillPolygon($bat, $bw2)
}

# Guard — skeleton with a wooden shield and a spear
Save-Sprite -Category troops -Name guard -Size 16 -Palette @('#2b2b28','#8d8b7d','#d8d5c2','#f4f2e6','#7a5230','#8fa3b8') -Draw {
    param($g)
    $dk = B '#2b2b28'; $md = B '#8d8b7d'; $lt = B '#d8d5c2'; $hi = B '#f4f2e6'
    $wd = B '#7a5230'; $st = B '#8fa3b8'
    $g.FillEllipse($dk, 5.0, 2.2, 6.8, 6.8)           # skull
    $g.FillEllipse($lt, 5.6, 2.8, 5.6, 5.6)
    $g.FillEllipse($hi, 6.2, 3.2, 3.2, 2.6)
    $g.FillEllipse($dk, 6.4, 5.2, 1.8, 2.0)           # sockets
    $g.FillEllipse($dk, 8.8, 5.2, 1.8, 2.0)
    $g.FillRectangle($lt, 7.4, 8.8, 2.0, 4.8)         # spine
    $g.FillRectangle($lt, 5.4, 9.4, 5.8, 1.1)         # ribs
    $g.FillRectangle($lt, 5.8, 11.4, 5.0, 1.1)
    $g.FillEllipse($dk, 0.8, 6.4, 5.0, 6.8)           # shield
    $g.FillEllipse($wd, 1.4, 7.0, 3.8, 5.6)
    $g.FillEllipse($md, 2.3, 9.0, 2.0, 2.0)
    $g.DrawLine((P '#7a5230' 1.2), 13.0, 14.8, 11.9, 3.6)   # spear shaft
    $tip = @( (New-Object System.Drawing.PointF(10.9,4.0)),
              (New-Object System.Drawing.PointF(13.1,4.0)),
              (New-Object System.Drawing.PointF(12.0,0.9)) )
    $g.FillPolygon($st, $tip)
}
