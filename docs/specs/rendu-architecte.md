# Rendu d'architecte : éclairage précalculé et focale de 30°

- Issue : à créer
- Statut : Validée

## Problème

Le propriétaire trouve la maison terne, de jour comme de nuit, et loin des rendus d'architecte qu'on trouve en ligne. Ces rendus doivent leur douceur à une lumière calculée par rebonds (ombres douces, coins assombris, taches de soleil) et à une vue presque isométrique. Le dashboard éclaire la maison par une lumière hémisphérique et un soleil sans ombre, et la filme avec un champ de 75°, qui déforme la maison et oblige à effacer les murs du premier plan. Trois ambiances réglées à la main n'ont pas suffi : « Clair doux » était « la moins pire », sans approcher les références.

## Objectif

Une maison éclairée comme une maquette d'architecte, jour et nuit, vue de haut avec une focale longue, sans coûter plus cher à afficher sur la tablette.

## Hors périmètre

- La direction réelle du soleil : le soleil reste fixe, seule sa force suit l'heure, comme aujourd'hui.
- L'éclairage précalculé en WebGPU : ce moteur garde Clair doux.
- Le précalcul du modèle de l'appartement, qui se fait dans le sous-module privé avec le même script.
- Un rapprochement de la caméra au-delà d'une pièce : à cette distance, la résolution des cartes de lumière se voit.

## Comportement attendu

### Scénario : en journée

- **Étant donné** la maison démo et le soleil au-dessus de l'horizon
- **Quand** la maison s'affiche
- **Alors** elle est claire et douce, avec des taches de soleil au sol, des ombres douces sous les meubles et des coins plus sombres, sur un fond gris bleuté

### Scénario : la nuit

- **Étant donné** le soleil sous l'horizon
- **Quand** la maison s'affiche
- **Alors** elle baigne dans une lueur bleue sur un fond bleu nuit, et les lampes allumées dominent par leur lumière chaude

### Scénario : la nuit tombe

- **Étant donné** la maison affichée en journée
- **Quand** le soleil se couche
- **Alors** l'éclairage passe progressivement du jour à la nuit, sans recompiler de shader

### Scénario : maison sans éclairage précalculé

- **Étant donné** une maison dont la config ne donne pas de cartes de lumière, ou le moteur WebGPU
- **Quand** la maison s'affiche
- **Alors** elle est éclairée en temps réel avec l'ambiance Clair doux : ciel bleuté, soleil chaud, nuit bleue

### Scénario : vue de la maison

- **Étant donné** la tablette
- **Quand** la vue 3D s'ouvre
- **Alors** la maison entière est cadrée comme avant, mais vue avec une focale de 30° : les murs restent droits, et ceux du premier plan ne s'effacent plus qu'en zoomant

### Scénario : vol vers une pièce sur mobile

- **Étant donné** la vue 3D du téléphone
- **Quand** on choisit une pièce dans le carrousel
- **Alors** la caméra la cadre comme avant, de plus loin, avec la même focale de 30°

## Critères d'acceptation

- [x] La démo charge ses deux cartes de lumière et s'affiche sans erreur (`e2e/lighting.spec.ts`).
- [x] La nuit qui tombe ne recompile aucun shader, et la maison est plus sombre la nuit (`e2e/lighting.spec.ts`).
- [x] Le shader ajoute la lumière du soleil à celle de la lightMap (`src/rendering/shaders/BakedLight/WebGL/index.test.ts`).
- [x] Chaque primitive de la démo a un second jeu d'UV, et le modèle et ses cartes tiennent dans 2 Mo (`src/configs/models.test.ts`).
- [x] La focale de 30° garde le cadrage d'un champ de 75° (`src/utils/camera.test.ts`), les murs s'effacent toujours une fois zoomé (`e2e/options.spec.ts`), et la pièce choisie reste cadrée sur mobile (`e2e/mobile.spec.ts`).
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : GPU de 7,5 à 5,0 ms par image au repos sur M4, mêmes draw calls, aucun programme compilé pendant une rotation. La tablette reste à mesurer.

## Impacts

- Configuration des maisons : `lightMaps` (facultatif) donne les cartes écrites par `pnpm bake-lighting` à côté du modèle.
- Modèle démo : réécrit avec un second jeu d'UV, plus deux cartes WebP.
- Blender 5 devient nécessaire pour précalculer l'éclairage d'un modèle, pas pour développer.
- Remplace les scénarios « en journée » et « la nuit » de la spec [éclairage réaliste](eclairage-realiste.md).
