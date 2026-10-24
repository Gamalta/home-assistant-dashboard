# 0021 — Consommation électrique tirée des statistiques à long terme

- Statut : Proposé
- Date : 2026-10-24
- Issue : #19

## Contexte

La tuile « Énergie » affiche la consommation du jour et de la veille, en heures pleines et en heures creuses, et un historique sur 7 et 30 jours. Le compteur Linky, lu par un module TIC, publie deux index cumulés (HC et HP, en kWh par exemple avec Zigbee2MQTT) et la période tarifaire en cours. Plusieurs sources sont possibles :

- **Un index relevé en fin de journée** par une automatisation, dans un `counter` : consommation du jour = index courant − relevé.
- **L'historique des états** (`history/stream`, celui des hooks `useEntity` de @hakit) : consommation = index courant − index à minuit.
- **Les statistiques à long terme** (`recorder/statistics_during_period`) : Home Assistant les compile chaque heure pour tout capteur `state_class: total_increasing`, et son tableau de bord Énergie s'en sert.

Contraintes :

- le recorder purge l'historique des états au bout de 10 jours par défaut, alors que les statistiques à long terme sont gardées indéfiniment ;
- le module TIC publie l'index tous les 0,1 kWh, soit plusieurs dizaines d'états par jour et par index : 30 jours d'historique pèsent des milliers de points à charger sur la tablette ;
- la démo et les autres maisons n'ont pas l'automatisation de relevé.

## Décision

La modale lit les **statistiques quotidiennes** des deux index : une requête `recorder/statistics_during_period` à l'ouverture, sur 30 jours, avec `period: 'day'`, `types: ['change', 'state']` et `units: {energy: 'kWh'}`.

- Un jour passé vaut la `change` de sa statistique, déjà corrigée par Home Assistant des remises à zéro de l'index.
- **Aujourd'hui** vaut l'index courant moins le `state` de la statistique d'hier, c'est-à-dire l'index à minuit. La statistique du jour n'est compilée qu'à chaque heure : l'index courant donne une valeur à jour.
- Le calcul est une fonction pure (`getDailyConsumption`, `src/utils/energy.ts`) ; la requête vit dans le hook `useEnergyStatistics`. C'est le premier appel direct au WebSocket hors des hooks de @hakit, qui n'expose pas les statistiques.
- La tuile ne lit que la puissance et la période tarifaire, sans requête.

## Conséquences

- La config se limite aux entités du compteur et aux tarifs : ni automatisation, ni `counter`.
- Le graphe couvre 30 jours quelle que soit la durée de conservation du recorder, pour deux fois 30 points.
- Les index doivent avoir des statistiques à long terme (`state_class: total_increasing`, que Zigbee2MQTT pose sur les capteurs en kWh). Sinon, la modale affiche « — ».
- Limites :
  - **relevé manqué** : sans statistique pour hier (capteur créé aujourd'hui, Home Assistant arrêté toute la journée d'hier), la consommation du jour reste vide plutôt que de cumuler plusieurs jours. Si Home Assistant est arrêté autour de minuit, l'index de fin de veille est le dernier connu : l'énergie consommée entre-temps est comptée dans aujourd'hui ;
  - **remise à zéro ou remplacement du compteur** : un index courant inférieur à celui de la veille donne une consommation du jour vide, jusqu'au lendemain ;
  - les jours sont découpés selon le fuseau de Home Assistant et comparés à celui de la tablette : les deux doivent être identiques ;
  - les statistiques sont chargées à l'ouverture de la modale : laissée ouverte après minuit, elle calcule sur des statistiques d'hier incomplètes jusqu'à sa réouverture ;
  - le mock simule cette requête (`src/mock/mocks/mockEnergy.ts`) ; une évolution de l'API du recorder ne serait pas détectée par les tests.

## Alternatives considérées

- **Index relevé en fin de journée dans un `counter`** : instantané, mais un relevé manqué (Home Assistant redémarre à l'heure de l'automatisation) fait compter deux jours sans que rien ne le signale, un `counter` ne stocke que des entiers (kWh tronqués) et la source n'existe que dans une maison. La veille et l'historique demanderaient de toute façon une autre source.
- **Historique des états (`useEntity` avec `historyOptions`)** : déjà utilisé par d'autres modales, mais limité à la durée de conservation du recorder (10 jours par défaut) et lourd sur 30 jours. Il faudrait aussi traiter soi-même les remises à zéro.
- **`change` de la statistique du jour** : plus simple, mais en retard d'une heure au plus.
- **`recorder/statistic_during_period`, une requête par jour** : précis à 5 minutes près, mais une requête par jour affiché.
