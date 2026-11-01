# 0025 — Alertes de la maison par règles pures, piles sans `useLowDevices`

- Statut : Proposé
- Date : 2026-10-24
- Issue : #23

## Contexte

La barre latérale doit signaler ce qui demande une intervention : fumée ou chaleur, piles faibles, internet coupé, pont Zigbee déconnecté, tablette murale débranchée, entité indisponible. Les alertes se déduisent de l'état d'entités Home Assistant que la maison configure.

Pour les piles, @hakit/core 6 fournit `useLowDevices({min, max, whitelist, blacklist})`. Son code (`hooks/useLowDevices`) :

- lit toutes les entités de Home Assistant et garde celles qui ont `unit_of_measurement: '%'` et `device_class: 'battery'` ;
- retient un état compris entre `min` (0) et `max` (20), bornes incluses ;
- filtre par sous-chaîne de l'`entity_id` (`includes`). Une `whitelist` vide laisse passer toutes les entités.

Les piles de l'appartement sont de deux sortes : des capteurs en % (interrupteurs, détecteur de fumée), et des `binary_sensor` `*_battery_low` (thermostats). Les téléphones et la tablette exposent aussi un capteur de batterie en %, avec `device_class: 'battery'`.

## Décision

**Une fonction pure, `getHouseAlerts(entities, config)`**, dans `src/utils/alerts.ts`. Elle transforme les entités en alertes `{entityId, severity, label}`, triées avec les critiques en premier. Le tri est stable : à gravité égale, l'ordre de la config est gardé. Chaque source a sa règle :

- fumée et chaleur à `on` : critique ;
- `binary_sensor` de pile faible à `on`, capteur de pile sous le seuil (20 % par défaut) : attention ;
- WAN et pont Zigbee à `off`, tablette à `discharging` : attention ;
- une entité configurée absente ou `unavailable` : attention, quelle que soit sa règle.

**Les piles en % sont comparées par le dashboard, sans `useLowDevices`.** Le code maison tient en une comparaison, `Number(state) < seuil`, sur la liste configurée. `useLowDevices` ne couvre pas proprement ce besoin :

- c'est un hook : le seuil vivrait hors de la fonction pure, sans test unitaire possible sans store, et les `binary_sensor` de pile suivraient un autre chemin ;
- sans `whitelist`, il remonte toutes les batteries de la maison, téléphones et tablette compris : un téléphone à 15 % deviendrait une « pile faible ». Une liste vide dans la config activerait donc tout ;
- avec une `whitelist`, la correspondance se fait par sous-chaîne : `sensor.kitchen_button` retient aussi `sensor.kitchen_button_2_battery` ;
- il ignore sans le dire un capteur listé qui n'a pas `device_class: 'battery'` ;
- il ne gère pas les `binary_sensor` `*_battery_low`.

**Lecture des entités** : la pastille lit `useHass(state => state.entities)` et recalcule les alertes à chaque changement d'état dans Home Assistant. Le calcul ne parcourt que les entités configurées, une trentaine dans l'appartement.

**Affichage** : la pastille est un `Chip` MUI, et la liste des `Alert` MUI. Une alerte critique s'affiche en `Alert` pleine et rouge. Sa pastille est rouge, avec une icône de flamme qui pulse : l'animation ne porte que sur un `transform`.

**E2E** : le mock expose `window.__mockSetState(entityId, state)` pour simuler un événement, comme un détecteur qui se déclenche. `useHass` n'est pas accessible depuis `page.evaluate`.

## Conséquences

- Les règles se testent entièrement en unitaire (`alerts.test.ts`). La pastille et la liste ne font qu'afficher.
- Un nouvel appareil à pile n'est surveillé qu'une fois ajouté à la config : il n'y a pas de découverte automatique. Une entité renommée dans Home Assistant apparaît comme « Indisponible », ce qui signale la config à corriger.
- La pastille se redessine à chaque changement d'état de Home Assistant. C'est du HTML, hors de la scène 3D : pas de rendu WebGL ni d'`invalidate()`.
- `__mockSetState` est présent dans tout build qui utilise le mock, démo publique comprise. Il ne modifie que le faux Home Assistant.

## Alternatives considérées

- **`useLowDevices` sur la liste configurée** : écarté pour les raisons ci-dessus. Le gain se limite à une ligne de comparaison.
- **`useLowDevices` en découverte automatique, avec une `blacklist` pour les téléphones** : moins de config, mais de fausses alertes à chaque nouvel appareil sur batterie, et les entités indisponibles ne sont pas couvertes.
- **Un `useEntity` par entité (`useEntities`)** : les entités arrivent une par une, enrichies. Il faudrait les remettre en table pour la fonction pure, sans rien gagner sur le nombre de rendus.
- **Un sélecteur qui calcule les alertes, avec une comparaison superficielle** : il éviterait des rendus, mais `zustand/shallow` n'est qu'une dépendance transitive de @hakit. Le gain reste négligeable sur un composant de cette taille.
- **Exposer `useHass` sur `window` pour les E2E** : cela ouvrirait tout le store, alors qu'une fonction dédiée suffit.
