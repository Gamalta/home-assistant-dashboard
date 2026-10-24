# Éclairage réaliste : ciel et soleil, sans reflets

- Issue : #56
- Statut : Livrée

## Problème

Les reflets d'environnement sont trop lourds : même sur Mac, le propriétaire ne parvient pas à les afficher. Sans eux, la maison est éclairée par une lumière ambiante uniforme : de jour, sols et murs ont la même teinte grise, les volumes se lisent mal et les zones éclairées par les lampes saturent.

## Objectif

Une maison éclairée comme une vraie : un ciel et un soleil qui suit l'heure, des lampes qui dominent la nuit, pour un coût GPU égal à celui d'avant sur la tablette.

## Hors périmètre

- Les ombres du soleil : seules les lampes projettent des ombres, avec l'option « Ombres ».
- La météo : un ciel couvert n'atténue pas le soleil.

## Comportement attendu

### Scénario : en journée

- **Étant donné** l'entité `sun.sun` au-dessus de l'horizon
- **Quand** la maison s'affiche
- **Alors** le ciel l'éclaire par le haut, le soleil arrive de sa direction réelle et chaque mur prend une teinte selon son orientation ; au lever et au coucher, la lumière du soleil est orangée

### Scénario : la nuit

- **Étant donné** le soleil sous l'horizon
- **Quand** la maison s'affiche
- **Alors** seule une faible lueur neutre reste, et les lampes allumées dominent ; la maison reste lisible

### Scénario : la nuit tombe

- **Étant donné** la maison affichée en journée
- **Quand** le soleil se couche
- **Alors** l'éclairage baisse progressivement, sans recompiler de shader

### Scénario : sans l'entité `sun.sun`

- **Étant donné** une instance sans l'intégration Sun, ou le mock
- **Quand** la maison s'affiche
- **Alors** la position du soleil est déduite de l'heure : à l'est à 6 h, au sud à midi, à l'ouest à 18 h

### Scénario : orientation de la maison

- **Étant donné** une maison dont la config donne `orientation`, l'azimut vers lequel pointe l'axe -Z du modèle
- **Quand** le soleil est à un azimut donné
- **Alors** il éclaire les façades réellement exposées

### Scénario : plus de reflets d'environnement

- **Étant donné** la modale Système
- **Quand** on l'ouvre
- **Alors** l'option « Reflets d'environnement » n'existe plus, et aucune carte HDR n'est téléchargée

## Critères d'acceptation

- [x] Le soleil et le ciel sont deux lumières fixes : la nuit qui tombe ne recompile aucun shader (`e2e/eclairage.spec.ts`).
- [x] La maison est plus sombre la nuit que le jour (`e2e/eclairage.spec.ts`).
- [x] Position et intensité du soleil testées (`src/rendering/daylight.test.ts`).
- [x] L'option a disparu de la modale Système et aucun `.hdr` n'est demandé (`e2e/options.spec.ts`, `e2e/eclairage.spec.ts`).
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : GPU égal au repos, mêmes programmes au démarrage.

## Impacts

- Config des maisons : `orientation` est optionnelle, 0 par défaut (-Z vers le nord).
- Options stockées : une valeur `environmentReflections` encore présente dans le stockage local est ignorée.
- Le fichier `dikhololo_night_1k.hdr` (1,7 Mo) quitte le dépôt et le build.
