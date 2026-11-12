# 0055 — Aucun flux dans la modale TV pendant une couleur fixe

- Statut : Proposé
- Date : 2026-11-06
- Issue : #18

## Contexte

La modale TV affiche en direct les deux caméras de HyperHDR ([ADR 0020](0020-reglages-par-nom-de-lumiere-et-tv-en-direct.md)) : « LED Colors », l'image que traite HyperHDR, et « LED Gradient », la couleur de chaque LED.

HyperHDR ne diffuse l'image (`imagestream`) que si la source visible en est une : `HyperHdrInstance::setInputImage`, qu'appellent la capture vidéo et les effets, rendus en 80 × 45. Une couleur fixe (`setColor`) ne passe que par les LED. Pendant une couleur fixe, « LED Colors » garde donc sa dernière image : la modale montrait une image figée de la TV, sans rapport avec les LED, toutes de la même couleur. Cette couleur est connue sans flux : c'est celle de la lumière (`rgb_color`).

## Décision

**Quand l'ambilight est allumé en couleur fixe (effet `Solid`), la modale n'ouvre aucun flux.** L'écran reste noir et `LedGlow` peint la zone de chaque LED de la couleur de la lumière, au lieu de la lire dans « LED Gradient ». Hors couleur fixe, rien ne change.

## Conséquences

- Plus d'image figée trompeuse, et deux connexions et deux décodages MJPEG de moins tant que la couleur reste fixe.
- Le halo ne suit pas la luminosité : `rgb_color` est la couleur à pleine luminosité.
- Éteinte, une lumière n'expose plus son effet dans Home Assistant : la modale ne sait pas si la dernière source était une couleur et affiche le flux de l'image, qui peut alors être figé.
- Dans la démo, le halo prend la couleur choisie, alors que ses caméras fictives servent des images fixes.

## Alternatives considérées

- **Garder les deux flux** : l'image figée laisse croire que l'ambilight suit encore la TV.
- **Un aplat de la couleur à la place de l'image** : la TV n'affiche pas cette couleur ; le noir est fidèle, d'autant qu'une couleur d'ambiance va souvent avec une TV éteinte.
- **Garder le flux des LED pour le halo** : il suivrait la luminosité, mais au prix de dix images par seconde à décoder pour une couleur uniforme.
