# 0045 — Animer le courant en CSS, sur le compositeur

- Statut : Proposé
- Date : 2026-10-29
- Issue : #19

## Contexte

La modale « Énergie » montre le courant qui circule du Linky à la maison : un fil par période tarifaire, celui de la période en cours animé, plus vite quand la maison consomme plus. L'animation tourne en continu tant que la modale est ouverte, devant la scène 3D, sur une tablette limitée par son GPU (Adreno 610, [ADR 0009](0009-budget-performance-tablette.md)).

Contraintes :

- la scène est rendue à la demande ([ADR 0002](0002-rendu-3d-a-la-demande.md)) : l'animation ne doit pas la faire redessiner ;
- la puissance change à chaque relevé du compteur, toutes les quelques secondes ;
- changer la durée d'une animation CSS en cours la fait sauter à une autre position.

## Décision

**Une animation CSS qui ne déplace qu'une transformation.** Le fil est une bande de points (`repeating-linear-gradient`) qui glisse d'un motif par tour (`translateX`, `keyframes` de MUI, comme l'icône de la météo). Le navigateur la confie au compositeur : ni React, ni le layout, ni la scène 3D ne travaillent pendant qu'elle tourne.

**La vitesse suit la puissance par paliers** (`getFlowDuration`) : quatre durées, de 2 s sous 500 VA à 0,4 s au-delà de 3 kVA. La durée ne change, et le fil ne saute, que lorsqu'un palier est franchi, pas à chaque relevé.

**Elle ne tourne que modale ouverte**, puisque la modale fermée n'est pas rendue, et **s'arrête avec « réduire les animations »** (`prefers-reduced-motion`) : le fil reste alors immobile, dans la couleur de la période.

## Conséquences

- Modale ouverte, le compositeur recompose une petite bande à chaque image : un coût GPU faible mais continu. Mesuré sur le build de production (Chromium sans écran, WebGL logiciel), fil animé ou en pause : un seul layout en 3 s dans les deux cas, aucun script à chaque image, et un écart de `__dashboardBenchmark` noyé dans le bruit du rendu logiciel. Le coût sur l'Adreno 610 reste à vérifier sur la tablette.
- Sans puissance connue, ou à 0 VA, le fil ne bouge pas.
- La vitesse n'est pas proportionnelle à la puissance : elle n'en donne qu'un ordre de grandeur, la valeur exacte reste affichée à côté.

## Alternatives considérées

- **Animer `stroke-dashoffset` d'un tracé SVG** : la propriété n'est pas composée, le navigateur repeint le tracé à chaque image.
- **framer-motion ou `requestAnimationFrame`** : l'animation passe par le thread principal, en concurrence avec React et three.js.
- **`updatePlaybackRate` (Web Animations) pour changer la vitesse sans saut** : demande un effet et une référence au DOM pour un gain invisible, les paliers suffisent.
- **Un fil dans l'en-tête, à la place de la pastille de charge** : plus discret, mais trop court pour montrer les deux tarifs et leur prix, et la pastille passait déjà sur deux lignes sur téléphone.
