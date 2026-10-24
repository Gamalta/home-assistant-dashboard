# Consommation électrique

- Issue : #19
- Statut : Livrée

## Problème

Avec un compteur Linky en option heures pleines / heures creuses, savoir ce que la maison consomme et ce que cela coûte demande d'ouvrir Home Assistant sur un ordinateur. Devant la tablette murale, on ne sait ni si l'on est en heures creuses avant de lancer une machine, ni si l'on approche de la puissance souscrite.

## Objectif

Une carte « Énergie », dans le carrousel de la barre latérale, donne d'un coup d'œil la puissance instantanée, la période tarifaire et le coût du jour ; sa modale donne la consommation et le coût du jour et de la veille, l'historique sur 7 et 30 jours et la charge par rapport à la puissance souscrite.

## Hors périmètre

- Les options tarifaires autres que heures pleines / heures creuses (Base, Tempo, EJP).
- L'abonnement et les taxes fixes : le coût est une estimation à partir du prix du kWh.
- La production (panneaux solaires) et la consommation par appareil.
- Le relevé des tarifs : ils sont écrits dans la config de la maison.

## Comportement attendu

### Scénario : la carte affiche la puissance, la période tarifaire et le coût du jour

- **Étant donné** une maison configurée avec la carte `energy`
- **Quand** la barre latérale s'affiche
- **Alors** la carte « Énergie » indique en grand la puissance instantanée (« 850 VA », « 1,2 kVA »), puis « Heures pleines » en orange ou « Heures creuses » en bleu, avec une icône de la même couleur, et le coût estimé du jour (« Aujourd’hui : 1,15 € »)

### Scénario : la modale affiche la consommation du jour et son coût

- **Étant donné** les statistiques de Home Assistant pour les deux index
- **Quand** l'utilisateur touche la carte
- **Alors** la carte « Aujourd'hui » affiche le coût estimé et la consommation en heures pleines et en heures creuses depuis minuit

### Scénario : la modale affiche la consommation de la veille

- **Étant donné** une statistique pour la veille
- **Quand** la modale est ouverte
- **Alors** la carte « Hier » affiche le coût et la consommation de la veille

### Scénario : historique sur 7 et 30 jours

- **Étant donné** la modale ouverte
- **Quand** l'utilisateur choisit « 7 jours » ou « 30 jours »
- **Alors** un graphe en barres empilées montre la consommation de chaque jour, heures pleines et heures creuses, aujourd'hui compris

### Scénario : historique indisponible

- **Étant donné** des index sans statistiques à long terme, ou une veille sans statistique
- **Quand** la modale est ouverte
- **Alors** les valeurs inconnues s'affichent « — », sans cumuler plusieurs jours dans la consommation du jour

### Scénario : charge par rapport à la puissance souscrite

- **Étant donné** une carte configurée avec `subscribedCurrentEntityId`
- **Quand** la modale est ouverte
- **Alors** elle affiche « Charge : 1,5 kVA sur 6 kVA souscrits » et une jauge ; sans cette entité, la charge n'apparaît pas

## Critères d'acceptation

- [x] La config ne demande que des entités et les deux tarifs.
- [x] La consommation du jour, la veille et l'historique viennent des statistiques à long terme ([ADR 0021](../adr/0021-consommation-par-les-statistiques-long-terme.md)).
- [x] Les index en Wh, kWh ou MWh sont convertis en kWh.
- [x] Chaque scénario est couvert par un test : E2E `e2e/energie.spec.ts`, unitaires `src/utils/energy.test.ts` et `src/components/Modal/EnergyModal/EnergyModalContent.test.tsx`.

## Impacts

- Config : type de carte `energy` dans `ShortcutConfigType`.
- Mock : un compteur fictif (`src/mock/mocks/mockEnergy.ts`) dont la puissance varie toutes les 5 s, avec des index cohérents et 30 jours de statistiques simulées.
- Performance : aucun impact sur la scène 3D. La modale fait une requête à son ouverture, et la carte une seule à son affichage, pour l'index de fin de veille.
