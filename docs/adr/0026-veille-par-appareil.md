# 0026 — Veille réglée par appareil, sur la config de la barre latérale, sans pause explicite de la 3D

- Statut : Proposé
- Date : 2026-10-25
- Issue : #24

## Contexte

Seule la tablette murale a besoin d'une veille : sur un ordinateur, un écran qui s'assombrit tout seul gêne. La config d'une maison est partagée par tous les appareils qui l'ouvrent, alors que les options de `AppContext` sont propres à chaque appareil (stockées dans le navigateur). La scène est rendue à la demande ([ADR 0002](0002-rendu-3d-a-la-demande.md)) : sans interaction, elle ne dessine une image que lorsqu'une entité affichée change.

## Décision

- Le délai de veille est une option de l'appareil (`screensaverMinutes`, « Jamais » par défaut), réglée dans la modale Système.
- `useIdle` passe en veille après ce délai sans `pointerdown`, `keydown` ni `wheel`.
- `Screensaver` recouvre toute l'interface. Il se ferme au `click`, pas au `pointerdown` : l'écran de veille reste sous le doigt jusqu'au relâcher, et le clic n'atteint jamais le bouton du dessous.
- Il affiche l'heure, la météo, les trajets `trains` des raccourcis et les alertes, en lisant la config de la barre latérale : pas de config propre à la veille. Il réutilise `getHouseAlerts`, `useTrainDepartures` (extrait de la tuile des trains) et `TrainDepartureDisplay`.
- Le fond est un ciel en dégradés CSS superposés : nuit, jour en opacité `useDaylight`, et une lueur orangée à l'aube et au crépuscule. `useDaylight` est extrait de `Daylight` : le ciel et l'éclairage de la scène suivent le même soleil. La nuit, le contenu passe à 60 % d'opacité. La classe `dark` force le thème sombre sur l'écran de veille, même quand le dashboard est en thème clair.
- Rien ne coûte au GPU pendant la veille : pas de `backdrop-filter`, pas d'animation infinie (icône météo fixe), une horloge mise à jour toutes les 10 s.
- La scène 3D n'est pas suspendue explicitement : le rendu à la demande la laisse déjà au repos. `useDaylight` garde en état la part du jour, et non la position du soleil : hors aube et crépuscule, la mise à jour de chaque minute est ignorée par React, et `Daylight` ne redessine pas la scène. Mesure sur la démo (build de prod) : 0 appel de dessin WebGL en 60 s de veille, contre une image par minute avant.

## Conséquences

- Le rendu de la scène 3D est inchangé. `Daylight` lit `useDaylight` au lieu de calculer le soleil lui-même ; le Canvas et les backends ne sont pas touchés.
- Un changement d'entité (une lumière qui s'allume) redessine toujours la scène sous l'écran de veille : une image de temps en temps, sans effet mesurable.
- L'application kiosque reste responsable du rétroéclairage et du maintien de l'écran allumé.

## Alternatives considérées

- **Délai dans la config de la maison** : il s'appliquerait aussi aux ordinateurs et aux téléphones.
- **`frameloop="never"` pendant la veille** : il faudrait faire passer l'état de veille jusqu'au Canvas, pour un gain nul en pratique.
- **Fermeture au `pointerdown`** : plus réactive, mais le relâcher tombe sur l'interface et peut actionner un bouton.
- **Écran noir avec l'heure seule** : la première version, jugée triste et pauvre en informations.
- **Scène 3D floutée en fond** (`backdrop-filter`) : un flou plein écran coûte cher sur l'Adreno 610 de la tablette, pour un écran qui doit rester au repos.
- **Config dédiée à la veille** : elle répéterait la météo, les trajets et les alertes déjà décrits pour la barre latérale.
