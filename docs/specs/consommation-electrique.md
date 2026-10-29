# Consommation électrique

- Issue : #19
- Statut : Livrée

## Problème

Avec un compteur Linky en option heures pleines / heures creuses, savoir ce que la maison consomme et ce que cela coûte demande d'ouvrir Home Assistant sur un ordinateur. Devant la tablette murale, on ne sait ni si l'on est en heures creuses avant de lancer une machine, ni si l'on approche de la puissance souscrite.

## Objectif

Une carte « Énergie », dans le carrousel de la barre latérale, donne d'un coup d'œil la puissance instantanée, la période tarifaire et le coût du jour ; sa modale montre la consommation et le coût d'une semaine, d'un mois ou d'une année, comparés à la période précédente ou à la même période un an avant, et la charge par rapport à la puissance souscrite.

## Hors périmètre

- Les options tarifaires autres que heures pleines / heures creuses (Base, Tempo, EJP).
- L'abonnement et les taxes fixes : le coût est une estimation à partir du prix du kWh.
- La production (panneaux solaires) et la consommation par appareil.
- Le relevé des tarifs : ils sont écrits dans la config de la maison, et une période passée est estimée aux tarifs d'aujourd'hui.

## Comportement attendu

### Scénario : la carte affiche la puissance, la période tarifaire et le coût du jour

- **Étant donné** une maison configurée avec la carte `energy`
- **Quand** la barre latérale s'affiche
- **Alors** la carte « Énergie » indique en grand la puissance instantanée (« 850 VA », « 1,2 kVA »), puis « Heures pleines » dans la couleur principale du thème ou « Heures creuses » en bleu, avec une icône de la même couleur, et le coût estimé du jour (« Aujourd’hui : 1,15 € »)

### Scénario : la modale ouvre le mois en cours, comparé au mois précédent

- **Étant donné** les statistiques de Home Assistant pour les deux index
- **Quand** l'utilisateur touche la carte
- **Alors** la modale montre le mois en cours : en grand le total en kWh, dessous le coût estimé, puis l'écart avec le mois précédent à date égale (« +12 % par rapport à septembre 2026, à date égale »), dans la couleur principale si l'on consomme plus, en vert si l'on consomme moins
- **Et** sous ces chiffres, hors du tracé pour que la bande du survol ne les traverse pas, un graphique en barres empilées, heures pleines et heures creuses, montre chaque jour, aujourd'hui compris ; le mois précédent est tracé en pointillés, jour par jour
- **Et** une légende donne les kWh et le coût des heures pleines, des heures creuses et du mois précédent, avec sous chaque période tarifaire le prix du kWh retenu pour le coût (« 0,2516 €/kWh »)

### Scénario : ouvrir la modale depuis le menu rapide

- **Étant donné** une maison configurée avec la carte `energy`
- **Quand** l'utilisateur ouvre le menu rapide et touche « Énergie »
- **Alors** la même modale s'ouvre, depuis le bouton rond du menu
- **Et** sur téléphone, le graphique passe au-dessus des réglages et la modale tient dans la largeur de l'écran

### Scénario : changer d'échelle

- **Étant donné** la modale ouverte
- **Quand** l'utilisateur choisit « Semaine », « Mois » ou « Année »
- **Alors** la modale montre la semaine (du lundi), le mois ou l'année en cours : une barre par jour, ou par mois en année

### Scénario : comparer à la même période un an avant

- **Étant donné** la modale ouverte en semaine ou en mois
- **Quand** l'utilisateur choisit « Un an avant »
- **Alors** les pointillés, la légende et l'écart portent sur le même mois un an avant, ou sur la semaine 52 semaines avant (mêmes jours de la semaine)
- **Et** en année, « Un an avant » est désactivé : c'est l'année précédente

### Scénario : naviguer d'une période à l'autre

- **Étant donné** la modale ouverte sur la période en cours
- **Quand** l'utilisateur touche la flèche « Période précédente », puis « Période suivante »
- **Alors** la modale montre la période d'avant, comparée en entier (sans « à date égale »), puis revient à la période en cours
- **Et** la flèche « Période suivante » est désactivée sur la période en cours

### Scénario : historique indisponible

- **Étant donné** des index sans statistiques à long terme, ou une veille sans statistique
- **Quand** la modale est ouverte
- **Alors** les valeurs inconnues s'affichent « — », sans écart, et le jour en cours ne cumule pas plusieurs jours

### Scénario : le courant circule du compteur à la maison

- **Étant donné** la modale ouverte, en heures pleines
- **Quand** la maison consomme
- **Alors** en haut de la colonne de droite, un schéma relie le Linky à la maison par deux fils courts, « HP » et « HC », chacun avec son prix du kWh
- **Et** seul le fil des heures pleines s'anime, dans leur couleur, d'autant plus vite que la puissance est forte
- **Et** côté maison, la puissance instantanée (« 1,5 kVA ») et le coût horaire estimé à ce prix (« ≈ 0,38 €/h »)
- **Et** avec « réduire les animations » activé, le fil reste immobile, toujours dans la couleur de la période

### Scénario : charge par rapport à la puissance souscrite

- **Étant donné** une carte configurée avec `subscribedCurrentEntityId`
- **Quand** la modale est ouverte
- **Alors** sous la puissance, une jauge et « sur 6 kVA » donnent la charge par rapport à la puissance souscrite ; sans cette entité, seule la puissance apparaît

## Critères d'acceptation

- [x] La config ne demande que des entités et les deux tarifs.
- [x] Les consommations viennent des statistiques à long terme ([ADR 0021](../adr/0021-consommation-par-les-statistiques-long-terme.md)), par jour ou par mois selon l'échelle, une requête par période affichée ([ADR 0037](../adr/0037-comparaison-de-consommation-par-periode.md)).
- [x] Les index en Wh, kWh ou MWh sont convertis en kWh.
- [x] Le graphique est le composant commun `Chart` ([ADR 0031](../adr/0031-un-composant-de-graphique-unique.md)).
- [x] Lisible au doigt à 1280 × 800, en clair et en sombre.
- [x] Chaque scénario est couvert par un test : E2E `e2e/energie.spec.ts` et `e2e/mobile.spec.ts`, unitaires `src/utils/energy.test.ts`, `src/components/Modal/EnergyModal/EnergyModalContent.test.tsx`, `EnergyFlow.test.tsx` et `src/components/QuickMenu/index.test.tsx`.
- [x] L'animation du courant ne déplace que des transformations CSS, ne tourne que modale ouverte et respecte « réduire les animations » ([ADR 0045](../adr/0045-animation-du-courant-en-css.md)).

## Impacts

- Config : type de carte `energy` dans `ShortcutConfigType` ; le menu rapide reprend celle du carrousel, sans config de plus.
- Mock : un compteur fictif (`src/mock/mocks/mockEnergy.ts`) dont la puissance varie toutes les 5 s, avec des index cohérents et des statistiques quotidiennes et mensuelles depuis le 1er janvier d'il y a deux ans, plus fortes en hiver, sans hasard.
- Thème : les `ToggleButton` gardent la casse de leur libellé, comme les `Button`.
- Performance : aucun impact sur la scène 3D. La carte fait une requête par jour ; la modale, deux par période affichée (elle et sa comparaison), pas à chaque rendu. Modale ouverte, le fil animé ne sollicite que le compositeur.
