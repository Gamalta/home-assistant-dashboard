# 0027 — Lire les trains de sncf_trains par le préfixe du trajet

- Statut : Proposé
- Date : 2026-10-24
- Issue : #26

## Contexte

L'intégration HACS [sncf_trains](https://github.com/Master13011/SNCF-API-HA) (version 1.3.3) interroge l'API SNCF (`/journeys`, `data_freshness=realtime`, 10 trajets au plus) depuis le début de la plage horaire du trajet. Le code lu est celui du commit [`f684977`](https://github.com/Master13011/SNCF-API-HA/blob/f68497785c4943ecbc852aef01b2b2a90aa0dd6e/custom_components/sncf_trains/sensor.py), identique à la version 1.3.3 pour `sensor.py`, `helpers.py` et `coordinator.py`.

Pour chaque trajet, elle crée :

- un capteur par train, `sensor.sncf_<départ>_<arrivée>_train_<n>`, avec `n` de 1 au nombre de trains choisi pour le trajet. Ce nombre est borné par les trajets renvoyés au chargement de l'intégration, donc à 10 (`SncfTrainSensor`) ;
- un capteur « Tous les trains (ligne) », `sensor.sncf_tous_les_trains_ligne`, puis `_2`, etc. Son identifiant ne nomme pas le trajet, et ses attributs sont des chaînes jointes par « ; » (`SncfAllTrainsLineSensor`).

Pour toute l'intégration, elle crée aussi `sensor.sncf_trajets` (nombre de trajets) et `calendar.sncf_trains`.

Le capteur d'un train publie les données suivantes :

| Donnée                                      | Valeur                                                                                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| état                                        | départ **prévu**, horodatage (`device_class: timestamp`), ou `unknown` quand l'API renvoie moins de trajets que de capteurs             |
| `departure_time`, `arrival_time`            | départ et arrivée réels, au format `24/10/2026 - 07:42` dans le fuseau de Home Assistant, ou `N/A`                                      |
| `base_departure_time`, `base_arrival_time`  | départ et arrivée prévus, au même format                                                                                                |
| `delay_minutes`, `has_delay`                | retard **à l'arrivée** (arrivée réelle moins arrivée prévue)                                                                            |
| `duration_minutes`                          | durée réelle du trajet                                                                                                                  |
| `commercial_mode`, `train_num`, `direction` | mode (« TER »), numéro et direction                                                                                                     |
| voie                                        | absente                                                                                                                                 |
| suppression                                 | absente : l'API en temps réel ne renvoie plus un train supprimé (le README l'indique : « Ne prend pas en compte les trains supprimés ») |

Un train déjà parti reste dans les capteurs tant que la plage horaire n'est pas finie.

## Décision

La tuile `trains` lit les capteurs par train d'un trajet, déduits d'un préfixe comme dans l'ADR 0018 (PR #37) : `prefix: 'sncf_paris_lyon'` donne `sensor.sncf_paris_lyon_train_1` à `_train_10`, et les capteurs absents sont ignorés.

`src/utils/trains.ts` transforme chaque capteur en départ :

- le départ prévu est l'état, un horodatage sans ambiguïté de fuseau ;
- le retard est celui **au départ**, `departure_time − base_departure_time`, et non `delay_minutes` ;
- le départ réel vaut départ prévu + retard, et l'arrivée vaut départ réel + `duration_minutes`. Des attributs formatés, on ne tire donc que des écarts, justes même si la tablette n'a pas le fuseau de Home Assistant ;
- un départ dont l'heure réelle est passée est retiré ;
- la voie et la suppression sont lues dans les attributs `platform` et `cancelled` lorsqu'un capteur les fournit.

## Conséquences

- Une ligne de config par trajet. Changer le nombre de trains dans l'intégration ne demande rien côté dashboard.
- L'identifiant contient les noms de gares : la démo et le mock utilisent des gares fictives (Paris → Lyon), et les vraies restent dans le sous-module privé.
- Avec sncf_trains 1.3.3, un train supprimé disparaît de la liste au lieu d'être signalé, et la voie n'est jamais affichée. Les deux s'afficheront dès qu'une source publiera `cancelled` ou `platform` : une version future de l'intégration ou un capteur template. Le mock les publie pour montrer l'affichage.
- Si l'intégration change le format de ses heures, le retard tombe à 0 sans erreur. Les tests unitaires figent le format attendu.
- Un minuteur de 30 s par tuile retire les trains partis entre deux mises à jour de l'intégration. Il ne touche pas à la scène 3D.

## Alternatives considérées

- **Liste explicite des capteurs** : de 2 à 10 lignes par trajet, à reprendre chaque fois que le nombre de trains change dans l'intégration, pour le même typage.
- **Capteur « Tous les trains (ligne) »** : un seul capteur, mais son identifiant ne dit pas le trajet, et ses attributs sont des listes en texte, sans arrivée ni numéro.
- **Calendrier `calendar.sncf_trains`** : il mélange tous les trajets. Son état ne donne que le train le plus proche, et lire ses événements demande l'API calendrier, absente du mock.
- **`delay_minutes`** : c'est le retard à l'arrivée. Un train parti en retard qui rattrape son retard s'afficherait à l'heure sur le quai de départ.
- **Lire les heures formatées comme des heures locales** : juste seulement si la tablette et Home Assistant partagent le même fuseau.
- **Ignorer la voie et la suppression** : l'issue les demande. Les lire quand elles existent coûte deux lignes, et le guide dit clairement que sncf_trains ne les fournit pas.
