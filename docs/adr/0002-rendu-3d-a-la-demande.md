# 0002 — Scène 3D en React Three Fiber, rendue à la demande

- Statut : Accepté
- Date : 2026-10-24 (décision antérieure, consignée a posteriori)

## Contexte

La maison 3D est le cœur de l'écran, mais elle est statique la plupart du temps : la caméra ne bouge que pendant une interaction, et les lumières ne changent qu'avec l'état de Home Assistant. Sur la tablette, rendre 60 images par seconde en continu chauffe le GPU et vide la batterie pour rien.

## Décision

La scène est écrite en React Three Fiber (`@react-three/fiber`, avec les helpers de `@react-three/drei`) et le `<Canvas>` utilise `frameloop="demand"`. Une image n'est rendue que si quelque chose appelle `invalidate()` : OrbitControls, un changement d'état d'entité, une animation de lumière.

## Conséquences

- La scène ne coûte rien au repos.
- Tout effet qui modifie la scène doit appeler `invalidate()`, sinon le changement n'apparaît qu'à la prochaine interaction.
- Une animation `useFrame` doit s'arrêter d'elle-même et ne réclamer une image que tant qu'elle n'a pas fini (voir `RoomLight3d`).
- Les étiquettes `<Html>` de drei suivent la caméra dans la même boucle : elles ne se mettent à jour que lorsqu'une image est rendue.

## Alternatives considérées

- **`frameloop="always"`** : plus simple à écrire, mais le GPU tourne en permanence.
- **three.js sans React** : il faudrait recâbler à la main l'état de Home Assistant (hooks @hakit) vers la scène.
