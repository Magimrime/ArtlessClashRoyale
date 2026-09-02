. (Join-Path $PSScriptRoot ".." | Join-Path -ChildPath "_lib.ps1")

# Mini P.E.K.K.A — dark blue armoured robot, horned helm, glowing cyan visor
Save-Sprite -Category troops -Name mini-pekka -Size 16 -Palette @('#141a2e','#2a3a63','#4f74b8','#a8c8f0','#3ff0d8') -Draw {
    param($g)
    $dk = B '#141a2e'; $md = B '#2a3a63'; $lt = B '#4f74b8'; $hi = B '#a8c8f0'; $gl = B '#3ff0d8'
    # shoulders + torso
    $g.FillEllipse($dk, 2.0, 6.2, 12.0, 8.8)
    $g.FillEllipse($md, 2.9, 7.0, 10.2, 7.2)
    $g.FillEllipse($lt, 4.4, 7.6, 7.2, 3.2)
    # horns
    $hl = @( (New-Object System.Drawing.PointF(4.6,3.4)),
             (New-Object System.Drawing.PointF(1.0,1.2)),
             (New-Object System.Drawing.PointF(5.4,1.8)) )
    $hr = @( (New-Object System.Drawing.PointF(11.4,3.4)),
             (New-Object System.Drawing.PointF(15.0,1.2)),
             (New-Object System.Drawing.PointF(10.6,1.8)) )
    $g.FillPolygon($dk, $hl); $g.FillPolygon($dk, $hr)
    # helmet
    $g.FillEllipse($dk, 3.6, 1.8, 8.8, 7.8)
    $g.FillEllipse($md, 4.4, 2.5, 7.2, 6.4)
    $g.FillEllipse($lt, 5.0, 2.8, 5.2, 2.8)
    $g.FillEllipse($hi, 6.0, 3.2, 2.6, 1.5)
    # glowing visor
    $g.FillRectangle($gl, 5.1, 6.2, 5.8, 1.5)
}

# P.E.K.K.A — near-black violet heavy armour, huge shoulders, glowing eyes
Save-Sprite -Category troops -Name pekka -Size 16 -Palette @('#151022','#302246','#523a78','#9a86c4','#5ce8e0') -Draw {
    param($g)
    $dk = B '#151022'; $md = B '#302246'; $lt = B '#523a78'; $hi = B '#9a86c4'; $gl = B '#5ce8e0'
    # massive shoulder block
    $g.FillEllipse($dk, 0.6, 4.4, 14.8, 10.6)
    $g.FillEllipse($md, 1.6, 5.2, 12.8, 9.0)
    # squared pauldrons
    $pl = @( (New-Object System.Drawing.PointF(0.7,9.4)),
             (New-Object System.Drawing.PointF(1.4,4.6)),
             (New-Object System.Drawing.PointF(5.6,5.4)),
             (New-Object System.Drawing.PointF(5.2,9.8)) )
    $pr = @( (New-Object System.Drawing.PointF(15.3,9.4)),
             (New-Object System.Drawing.PointF(14.6,4.6)),
             (New-Object System.Drawing.PointF(10.4,5.4)),
             (New-Object System.Drawing.PointF(10.8,9.8)) )
    $g.FillPolygon($dk, $pl); $g.FillPolygon($dk, $pr)
    $g.FillEllipse($lt, 1.3, 5.2, 4.2, 3.4)
    $g.FillEllipse($lt, 10.5, 5.2, 4.2, 3.4)
    # helm
    $g.FillEllipse($dk, 4.4, 0.8, 7.2, 8.0)
    $g.FillEllipse($md, 5.1, 1.6, 5.8, 6.4)
    $g.FillEllipse($lt, 5.7, 2.0, 3.2, 2.2)
    $g.FillEllipse($gl, 5.9, 5.0, 1.8, 1.8)
    $g.FillEllipse($gl, 8.3, 5.0, 1.8, 1.8)
    # chest plate
    $g.FillEllipse($md, 5.4, 8.6, 5.2, 5.8)
    $g.FillEllipse($hi, 6.4, 9.2, 1.8, 2.0)
}

