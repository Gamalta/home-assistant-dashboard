# 0007 — Une configuration par maison, la maison privée en sous-module

- Statut : Accepté
- Date : 2026-10-24 (décision antérieure, consignée a posteriori)

## Contexte

Le même code sert à une démo publique et à l'appartement réel. Le modèle 3D et les identifiants d'entités de l'appartement ne doivent pas être publics.

## Décision

Chaque maison est un dossier `src/configs/<id>/`, qui contient un `House.ts` (exports `ConfigName`, `HouseConfig`, `SideBarConfig`, typés par `house.d.ts` et `sidebar.d.ts`) et son modèle `.glb`. La liste des maisons disponibles vient de `VITE_HOUSE_CONFIGS`. `loadConfig` les importe dynamiquement. `apartment` est un sous-module git privé ; `demo` vit dans le dépôt public.

## Conséquences

- Un build n'embarque que les maisons listées.
- La CI publique et les tests n'ont accès qu'à `demo`.
- Une modification du modèle de l'appartement se committe dans le sous-module, puis on met à jour le pointeur dans ce dépôt.

## Alternatives considérées

- **Configuration chargée à l'exécution (JSON distant)** : perd le typage des identifiants d'entités.
- **Tout dans le dépôt public** : expose le plan et les entités du logement.
