# 0056 — Carte des températures sans tone mapping en WebGPU

- Statut : Proposé
- Date : 2026-11-15
- Issue : à créer

## Contexte

La légende de la carte des températures peint son dégradé avec `HEATMAP_COLORS`, en sRGB. Le sol doit montrer les mêmes couleurs, sinon la légende ne dit pas vrai.

- En WebGL, le `ShaderMaterial` du sol écrit ses couleurs telles quelles : il n'inclut ni le tone mapping ni la conversion de sortie. Le sol dégagé reprend au pixel près les couleurs de la légende.
- En WebGPU, three applique le tone mapping et la conversion sRGB à toute l'image, dans une passe finale : aucun matériau n'y échappe. Les couleurs du sol, lues comme linéaires, sortent délavées : jaune pâle et bleu clair, sans orange ni rouge.
- Décoder les couleurs du sol en linéaire ne suffit pas : le tone mapping Neutral ([ADR 0030](0030-eclairage-ciel-soleil-sans-reflets.md)) comprime et désature les couleurs vives. Aucune entrée ne donne un rouge ou un jaune purs.

## Décision

En WebGPU, le tone mapping se coupe tant que la carte des températures est activée. `Daylight` reçoit `toneMapped`, faux en WebGPU quand la carte est affichée. Le shader WebGPU du sol décode ses couleurs sRGB (`sRGBTransferEOTF`) : la conversion de sortie les rend telles quelles.

Le WebGL ne change pas : son sol échappe déjà au tone mapping, et le couper recompilerait tous les shaders de la scène.

## Conséquences

- Le sol reprend au pixel près les couleurs de la légende dans les deux rendus.
- En WebGPU, la maison translucide autour du sol perd le tone mapping et l'exposition tant que la carte est affichée. Elle s'éclaircit à peine, et une lampe vive peut saturer.
- En WebGPU, le tone mapping ne vit que dans la passe de sortie : le changer ne recompile aucun matériau.
- Changer `HEATMAP_COLORS` demande toujours de changer les deux shaders du sol.

## Alternatives considérées

- **Décoder les couleurs sans couper le tone mapping** : rouge (241, 33, 33) au lieu de (255, 0, 0), bleu froid (2, 43, 203) au lieu de (26, 51, 204). Proche, mais faux aux deux bouts de l'échelle.
- **Inverser le tone mapping Neutral dans le shader** : une vingtaine de lignes liées au tone mapping de `Daylight`, qui ne rendent pas non plus les couleurs vives.
- **Peindre la légende avec les couleurs tone-mappées** : elle changerait avec l'exposition, donc avec l'heure, et différerait entre WebGL et WebGPU.