# Mega Knight — purple armour, huge spiked pauldrons, gold visor
Save-Sprite -Category troops -Name mega-knight -Size 16 -Palette @('#1e1230','#432a66','#7448a8','#b98fe0','#e8c24a') -Draw {
    param($g)
    $dk = B '#1e1230'; $md = B '#432a66'; $lt = B '#7448a8'; $hi = B '#b98fe0'; $gd = B '#e8c24a'
    # torso
    $g.FillEllipse($dk, 2.6, 6.0, 10.8, 9.2)
    $g.FillEllipse($md, 3.4, 6.8, 9.2, 7.6)
    # huge spiked pauldrons
    $sl = @( (New-Object System.Drawing.PointF(0.6,11.0)),
             (New-Object System.Drawing.PointF(0.9,6.4)),
             (New-Object System.Drawing.PointF(2.6,2.0)),
             (New-Object System.Drawing.PointF(3.8,6.0)),
             (New-Object System.Drawing.PointF(6.0,10.4)) )
    $sr = @( (New-Object System.Drawing.PointF(15.4,11.0)),
             (New-Object System.Drawing.PointF(15.1,6.4)),
             (New-Object System.Drawing.PointF(13.4,2.0)),
             (New-Object System.Drawing.PointF(12.2,6.0)),
             (New-Object System.Drawing.PointF(10.0,10.4)) )
    $g.FillPolygon($dk, $sl); $g.FillPolygon($dk, $sr)
    $g.FillEllipse($lt, 1.4, 7.0, 3.6, 3.2)
    $g.FillEllipse($lt, 11.0, 7.0, 3.6, 3.2)
    # helm
    $g.FillEllipse($dk, 5.0, 2.4, 6.0, 7.0)
    $g.FillEllipse($md, 5.7, 3.1, 4.6, 5.4)
    $g.FillRectangle($gd, 6.1, 5.6, 3.8, 1.3)
    # chest emblem
    $g.FillEllipse($lt, 5.9, 9.6, 4.2, 3.6)
    $g.FillEllipse($hi, 6.8, 10.2, 2.0, 1.8)
}

# Valkyrie — orange-red hair, steel armour, axe held out to the side
Save-Sprite -Category troops -Name valkyrie -Size 16 -Palette @('#2a2f3a','#6d7b8c','#c8d6e4','#8c2f14','#e8642a','#f7b46a') -Draw {
    param($g)
    $dk = B '#2a2f3a'; $st = B '#6d7b8c'; $sh = B '#c8d6e4'
    $hd = B '#8c2f14'; $hr = B '#e8642a'; $sk = B '#f7b46a'
    # hair mass
    $g.FillEllipse($hd, 2.4, 1.2, 10.4, 10.8)
    $g.FillEllipse($hr, 3.1, 1.9, 9.0, 9.0)
    $g.FillEllipse($sk, 4.4, 2.6, 3.8, 2.6)
    # armoured torso
    $g.FillEllipse($dk, 3.0, 8.2, 10.0, 7.4)
    $g.FillEllipse($st, 3.9, 8.9, 8.2, 6.0)
    $g.FillEllipse($sh, 5.0, 9.3, 4.2, 2.4)
    # face
    $g.FillEllipse($sk, 5.6, 4.8, 4.8, 4.6)
    $g.FillRectangle($dk, 6.6, 6.4, 1.1, 1.4)
    $g.FillRectangle($dk, 8.7, 6.4, 1.1, 1.4)
    # axe
    $g.DrawLine((P '#8c2f14' 1.3), 13.6, 2.6, 12.2, 13.2)
    $ax = @( (New-Object System.Drawing.PointF(12.8,1.6)),
             (New-Object System.Drawing.PointF(15.4,4.0)),
             (New-Object System.Drawing.PointF(12.6,6.2)) )
    $g.FillPolygon($sh, $ax)
}

