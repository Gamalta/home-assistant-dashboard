# Alertes de la maison

- Issue : #23
- Statut : Brouillon

## Problème

Rien ne signale sur la tablette murale ce qui demande une intervention : un détecteur de fumée qui se déclenche, une pile à changer, internet ou le pont Zigbee coupé, la tablette débranchée, un appareil qui ne répond plus. Il faut ouvrir Home Assistant pour s'en rendre compte, souvent trop tard.

## Objectif

Une pastille dans l'en-tête de la barre latérale, invisible quand tout va bien, qui compte les alertes et ouvre leur liste d'un appui.

## Hors périmètre

- Son, vibration, notification push ou réveil de l'écran : c'est le rôle des automatisations Home Assistant.
- Acquitter ou masquer une alerte : elle disparaît quand l'entité revient à la normale.
- La découverte automatique des appareils à pile : les entités surveillées sont listées dans la config ([ADR 0025](../adr/0025-alertes-par-regles-pures.md)).

## Comportement attendu

Les sources se configurent dans le bloc `alerts` de la maison ([guide](../guides/alertes.md)). Chaque alerte a un libellé et une gravité :

| Source                                      | Condition                   | Gravité   | Libellé                          |
| ------------------------------------------- | --------------------------- | --------- | -------------------------------- |
| Détecteur de fumée                          | `on`                        | critique  | Fumée détectée : _nom_           |
| Détecteur de chaleur (`device_class: heat`) | `on`                        | critique  | Chaleur détectée : _nom_         |
| Pile faible (`binary_sensor`)               | `on`                        | attention | Pile faible : _nom_              |
| Niveau de pile (`sensor`, en %)             | sous le seuil (20 % défaut) | attention | Pile faible : _nom_ (12 %)       |
| Connexion WAN                               | `off`                       | attention | Internet coupé                   |
| Pont Zigbee                                 | `off`                       | attention | Pont Zigbee déconnecté           |
| Charge de la tablette                       | `discharging`               | attention | La tablette murale ne charge pas |
| Toute entité configurée                     | absente ou `unavailable`    | attention | Indisponible : _nom_             |

_nom_ est le `friendly_name` de l'entité. Les alertes critiques passent en tête. À gravité égale, l'ordre de la config est gardé.

### Scénario : affiche le nombre d'alertes dans la pastille

- **Étant donné** la démo, avec la pile du bouton de la cuisine à 12 % et le capteur de la cave indisponible
- **Quand** j'ouvre le dashboard
- **Alors** une pastille orange « 2 » apparaît dans l'en-tête, entre l'heure et la météo, sans décaler la date ni la météo.

### Scénario : liste les alertes avec leur libellé

- **Étant donné** ces 2 alertes
- **Quand** j'appuie sur la pastille
- **Alors** la modale « Alertes » liste « Pile faible : Bouton de la cuisine (12 %) » puis « Indisponible : Capteur de la cave », en style attention.

### Scénario : place l'alerte fumée en tête, en style critique

- **Étant donné** que le détecteur de fumée du couloir passe à `on`
- **Quand** j'appuie sur la pastille, qui affiche maintenant « 3 » en rouge avec une flamme qui pulse
- **Alors** « Fumée détectée : Détecteur du couloir » est la première alerte de la liste, sur fond rouge plein.

### Scénario : masque la pastille quand tout va bien

- **Étant donné** la pastille « 2 »
- **Quand** la pile du bouton remonte à 80 % et que le capteur de la cave répond de nouveau
- **Alors** la pastille disparaît.

### Règles testées en unitaire

Les règles du tableau sont couvertes par `src/utils/alerts.test.ts` : fumée et chaleur en critique, pile faible binaire, seuil de pile par défaut et réglé, niveau inconnu ignoré, internet, Zigbee et tablette, entité indisponible ou absente, tri des critiques en premier.

## Critères d'acceptation

- [x] Sans bloc `alerts`, rien ne change.
- [x] La démo produit 2 alertes : une pile faible et une entité indisponible.
- [x] Une alerte critique se distingue d'une alerte d'attention, dans la pastille comme dans la liste.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : la pastille est en HTML, hors de la scène 3D.

## Impacts

- Configuration des maisons : nouveau bloc facultatif `alerts` dans `SideBarConfig`.
- Mock Home Assistant : détecteur de fumée et de chaleur, piles (binaire et en %), pont Zigbee, capteur indisponible. `window.__mockSetState` change l'état d'une entité pour les E2E.
- Performance : la pastille recalcule les alertes à chaque changement d'état dans Home Assistant, en ne parcourant que les entités configurées. L'animation de la pastille critique ne porte que sur un `transform`.
