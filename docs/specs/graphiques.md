# Graphiques

- Issue : #57
- Statut : Livrée

## Problème

Le dashboard compte deux graphiques, l'historique de la modale Climat et les trois cartes de la modale Système, écrits chacun de leur côté. Trois autres arrivent (puissance d'une prise, consommation électrique, crédit immobilier) avec chacun son style : axes, grille, barres à graduations. Sur la tablette, les couleurs ne suivent pas le thème (bleu pur illisible en sombre), le curseur se lit mal au doigt, et un capteur à 0 % ou 0 W fait un trou dans la courbe.

## Objectif

Tous les graphiques du dashboard ont le même design, celui de l'historique Climat amélioré : une aire en dégradé pleine largeur, sans axes, sous la valeur actuelle affichée en grand.

## Hors périmètre

- Les graphiques des prises, de l'énergie et du crédit : ils passeront sur ce composant dans leurs propres PR (#38, #44, #48).
- Les axes, les graduations, le zoom et le choix de la période affichée.
- La légende : les libellés des séries apparaissent dans l'infobulle et la valeur actuelle par-dessus.

## Comportement attendu

### Scénario : historique de la modale Climat

- **Étant donné** la modale Climat d'une pièce qui a un capteur de température et un capteur d'humidité
- **Quand** l'utilisateur touche le bouton « Historique »
- **Alors** la température des dernières 24 h s'affiche en aire orange dégradée, l'humidité en trait bleu fin sur sa propre échelle, les deux aux couleurs du thème ; la valeur actuelle est en grand en haut à gauche, le minimum et le maximum en haut à droite, sans que la courbe ne passe dessous

### Scénario : valeur sous le curseur

- **Étant donné** l'historique affiché
- **Quand** l'utilisateur survole un point de la courbe
- **Alors** un trait vertical et un point marquent l'instant, et une infobulle donne l'heure et la valeur de chaque série, en français (« 21,5°C »)

### Scénario : valeur au doigt

- **Étant donné** l'historique affiché sur la tablette
- **Quand** l'utilisateur pose le doigt n'importe où sur le graphique, y compris sous la valeur actuelle
- **Alors** l'infobulle s'affiche au-dessus du doigt, qui ne la masque pas

### Scénario : retour au réglage

- **Étant donné** l'historique affiché
- **Quand** l'utilisateur touche le bouton « Réglage »
- **Alors** le thermostat revient à la place du graphique

### Scénario : graphiques de la modale Système

- **Étant donné** une maison dont la config déclare des graphiques système
- **Quand** l'utilisateur ouvre la modale Système
- **Alors** chaque capteur a sa carte : son libellé, sa valeur actuelle en grand et son aire des dernières 24 h, avec la même infobulle

### Scénario : chargement

- **Étant donné** un historique pas encore reçu de Home Assistant
- **Quand** le graphique s'affiche
- **Alors** il indique « Chargement… » à la place de la courbe

### Scénario : aucune donnée

- **Étant donné** un capteur sans aucune valeur sur la période
- **Quand** le graphique s'affiche
- **Alors** il indique « Aucune donnée »

### Scénario : capteur indisponible

- **Étant donné** un capteur passé `unavailable` pendant une heure
- **Quand** l'historique s'affiche
- **Alors** la courbe s'interrompt pendant l'heure d'indisponibilité ; une valeur à 0 est tracée, pas sautée

## Critères d'acceptation

- [x] Un seul composant, `Chart`, trace tous les graphiques ([ADR 0031](../adr/0031-un-composant-de-graphique-unique.md)).
- [x] L'historique Climat garde sa bascule réglage / historique, son minimum et son maximum, et l'heure de mise à jour au survol de la valeur.
- [x] Les couleurs viennent de la palette du thème, en clair comme en sombre.
- [x] Chaque scénario est couvert par un test : E2E `e2e/graphiques.spec.ts` ; unitaires `src/components/Charts/Chart.test.tsx` (chargement, aucune donnée) et `src/utils/chart.test.ts` (capteur indisponible, préparation des séries).
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : la scène 3D n'est pas touchée.

## Impacts

- Config : `SystemGraphConfigType.color` accepte une couleur de la palette (`'error'`, `'warning'`, `'info'`…) en plus d'une couleur CSS. La config `demo` garde ses couleurs CSS et perd les deux-points de ses libellés, désormais placés au-dessus de la valeur.
- Mock : l'historique simulé suit une marche aléatoire au lieu de valeurs tirées au hasard, comme un vrai capteur.
- Performance : un historique est ramené à un point par quart d'heure, soit 96 points sur 24 h au plus, quel que soit le nombre d'états reçus.