# Prince — gold helm, blue plume, gold armour
Save-Sprite -Category troops -Name prince -Size 16 -Palette @('#2b1f06','#8a6a14','#d9a92c','#f6e08e','#1e3d8f','#5a8fe0') -Draw {
    param($g)
    $dk = B '#2b1f06'; $gm = B '#8a6a14'; $gl = B '#d9a92c'; $gh = B '#f6e08e'
    $bd = B '#1e3d8f'; $bl = B '#5a8fe0'
    # plume
    $g.FillEllipse($bd, 2.8, 0.5, 10.4, 5.2)
    $g.FillEllipse($bl, 4.0, 1.0, 8.0, 3.0)
    # body armour
    $g.FillEllipse($dk, 2.6, 6.0, 10.8, 9.4)
    $g.FillEllipse($gm, 3.4, 6.8, 9.2, 8.0)
    $g.FillEllipse($gl, 4.4, 7.2, 7.2, 3.6)
    # helm
    $g.FillEllipse($dk, 4.2, 2.6, 7.6, 7.4)
    $g.FillEllipse($gl, 4.8, 3.2, 6.4, 6.2)
    $g.FillEllipse($gh, 5.7, 3.7, 3.4, 2.4)
    $g.FillRectangle($dk, 5.5, 6.6, 5.0, 1.4)
    # sash
    $g.FillRectangle($bd, 3.8, 11.5, 8.4, 1.8)
}

# Dark Prince — dark purple armour, black plume, gold trim
Save-Sprite -Category troops -Name dark-prince -Size 16 -Palette @('#0e0a14','#291b3d','#4c3570','#8a6fb8','#c9a13a') -Draw {
    param($g)
    $dk = B '#0e0a14'; $md = B '#291b3d'; $lt = B '#4c3570'; $hi = B '#8a6fb8'; $gd = B '#c9a13a'
    # black plume
    $g.FillEllipse($dk, 2.8, 0.5, 10.4, 5.2)
    $g.FillEllipse($md, 4.2, 1.1, 7.6, 2.8)
    # body
    $g.FillEllipse($dk, 2.6, 6.0, 10.8, 9.4)
    $g.FillEllipse($md, 3.4, 6.8, 9.2, 8.0)
    $g.FillEllipse($lt, 4.4, 7.2, 7.2, 3.4)
    # helm
    $g.FillEllipse($dk, 4.2, 2.6, 7.6, 7.4)
    $g.FillEllipse($md, 4.8, 3.2, 6.4, 6.2)
    $g.FillEllipse($hi, 5.6, 3.6, 3.4, 2.3)
    $g.FillRectangle($gd, 5.5, 6.6, 5.0, 1.3)
    # gold belt
    $g.FillRectangle($gd, 3.8, 11.6, 8.4, 1.4)
}

# Lumberjack — green shirt, big brown beard, axe over the shoulder
Save-Sprite -Category troops -Name lumberjack -Size 16 -Palette @('#16281a','#2f6b34','#57a84e','#5a3a18','#b07838','#efdcb8') -Draw {
    param($g)
    $dk = B '#16281a'; $gm = B '#2f6b34'; $gl = B '#57a84e'
    $bd = B '#5a3a18'; $br = B '#b07838'; $sk = B '#efdcb8'
    # green shirt
    $g.FillEllipse($dk, 2.4, 7.0, 11.2, 8.4)
    $g.FillEllipse($gm, 3.2, 7.6, 9.6, 7.2)
    $g.FillEllipse($gl, 4.4, 8.0, 5.4, 2.8)
    # head
    $g.FillEllipse($bd, 3.8, 1.2, 8.4, 8.6)
    $g.FillEllipse($sk, 4.6, 2.0, 6.8, 7.0)
    # brown hair
    $g.FillEllipse($bd, 4.0, 1.0, 8.0, 3.2)
    $g.FillEllipse($br, 5.0, 1.4, 5.6, 1.9)
    # eyes
    $g.FillRectangle($bd, 6.0, 4.2, 1.2, 1.4)
    $g.FillRectangle($bd, 8.7, 4.2, 1.2, 1.4)
    # brown beard
    $g.FillEllipse($bd, 3.6, 5.6, 8.8, 6.4)
    $g.FillEllipse($br, 4.5, 6.1, 7.0, 4.4)
    # axe
    $g.DrawLine((P '#5a3a18' 1.4), 13.6, 4.0, 12.0, 13.6)
    $ax = @( (New-Object System.Drawing.PointF(12.4,1.4)),
             (New-Object System.Drawing.PointF(15.4,4.0)),
             (New-Object System.Drawing.PointF(12.6,6.6)) )
    $g.FillPolygon($sk, $ax)
}

