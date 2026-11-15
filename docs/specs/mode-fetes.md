# Mode fêtes

- Issue : à créer
- Statut : Validée

## Problème

En décembre, rien sur la tablette murale ne rappelle les fêtes. Elle trône dans la pièce de vie : un peu d'ambiance de saison y a sa place, à condition de ne rien coûter à la scène 3D ni de gêner la lecture des étiquettes.

## Objectif

Pendant les fêtes, une neige légère tombe derrière la maison 3D et sur l'écran de veille, sans que la scène ne redessine la moindre image. Un sapin, posé dans la maison par la config, s'illumine de guirlandes qui changent de couleur.

## Hors périmètre

- Une neige dans la scène 3D, devant la maison : elle obligerait à rendre la scène en continu ([ADR 0056](../adr/0056-neige-en-web-animations-derriere-la-scene.md)).
- Des lumières du sapin qui scintillent en continu : la scène ne se redessine que toutes les 2 s ([ADR 0057](../adr/0057-sapin-redessine-par-pas.md)).
- Des guirlandes qui suivent la couleur réelle d'un ruban connecté (`light`), ou qui éclairent la pièce.
- Un compte à rebours ou un accent dans la barre latérale : autres fonctionnalités.
- Un réglage par maison : le choix est propre à l'appareil, comme la veille.

## Comportement attendu

### Scénario : neige derrière la maison

- **Étant donné** le mode fêtes en automatique, la valeur par défaut, entre le 1er décembre et le 6 janvier inclus
- **Quand** la vue 3D s'affiche
- **Alors** une neige légère tombe derrière la maison : la maison et ses étiquettes passent devant les flocons, qui n'interceptent aucun appui. La scène ne dessine aucune image à cause d'elle.

### Scénario : hors des fêtes

- **Étant donné** le mode fêtes en automatique
- **Quand** la date est entre le 7 janvier et le 30 novembre
- **Alors** il ne neige pas et le sapin n'est pas dans la maison. Le 1er décembre, ils arrivent sans recharger la page, dans l'heure.

### Scénario : sapin dans la maison

- **Étant donné** un sapin dans la config de la maison (`christmasTree`) et le mode fêtes actif
- **Quand** la vue 3D s'affiche
- **Alors** un sapin se dresse à sa position, avec sa guirlande et son étoile dorée. Toutes les 2 s, chaque lumière de la guirlande passe à la couleur suivante (rouge, or, bleu, rose), et la scène ne dessine qu'une image pour cela.

### Scénario : prise du sapin coupée

- **Étant donné** le sapin relié à la prise de ses guirlandes (`switchEntityId`)
- **Quand** la prise est coupée
- **Alors** les lumières et l'étoile s'éteignent, et la scène ne redessine plus rien. Elles se rallument avec la prise.

### Scénario : cartes au sol

- **Étant donné** le sapin affiché
- **Quand** la carte des températures ou le plan de l'aspirateur s'affiche
- **Alors** le sapin disparaît, pour ne pas cacher la carte

### Scénario : écran de veille

- **Étant donné** le mode fêtes actif
- **Quand** l'écran de veille s'affiche
- **Alors** la neige tombe sur son ciel, derrière l'heure et les cartes. La scène 3D, cachée, est en pause : ni le sapin ni la neige ne la font travailler.

### Scénario : réglage par appareil

- **Étant donné** la modale Configuration, sur tablette comme sur téléphone
- **Quand** l'utilisateur choisit « Mode fêtes » : « Du 1er déc. au 6 janv. », « Toujours » ou « Jamais »
- **Alors** le choix est gardé sur cet appareil. « Toujours » montre neige et sapin hors saison, « Jamais » les retire pendant les fêtes.

### Scénario : vue Pièces sur téléphone

- **Étant donné** la neige active sur téléphone
- **Quand** la vue Pièces masque la maison
- **Alors** les flocons s'arrêtent, et repartent au retour sur la vue Maison

### Scénario : réduire les animations

- **Étant donné** « réduire les animations » activé dans le système
- **Quand** le mode fêtes est actif
- **Alors** il ne neige pas

## Critères d'acceptation

- [x] Les dates des fêtes, bornes comprises (`utils/holidays.test.ts`).
- [x] Le mode s'active le 1er décembre sans recharger la page et suit le réglage forcé (`hooks/useHolidayMode.test.ts`).
- [x] Le réglage est mémorisé (`ConfigurationModal/HolidayRow.test.tsx`).
- [x] La guirlande est posée sur les branches et chaque lumière change de couleur à chaque pas (`rendering/christmasTree.test.ts`).
- [x] Les scénarios visibles sont couverts par `e2e/holidays.spec.ts`.
- [x] Aucun draw call, aucun layout ni recalcul de style de plus pendant la chute, build de production ([ADR 0056](../adr/0056-neige-en-web-animations-derriere-la-scene.md)).
- [x] Le sapin ajoute 2 draw calls par image et, guirlandes allumées, une image toutes les 2 s, build de production ([ADR 0057](../adr/0057-sapin-redessine-par-pas.md)).
- [ ] Le coût du compositeur et des images du sapin est vérifié sur la tablette (Adreno 610).

## Impacts

- Option `holidayMode` (`auto`, `on` ou `off`) dans les options de l'appareil (`AppContext`), `auto` par défaut, y compris sur un appareil qui a déjà des options enregistrées.
- Config de maison : `christmasTree` (position, hauteur, prise), facultatif. La démo place un sapin dans le séjour, et le mock ajoute `switch.christmas_tree`.
- Le composant `Snowfall` sert à la vue 3D et à l'écran de veille.
- L'état de veille passe de l'écran de veille au `Dashboard`, qui met la scène en pause dessous.
