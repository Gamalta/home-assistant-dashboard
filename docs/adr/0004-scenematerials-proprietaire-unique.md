# 0004 — `SceneMaterials`, seul propriétaire des matériaux du modèle

- Statut : Accepté
- Date : 2026-10-24 (décision antérieure, consignée a posteriori)

## Contexte

Plusieurs options transforment les matériaux du modèle : murs qui s'effacent près de la caméra, carte des températures au sol (la maison devient alors translucide) et passage en Lambert quand les reflets sont désactivés. La scène glTF est partagée par le cache de `useGLTF`. Quand chaque option modifiait les matériaux de son côté, le résultat dépendait de l'ordre d'activation.

## Décision

`src/components/3d/House/SceneMaterials.tsx` est le seul composant autorisé à modifier `mesh.material`. Il garde le matériau d'origine dans `mesh.userData.originalMaterial` et, à chaque changement d'option, recompose le matériau final à partir de l'original. Il libère ensuite les matériaux qu'il a créés. Le type d'un matériau se déduit de son nom Blender : `room_*` pour un sol, `wall_*`, `white` ou `yellowbrt` pour un mur.

## Conséquences

- Les options se combinent de façon déterministe.
- Le nommage des matériaux dans Blender fait partie du contrat : renommer un matériau peut casser un effet sans aucune erreur.
- Les murs effaçables ajoutent un mesh de fondu par mur, donc un draw call de plus par mur.

## Alternatives considérées

- **Un composant par effet** : c'était la situation d'origine, avec des effets qui se marchaient dessus.
- **Post-traitement plein écran** : trop coûteux en fill rate pour l'Adreno 610.