# Hog Rider — brown hog, small rider on top
Save-Sprite -Category troops -Name hog-rider -Size 16 -Palette @('#33200f','#7a4d28','#b07a45','#eddcc0','#2c4a7a','#f08a3a') -Draw {
    param($g)
    $dk = B '#33200f'; $md = B '#7a4d28'; $lt = B '#b07a45'; $pl = B '#eddcc0'
    $bl = B '#2c4a7a'; $or = B '#f08a3a'
    # hog body
    $g.FillEllipse($dk, 0.8, 7.4, 14.4, 7.8)
    $g.FillEllipse($md, 1.6, 8.0, 12.8, 6.4)
    $g.FillEllipse($lt, 2.6, 8.4, 7.4, 2.2)
    # legs
    $g.FillRectangle($dk, 2.8, 13.2, 2.2, 2.2)
    $g.FillRectangle($dk, 10.2, 13.2, 2.2, 2.2)
    # hog ear
    $er = @( (New-Object System.Drawing.PointF(9.6,7.0)),
             (New-Object System.Drawing.PointF(9.2,3.4)),
             (New-Object System.Drawing.PointF(12.0,5.6)) )
    $g.FillPolygon($dk, $er)
    # hog head
    $g.FillEllipse($dk, 9.2, 6.0, 6.2, 7.0)
    $g.FillEllipse($md, 9.8, 6.6, 5.2, 5.8)
    # snout + eye
    $g.FillEllipse($pl, 12.2, 8.8, 3.2, 3.0)
    $g.FillRectangle($dk, 13.1, 9.7, 0.9, 1.2)
    $g.FillEllipse($dk, 10.2, 7.8, 1.5, 1.5)
    # rider torso
    $g.FillEllipse($dk, 1.8, 3.4, 7.6, 7.0)
    $g.FillEllipse($bl, 2.6, 4.1, 6.0, 6.0)
    # rider head
    $g.FillEllipse($dk, 2.6, 0.6, 5.8, 5.6)
    $g.FillEllipse($pl, 3.2, 1.2, 4.6, 4.4)
    $g.FillEllipse($or, 3.0, 0.8, 5.0, 2.4)
    $g.FillRectangle($dk, 4.0, 3.0, 0.9, 1.1)
    $g.FillRectangle($dk, 6.0, 3.0, 0.9, 1.1)
}

