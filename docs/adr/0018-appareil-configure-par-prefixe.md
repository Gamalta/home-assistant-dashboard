# 0018 — Configurer un appareil par le préfixe de ses entités

- Statut : Proposé
- Date : 2026-10-24
- Issue : #16

## Contexte

Chaque élément de pièce nomme aujourd'hui ses entités une à une, dans des champs typés : `lightEntityId`, `climateEntityId`, `temperatureEntityId`… Cela convient à un élément qui lit deux ou trois entités.

L'imprimante 3D Bambu Lab P1S en lit vingt-trois : progression, état, étape, couches, temps, températures et cibles, vitesse, boutons, lumière, image, erreurs. L'intégration ha-bambulab les crée toutes sur le même schéma, `<domaine>.<préfixe>_<clé>`, où le préfixe vaut `p1s_<numéro de série>` et la clé suit le nom anglais de l'entité (`sensor.<préfixe>_print_progress`, `button.<préfixe>_stop`…).

Le typage n'apporte pas plus avec des champs séparés : sans types générés pour la maison, `@hakit/core` type un identifiant comme `` `sensor.${string}` ``, que le champ soit écrit à la main ou construit à partir d'un préfixe.

## Décision

L'élément `printer3d` ne prend qu'un champ, `prefix`. La fonction pure `printer3dEntityIds(prefix)` (`src/utils/entity/printer3d.ts`) en déduit tous les identifiants, avec leur domaine dans le type. Les composants de la modale reçoivent cet objet d'identifiants. Le mock construit l'imprimante fictive avec la même fonction, si bien que la démo et le code ne peuvent pas diverger.

```ts
{type: 'printer3d', prefix: 'p1s_demo', position: {x: 6.2, y: 1.1, z: -2.6}}
```

## Conséquences

- La config tient en une ligne, sans faute de frappe possible sur l'une des vingt-trois entités.
- Si ha-bambulab renomme une clé, une seule fonction est à corriger, pour toutes les maisons et pour le mock.
- Une entité renommée dans Home Assistant n'est plus trouvée : la partie de la modale qui en dépend disparaît ou affiche `--`, sans erreur. Le guide demande de garder les identifiants d'origine.
- Ce motif peut servir à d'autres appareils créés par une intégration sur un schéma fixe. Les éléments existants gardent leurs champs explicites.

## Alternatives considérées

- **Un champ typé par entité** : vingt-trois lignes à écrire et à relire par imprimante, et autant d'occasions de se tromper, pour le même typage.
- **Préfixe et surcharges facultatives par entité** : couvrirait les entités renommées, mais aucun besoin réel ne le demande aujourd'hui. Il pourra s'ajouter sans casser les configs.
- **Retrouver les entités par l'appareil (registre des entités de Home Assistant)** : plus robuste aux renommages, mais demande un abonnement au registre, absent du mock, et rend la config moins lisible (identifiant d'appareil opaque).
