# 0037 — Comparer la consommation par période, une requête par période affichée

- Statut : Proposé
- Date : 2026-10-24
- Issue : #19

## Contexte

La modale « Énergie » de l'[ADR 0021](0021-consommation-par-les-statistiques-long-terme.md) montre les 7 ou 30 derniers jours. Le propriétaire veut comparer : au mois précédent, à la même période un an avant. Il faut donc des semaines, des mois et des années entiers, et des données qui remontent à plus d'un an.

Contraintes :

- les statistiques à long terme de Home Assistant se demandent par jour, semaine ou mois (`period`), entre deux dates, et Home Assistant les agrège lui-même ;
- une année jour par jour pèse 730 lignes pour deux index, une année mois par mois 24 ;
- l'index courant donne la consommation de l'intervalle en cours plus tôt que sa statistique, compilée chaque heure (ADR 0021) ;
- les mois n'ont pas tous la même longueur, et une semaine un an avant ne tombe pas les mêmes jours ;
- une période en cours n'est pas finie : la comparer à une période entière fausse l'écart.

## Décision

**Trois échelles** : « Semaine » et « Mois » jour par jour (`period: 'day'`), « Année » mois par mois (`period: 'month'`). La modale ouvre le mois en cours. Elles remplacent les 7 et 30 derniers jours de l'ADR 0021, dont le calcul d'un intervalle ne change pas : la statistique pour un intervalle écoulé, l'index courant pour celui en cours.

**Deux requêtes, une par période affichée** (`useEnergyConsumption`) : la période affichée et la période comparée, chacune entre son début et sa fin (`start_time`, `end_time`). La période en cours demande aussi l'intervalle qui la précède, dont l'index de fin sert de départ à l'intervalle en cours. Chaque requête dépend de ses bornes : un nouveau rendu (l'index change toutes les 5 s) ne la rejoue pas ; changer de comparaison ne recharge que la période comparée.

**Comparaison** :

- « période précédente » : semaine, mois ou année d'avant ;
- « un an avant » : le même mois ou la même année, et pour une semaine la semaine 52 semaines avant, pour comparer les mêmes jours de la semaine. En année, les deux reviennent au même : seule la première est proposée ;
- les intervalles s'alignent par leur rang, le 1er avec le 1er : un 29 février n'a pas de jour comparé, le 31 d'un mois de 30 jours non plus ;
- l'écart compare les totaux. Pour une période en cours, il est calculé **à date égale** : la période comparée s'arrête au même temps écoulé, et son intervalle coupé compte au prorata. Une période écoulée se compare en entier, quelle que soit sa longueur.

Les bornes, l'alignement, l'écart et les coûts sont des fonctions pures de `src/utils/energy.ts`.

## Conséquences

- On remonte aussi loin que les statistiques à long terme, sans changer la config.
- Chaque vue charge au plus 32 + 31 lignes par index, ou 13 + 12 en année.
- Une navigation rejoue ses deux requêtes, même vers une période déjà vue : pas de cache, pour rester simple. À revoir si l'attente se voit sur la tablette.
- La carte du carrousel passe par le même hook, pour le jour en cours.
- Limites :
  - le prorata suppose une consommation régulière dans l'intervalle coupé : à 8 h, le jour comparé compte pour un tiers, quelles que soient les heures de chauffe ;
  - un jour sans statistique est ignoré des deux totaux. Si Home Assistant a été arrêté, la consommation manquante est comptée le jour du redémarrage et le total reste juste ; mais le mois où les statistiques commencent se compare à un mois entier ;
  - les mois sont découpés par Home Assistant dans son fuseau : il doit être celui de la tablette (ADR 0021).

## Alternatives considérées

- **Tout charger à l'ouverture** (au moins 14 mois jour par jour) et découper côté tablette : plus d'attente en navigant, mais plus de 400 lignes par index à chaque ouverture, une limite au passé consultable et les mois recalculés à partir des jours.
- **Statistiques horaires** pour comparer à l'heure près : 24 fois plus de lignes, pour corriger un prorata qui ne pèse qu'un jour sur un mois.
- **Comparer une période en cours à la période entière** : « −60 % » le 10 du mois, faux.
- **Un an avant aux mêmes dates pour une semaine** (du 19 au 25 octobre 2025) : compare un samedi à un dimanche, alors que la consommation dépend du jour de la semaine.
- **`period: 'week'`** pour l'échelle « Semaine » : une seule barre, sans le détail des jours.