# Royal Hogs — pink hog wearing a steel helmet
Save-Sprite -Category troops -Name royal-hogs -Size 16 -Palette @('#6b2a44','#b8577e','#f294b4','#ffd4e4','#39424f','#9fb0c4') -Draw {
    param($g)
    $dk = B '#6b2a44'; $md = B '#b8577e'; $lt = B '#f294b4'; $pl = B '#ffd4e4'
    $hd = B '#39424f'; $hl = B '#9fb0c4'
    # body
    $g.FillEllipse($dk, 0.8, 5.4, 14.4, 9.8)
    $g.FillEllipse($md, 1.7, 6.1, 12.6, 8.4)
    $g.FillEllipse($lt, 3.0, 6.6, 8.6, 3.2)
    # legs
    $g.FillRectangle($dk, 3.0, 13.2, 2.2, 2.2)
    $g.FillRectangle($dk, 9.8, 13.2, 2.2, 2.2)
    # ear
    $er = @( (New-Object System.Drawing.PointF(9.6,7.4)),
             (New-Object System.Drawing.PointF(8.0,4.0)),
             (New-Object System.Drawing.PointF(11.4,5.8)) )
    $g.FillPolygon($dk, $er)
    # snout
    $g.FillEllipse($pl, 11.6, 8.8, 3.8, 3.4)
    $g.FillRectangle($dk, 12.6, 9.8, 1.0, 1.4)
    # eye
    $g.FillEllipse($dk, 10.0, 7.8, 1.5, 1.5)
    # helmet
    $g.FillEllipse($hd, 6.6, 2.0, 8.0, 5.4)
    $g.FillEllipse($hl, 7.4, 2.7, 6.2, 3.4)
    $g.FillRectangle($hd, 6.8, 5.4, 7.6, 1.3)
}

# Barbarians — tan skin, big blonde beard, fur vest
Save-Sprite -Category troops -Name barbarians -Size 16 -Palette @('#3a2410','#a9713c','#e0a469','#c99a2e','#f4e08a','#6b4a2a') -Draw {
    param($g)
    $dk = B '#3a2410'; $sk = B '#a9713c'; $sl = B '#e0a469'
    $bd = B '#c99a2e'; $bl = B '#f4e08a'; $fu = B '#6b4a2a'
    # fur vest body
    $g.FillEllipse($dk, 2.2, 7.0, 11.6, 8.4)
    $g.FillEllipse($fu, 3.0, 7.6, 10.0, 7.2)
    $g.FillEllipse($sl, 6.2, 8.2, 3.6, 6.4)
    # head
    $g.FillEllipse($dk, 3.9, 1.4, 8.2, 8.6)
    $g.FillEllipse($sk, 4.6, 2.1, 6.8, 7.2)
    $g.FillEllipse($sl, 5.4, 2.6, 4.4, 2.8)
    # hair
    $g.FillEllipse($bd, 4.2, 1.2, 7.6, 3.2)
    $g.FillEllipse($bl, 5.4, 1.5, 4.2, 1.8)
    # eyes
    $g.FillRectangle($dk, 6.0, 4.4, 1.2, 1.4)
    $g.FillRectangle($dk, 8.7, 4.4, 1.2, 1.4)
    # beard
    $g.FillEllipse($bd, 3.7, 6.0, 8.6, 6.2)
    $g.FillEllipse($bl, 4.8, 6.5, 6.4, 3.6)
}

# Elite Barbarians — orange beard, blue tunic
Save-Sprite -Category troops -Name elite-barbarians -Size 16 -Palette @('#2a1608','#c9491a','#f07a22','#f9b45a','#1b3f7a','#e0a469') -Draw {
    param($g)
    $dk = B '#2a1608'; $od = B '#c9491a'; $or = B '#f07a22'
    $oh = B '#f9b45a'; $bu = B '#1b3f7a'; $sk = B '#e0a469'
    # blue tunic
    $g.FillEllipse($dk, 2.2, 7.2, 11.6, 8.2)
    $g.FillEllipse($bu, 3.0, 7.8, 10.0, 7.0)
    $g.FillEllipse($sk, 6.2, 8.4, 3.6, 6.2)
    # head
    $g.FillEllipse($dk, 3.9, 1.4, 8.2, 8.6)
    $g.FillEllipse($sk, 4.6, 2.1, 6.8, 7.2)
    # hair
    $g.FillEllipse($od, 4.1, 1.1, 7.8, 3.4)
    $g.FillEllipse($or, 5.2, 1.5, 4.6, 2.0)
    # eyes
    $g.FillRectangle($dk, 6.0, 4.4, 1.2, 1.4)
    $g.FillRectangle($dk, 8.7, 4.4, 1.2, 1.4)
    # orange beard
    $g.FillEllipse($od, 3.6, 5.9, 8.8, 6.4)
    $g.FillEllipse($or, 4.5, 6.4, 7.0, 4.4)
    $g.FillEllipse($oh, 5.6, 6.8, 4.6, 2.2)
}

