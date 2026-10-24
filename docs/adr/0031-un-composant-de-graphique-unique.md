# 0031 — Un composant de graphique unique

- Statut : Proposé
- Date : 2026-10-24
- Issue : #57

## Contexte

Deux graphiques existent, l'historique de la modale Climat (`TemperatureModalContent`) et les cartes de la modale Système (`SystemGraphDisplay`). Ils composent chacun `ChartsContainer`, `AreaPlot` et `LinePlot` de @mui/x-charts, avec le même code recopié et les mêmes défauts :

- leurs sélecteurs CSS (`.MuiLineElement-series-…`) n'existent plus depuis @mui/x-charts 9 : l'épaisseur des traits et l'atténuation de l'humidité ne s'appliquent plus ;
- `Number(état) || null` fait un trou d'une valeur à 0, et `Math.max()` d'un historique vide affiche « Infinity » ;
- les couleurs sont écrites en dur (`orange`, `blue`, `cyan`) et ne suivent pas le thème ;
- l'identifiant du `clipPath` est le même pour les trois cartes Système.

Trois branches ajoutent des graphiques, chacune dans un style différent : `LineChart` avec axes pour le crédit, `BarChart` empilé avec grille et graduations pour l'énergie, aire en escalier sans arrondi pour les prises. Le propriétaire veut un seul design, celui de l'historique Climat.

Les besoins à couvrir : une série dans le temps (puissance, capteur système), deux mesures d'unités différentes (température et humidité), des totaux par jour ou par mois empilés (heures pleines et creuses) comparés à une période précédente, une courbe sur des années (capital restant dû).

## Décision

Un composant `Chart` (`src/components/Charts/Chart.tsx`) trace tous les graphiques du dashboard. Il porte le design et le dashboard n'importe plus @mui/x-charts ailleurs.

- **Design.** Pas d'axes ni de légende. L'aire est en dégradé de la couleur de la série vers la transparence, la courbe lissée (`monotoneX`, qui ne dépasse jamais les points). Le domaine vertical laisse le tiers haut libre pour la valeur actuelle, que l'appelant passe en `children` et qui s'affiche par-dessus. `bleed` étend l'aire jusqu'aux bords de la modale.
- **Séries.** Une série sans variante est principale : aire, ou barre ; plusieurs s'empilent. `variant: 'line'` trace une mesure secondaire en trait fin, sur sa propre échelle. `variant: 'comparison'` trace une période de référence en pointillés gris, sur l'échelle principale. `step` trace en escalier.
- **Barres pour les totaux par période.** Un kWh par jour est un total, pas une mesure continue : une aire laisserait lire une valeur entre deux jours. `bars` remplace les aires par des barres arrondies, dans le même dégradé et sans axes. Elles partent toujours de zéro. La comparaison reste un trait en pointillés, qui se lit par-dessus les barres sans en doubler le nombre.
- **Couleurs.** Une couleur de la palette (`'warning'`, `'info'`…) est remplacée par sa variable CSS (`theme.vars`) : le graphique change de thème sans nouveau rendu. Une couleur CSS est gardée telle quelle, pour les configs existantes.
- **Interaction.** Infobulle par abscisse, trait vertical et point sur chaque courbe. La valeur actuelle laisse passer le pointeur : le doigt peut viser tout le graphique. @mui/x-charts place l'infobulle au-dessus du doigt.
- **États.** « Chargement… » tant que l'historique n'est pas reçu, « Aucune donnée » sans valeur.
- **Données.** La préparation est faite de fonctions pures dans `src/utils/chart.ts`. `alignHistories` ramène des historiques Home Assistant à une grille commune d'un quart d'heure, prolonge chaque valeur jusqu'au changement suivant (Home Assistant n'enregistre que les changements) et fait un trou d'un état indisponible.

## Conséquences

- Les graphiques des prises, de l'énergie et du crédit se réduisent à une préparation de données et un appel à `Chart` ([guide](../guides/graphiques.md)).
- Une évolution du design se fait à un seul endroit ; une option nouvelle doit servir plusieurs graphiques pour y entrer.
- Un historique de 24 h tient en 96 points au plus, même pour un capteur qui publie toutes les secondes : le tracé et l'infobulle restent légers sur la tablette. En contrepartie, un pic plus court qu'un quart d'heure peut disparaître ; `alignHistories` accepte un pas plus fin.
- Pas de nouvelle dépendance : @mui/x-charts 9.1 était déjà là.
- À surveiller : `Chart` dépend de détails de @mui/x-charts (props des slots `area`, `bar` et `line`, classes `chartsTooltipClasses`), à revérifier à chaque montée de version majeure.

## Alternatives considérées

- **`LineChart` et `BarChart` de @mui/x-charts, réglés à chaque usage** : c'est ce qui a produit trois styles différents en trois branches.
- **Un composant par forme (aire, barres)** : l'en-tête, l'infobulle, les couleurs et les états seraient dupliqués pour une différence d'une vingtaine de lignes.
- **Aires pour les kWh par jour** : un seul rendu, mais une aire continue entre des totaux journaliers est trompeuse. En escalier, les jours se lisent mais deux séries empilées et une comparaison se chevauchent mal.
- **Comparaison en barres atténuées** : à côté des barres, elle double leur nombre (60 barres fines sur 30 jours) ; derrière, elle demande un second axe de bandes.
- **Escalier par défaut** : fidèle à Home Assistant, mais une température en marches d'escalier se lit moins bien qu'une courbe.
- **Garder tous les points de l'historique** : précis, mais un capteur bavard donne des milliers de points par jour à tracer et à parcourir à chaque mouvement du doigt.
- **Une autre bibliothèque (Recharts, uPlot)** : une dépendance de plus pour un rendu que @mui/x-charts permet déjà.
