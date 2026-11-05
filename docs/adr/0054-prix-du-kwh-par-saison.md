# 0054 — Prix du kWh par saison, de novembre à mars

- Statut : Proposé
- Date : 2026-11-05
- Issue : #19

## Contexte

La modale « Énergie » estime le coût avec deux prix du kWh, heures pleines et heures creuses ([spec](../specs/consommation-electrique.md)). Certaines offres à prix de marché répercutent l'acheminement (TURPE) à quatre plages : heures pleines et creuses, en saison haute et en saison basse (« MU4 » ou « CU4 » sur le contrat). En 6 kVA, la part acheminement du kWh en heures pleines passe ainsi de 0,019 € TTC en saison basse à 0,083 € en saison haute : le kWh coûte un quart à un tiers de plus de novembre à mars, et un prix unique fausse le coût de chaque mois.

Contraintes :

- le ZLinky en mode historique ne donne que les index HCHP et HCHC, pas les quatre index du distributeur (EASD01 à EASD04 du mode standard) ;
- la saison haute du calendrier par défaut d'Enedis va de novembre à mars : un jour, comme un mois, tombe tout entier dans une saison ;
- la config doit rester celle d'aujourd'hui pour un contrat à deux prix.

## Décision

**Un second jeu de prix facultatif, `highSeasonPrices`**, à côté de `prices`, appliqué de novembre à mars. `prices` vaut alors pour avril à octobre.

- Chaque jour ou mois est compté aux prix de sa saison (`getCosts`) : un mois de mars au prix de la saison haute, une année au prix de chacun de ses mois.
- Les totaux donnent sous chaque période tarifaire le prix de la période affichée, ou sa fourchette si elle traverse les deux saisons (« 0,1896 à 0,2534 €/kWh »).
- Le courant du Linky et le coût horaire prennent les prix du jour.

## Conséquences

- Une maison à deux prix ne change rien à sa config.
- Le calendrier est fixe : un distributeur qui réduit la saison haute à décembre–février et 61 jours au choix fausse le coût de ces jours-là.
- Les évolutions de prix (TURPE chaque été, taxes) ne sont toujours pas suivies : une période passée est estimée aux prix d'aujourd'hui de sa saison.

## Alternatives considérées

- **Les quatre index du distributeur** : exact, mais il faut passer le Linky en mode standard et demander quatre statistiques par période au lieu de deux.
- **Un prix par mois** : plus général, mais douze couples de prix à écrire pour un besoin qui n'en demande que deux.
- **Un prix moyen annuel** : le plus simple, mais faux chaque mois par construction.