# Royal Recruits — blue tabard, steel helm, tall shield
Save-Sprite -Category troops -Name royal-recruits -Size 16 -Palette @('#101c33','#26478a','#4a7ede','#a9c8f5','#7d8fa6','#dfe9f5') -Draw {
    param($g)
    $dk = B '#101c33'; $bm = B '#26478a'; $bl = B '#4a7ede'; $bh = B '#a9c8f5'
    $st = B '#7d8fa6'; $sh = B '#dfe9f5'
    # body + blue tabard
    $g.FillEllipse($dk, 3.2, 4.4, 9.8, 11.0)
    $g.FillEllipse($bm, 4.0, 5.1, 8.2, 9.6)
    $g.FillEllipse($bl, 5.4, 8.0, 5.4, 6.6)
    $g.FillEllipse($bh, 6.4, 8.6, 2.0, 2.6)
    # helm
    $g.FillEllipse($dk, 4.4, 1.4, 7.2, 6.2)
    $g.FillEllipse($st, 5.0, 2.0, 6.0, 5.0)
    $g.FillEllipse($sh, 5.9, 2.5, 3.0, 2.0)
    $g.FillRectangle($dk, 5.4, 4.8, 5.2, 1.2)
    # tall shield
    $g.FillRectangle($dk, 0.6, 3.0, 5.6, 10.4)
    $g.FillEllipse($dk, 0.6, 10.0, 5.6, 5.2)
    $g.FillRectangle($st, 1.3, 3.7, 4.2, 9.4)
    $g.FillEllipse($st, 1.3, 9.6, 4.2, 4.2)
    $g.FillRectangle($sh, 1.9, 4.4, 1.8, 4.0)
}

# Goblins — green head, big pointed ears, dagger
Save-Sprite -Category troops -Name goblins -Size 16 -Palette @('#12300f','#2f7a2a','#5fb84a','#a8e07a','#2b2f38','#d7e3f0') -Draw {
    param($g)
    $dk = B '#12300f'; $gm = B '#2f7a2a'; $gl = B '#5fb84a'; $gh = B '#a8e07a'
    $mt = B '#2b2f38'; $st = B '#d7e3f0'
    # body
    $g.FillEllipse($dk, 4.0, 7.6, 8.0, 7.8)
    $g.FillEllipse($gm, 4.7, 8.2, 6.6, 6.6)
    # ears
    $el = @( (New-Object System.Drawing.PointF(5.4,4.6)),
             (New-Object System.Drawing.PointF(0.8,3.0)),
             (New-Object System.Drawing.PointF(5.6,8.2)) )
    $er = @( (New-Object System.Drawing.PointF(10.6,4.6)),
             (New-Object System.Drawing.PointF(15.2,3.0)),
             (New-Object System.Drawing.PointF(10.4,8.2)) )
    $g.FillPolygon($dk, $el); $g.FillPolygon($dk, $er)
    $el2 = @( (New-Object System.Drawing.PointF(5.2,5.2)),
              (New-Object System.Drawing.PointF(2.2,4.0)),
              (New-Object System.Drawing.PointF(5.4,7.2)) )
    $er2 = @( (New-Object System.Drawing.PointF(10.8,5.2)),
              (New-Object System.Drawing.PointF(13.8,4.0)),
              (New-Object System.Drawing.PointF(10.6,7.2)) )
    $g.FillPolygon($gl, $el2); $g.FillPolygon($gl, $er2)
    # head
    $g.FillEllipse($dk, 3.8, 1.8, 8.4, 8.2)
    $g.FillEllipse($gm, 4.5, 2.5, 7.0, 6.8)
    $g.FillEllipse($gl, 5.2, 2.9, 4.6, 3.0)
    # eyes
    $g.FillEllipse($gh, 5.7, 5.0, 2.0, 2.0)
    $g.FillEllipse($gh, 8.3, 5.0, 2.0, 2.0)
    $g.FillRectangle($dk, 6.3, 5.6, 1.0, 1.2)
    $g.FillRectangle($dk, 8.9, 5.6, 1.0, 1.2)
    # dagger
    $g.DrawLine((P '#2b2f38' 1.2), 12.6, 13.6, 13.2, 11.4)
    $bl = @( (New-Object System.Drawing.PointF(12.6,11.8)),
             (New-Object System.Drawing.PointF(14.4,8.0)),
             (New-Object System.Drawing.PointF(14.2,11.4)) )
    $g.FillPolygon($st, $bl)
}

