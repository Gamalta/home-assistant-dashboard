# 0026 — Veille réglée par appareil, sans pause explicite de la 3D

- Statut : Proposé
- Date : 2026-10-24
- Issue : #24

## Contexte

Seule la tablette murale a besoin d'une veille : sur un ordinateur, un écran qui s'assombrit tout seul gêne. La config d'une maison est partagée par tous les appareils qui l'ouvrent, alors que les options de `AppContext` sont propres à chaque appareil (stockées dans le navigateur). La scène est rendue à la demande ([ADR 0002](0002-rendu-3d-a-la-demande.md)) : sans interaction, elle ne dessine une image que lorsqu'une entité affichée change.

## Décision

- Le délai de veille est une option de l'appareil (`screensaverMinutes`, « Jamais » par défaut), réglée dans la modale Système.
- `useIdle` passe en veille après ce délai sans `pointerdown`, `keydown` ni `wheel`.
- `Screensaver` recouvre toute l'interface d'un écran noir avec l'heure. Il se ferme au `click`, pas au `pointerdown` : l'écran de veille reste sous le doigt jusqu'au relâcher, et le clic n'atteint jamais le bouton du dessous.
- La scène 3D n'est pas suspendue explicitement : le rendu à la demande la laisse déjà au repos. Mesure sur la démo (build de prod) : 0 image rendue en 60 s de veille.

## Conséquences

- Aucune modification de la scène 3D, du Canvas ou des backends.
- Un changement d'entité (une lumière qui s'allume) redessine toujours la scène sous l'écran de veille : une image de temps en temps, sans effet mesurable.
- L'application kiosque reste responsable du rétroéclairage et du maintien de l'écran allumé.

## Alternatives considérées

- **Délai dans la config de la maison** : il s'appliquerait aussi aux ordinateurs et aux téléphones.
- **`frameloop="never"` pendant la veille** : il faudrait faire passer l'état de veille jusqu'au Canvas, pour un gain nul en pratique.
- **Fermeture au `pointerdown`** : plus réactive, mais le relâcher tombe sur l'interface et peut actionner un bouton.