# Spear Goblin — smaller green goblin holding a long spear
Save-Sprite -Category troops -Name spear-goblins -Size 16 -Palette @('#12300f','#2f7a2a','#5fb84a','#a8e07a','#7a5230','#d7e3f0') -Draw {
    param($g)
    $dk = B '#12300f'; $gm = B '#2f7a2a'; $gl = B '#5fb84a'; $gh = B '#a8e07a'
    $wd = B '#7a5230'; $st = B '#d7e3f0'
    # body
    $g.FillEllipse($dk, 4.2, 8.0, 7.6, 7.4)
    $g.FillEllipse($gm, 4.9, 8.6, 6.2, 6.4)
    # ears
    $el = @( (New-Object System.Drawing.PointF(5.0,5.0)),
             (New-Object System.Drawing.PointF(1.0,3.6)),
             (New-Object System.Drawing.PointF(5.4,8.4)) )
    $er = @( (New-Object System.Drawing.PointF(10.4,5.0)),
             (New-Object System.Drawing.PointF(13.8,3.6)),
             (New-Object System.Drawing.PointF(10.2,8.4)) )
    $g.FillPolygon($dk, $el); $g.FillPolygon($dk, $er)
    $el2 = @( (New-Object System.Drawing.PointF(5.0,5.6)),
              (New-Object System.Drawing.PointF(2.4,4.6)),
              (New-Object System.Drawing.PointF(5.2,7.6)) )
    $g.FillPolygon($gl, $el2)
    # head
    $g.FillEllipse($dk, 4.0, 2.6, 7.8, 7.6)
    $g.FillEllipse($gm, 4.7, 3.3, 6.4, 6.2)
    $g.FillEllipse($gl, 5.3, 3.7, 4.2, 2.8)
    # eyes
    $g.FillEllipse($gh, 5.8, 5.6, 1.9, 1.9)
    $g.FillEllipse($gh, 8.1, 5.6, 1.9, 1.9)
    $g.FillRectangle($dk, 6.4, 6.2, 0.9, 1.1)
    $g.FillRectangle($dk, 8.7, 6.2, 0.9, 1.1)
    # spear
    $g.DrawLine((P '#7a5230' 1.2), 13.6, 3.4, 10.8, 15.0)
    $tp = @( (New-Object System.Drawing.PointF(13.9,0.7)),
             (New-Object System.Drawing.PointF(15.2,4.0)),
             (New-Object System.Drawing.PointF(12.8,3.6)) )
    $g.FillPolygon($st, $tp)
}

# Wall Breakers — skeleton pushing a barrel with a lit fuse
Save-Sprite -Category troops -Name wall-breakers -Size 16 -Palette @('#2b2b28','#8d8b7d','#d8d5c2','#f4f2e6','#7a4a20','#ff9a30') -Draw {
    param($g)
    $dk = B '#2b2b28'; $bm = B '#8d8b7d'; $bl = B '#d8d5c2'; $bh = B '#f4f2e6'
    $wd = B '#7a4a20'; $fi = B '#ff9a30'
    # skull peeking over the top
    $g.FillEllipse($dk, 4.2, 0.6, 6.8, 6.4)
    $g.FillEllipse($bl, 4.8, 1.2, 5.6, 5.2)
    $g.FillEllipse($bh, 5.6, 1.6, 2.8, 2.0)
    $g.FillEllipse($dk, 5.6, 3.2, 1.7, 1.8)
    $g.FillEllipse($dk, 8.0, 3.2, 1.7, 1.8)
    # bony arms
    $g.DrawLine((P '#d8d5c2' 1.3), 4.6, 6.0, 2.2, 8.6)
    $g.DrawLine((P '#d8d5c2' 1.3), 10.6, 6.0, 12.8, 8.6)
    # barrel
    $g.FillEllipse($dk, 1.4, 5.8, 11.4, 9.6)
    $g.FillEllipse($wd, 2.2, 6.4, 9.8, 8.4)
    $g.FillRectangle($dk, 2.4, 8.4, 9.4, 1.0)
    $g.FillRectangle($dk, 2.4, 12.0, 9.4, 1.0)
    $g.FillRectangle($bm, 6.4, 6.6, 1.2, 8.0)
    # fuse + spark
    $g.DrawLine((P '#2b2b28' 1.1), 11.4, 6.6, 13.4, 4.4)
    $g.FillEllipse($fi, 12.6, 1.8, 3.2, 3.2)
    $g.FillEllipse($bh, 13.4, 2.6, 1.5, 1.5)
}

# Hopper — green grasshopper creature with big folded hind legs
Save-Sprite -Category troops -Name hopper -Size 16 -Palette @('#1a3312','#3f7a2a','#6db83c','#b6e05a','#2b2b28','#e8f0a0') -Draw {
    param($g)
    $dk = B '#1a3312'; $gm = B '#3f7a2a'; $gl = B '#6db83c'; $gh = B '#b6e05a'
    $ey = B '#2b2b28'; $sp = B '#e8f0a0'
    # big folded hind legs (bright, so they read against the darker body)
    $lp = P '#6db83c' 2.6
    $g.DrawLine($lp, 5.6, 10.4, 2.3, 5.6)
    $g.DrawLine($lp, 2.3, 5.6, 3.0, 14.0)
    $g.DrawLine($lp, 10.4, 10.4, 13.7, 5.6)
    $g.DrawLine($lp, 13.7, 5.6, 13.0, 14.0)
    $g.FillEllipse($gh, 1.4, 12.8, 3.4, 2.4)
    $g.FillEllipse($gh, 11.2, 12.8, 3.4, 2.4)
    # antennae
    $ap = P '#6db83c' 1.2
    $g.DrawLine($ap, 6.4, 2.4, 4.6, 0.6)
    $g.DrawLine($ap, 9.6, 2.4, 11.4, 0.6)
    # body
    $g.FillEllipse($dk, 4.0, 4.4, 8.0, 10.2)
    $g.FillEllipse($gm, 4.7, 5.1, 6.6, 8.6)
    $g.FillEllipse($gl, 5.4, 5.5, 3.8, 3.4)
    # head
    $g.FillEllipse($dk, 4.6, 1.2, 6.8, 6.4)
    $g.FillEllipse($gm, 5.2, 1.8, 5.6, 5.4)
    $g.FillEllipse($gh, 5.8, 2.2, 3.0, 2.0)
    # eyes
    $g.FillEllipse($sp, 5.5, 4.0, 2.0, 2.2)
    $g.FillEllipse($sp, 8.5, 4.0, 2.0, 2.2)
    $g.FillEllipse($ey, 6.0, 4.6, 1.2, 1.3)
    $g.FillEllipse($ey, 9.0, 4.6, 1.2, 1.3)
}
