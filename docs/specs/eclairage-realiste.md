# Éclairage : doux et chaud le jour, contrasté la nuit, sans reflets

- Issue : #56
- Statut : Livrée

## Problème

Les reflets d'environnement sont trop lourds : même sur Mac, le propriétaire ne parvient pas à les afficher. Sans eux, la maison est éclairée par une lumière ambiante uniforme : sols et murs ont la même teinte grise, et les zones éclairées par les lampes saturent.

## Objectif

Un beau rendu plutôt qu'un rendu réaliste, léger pour la tablette : doux et chaud le jour, sombre et contrasté la nuit, où les lampes dominent.

## Hors périmètre

- Les ombres du soleil : seules les lampes projettent des ombres, avec l'option « Ombres ».
- La direction réelle du soleil : le soleil reste haut et fixe, pour adoucir les volumes sans écraser une façade.

## Comportement attendu

### Scénario : en journée

- **Étant donné** l'entité `sun.sun` au-dessus de l'horizon
- **Quand** la maison s'affiche
- **Alors** un ciel crème et un soleil doux venu d'en haut l'éclairent : murs crème, sols chauds, volumes lisibles

### Scénario : la nuit

- **Étant donné** le soleil sous l'horizon
- **Quand** la maison s'affiche
- **Alors** seule une faible lueur neutre reste, et les lampes allumées dominent ; la maison reste lisible

### Scénario : la nuit tombe

- **Étant donné** la maison affichée en journée
- **Quand** le soleil se couche
- **Alors** l'éclairage passe progressivement du jour à la nuit, sans recompiler de shader

### Scénario : sans l'entité `sun.sun`

- **Étant donné** une instance sans l'intégration Sun, ou le mock
- **Quand** la maison s'affiche
- **Alors** la hauteur du soleil est déduite de l'heure : levé à 6 h, au plus haut à midi, couché à 18 h

### Scénario : essayer le jour et la nuit

- **Étant donné** le panneau « Éclairage selon l'heure », ouvert depuis la modale Système et posé sur la vue 3D
- **Quand** on fait glisser l'heure, de 0 h à 24 h par quart d'heure
- **Alors** l'éclairage et le thème du dashboard suivent cette heure ; fermer le panneau, ou recharger la page, revient à l'heure réelle

### Scénario : plus de reflets d'environnement

- **Étant donné** la modale Système
- **Quand** on l'ouvre
- **Alors** l'option « Reflets d'environnement » n'existe plus, et aucune carte HDR n'est téléchargée

## Critères d'acceptation

- [x] La nuit qui tombe ne recompile aucun shader (`e2e/lighting.spec.ts`).
- [x] La maison est plus sombre la nuit que le jour (`e2e/lighting.spec.ts`).
- [x] L'heure simulée change le thème, et fermer le panneau revient à l'heure réelle (`e2e/options.spec.ts`).
- [x] Hauteur du soleil d'après l'heure testée (`src/rendering/daylight.test.ts`).
- [x] L'option a disparu de la modale Système et aucun `.hdr` n'est demandé (`e2e/options.spec.ts`, `e2e/lighting.spec.ts`).
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : GPU égal au repos, mêmes programmes au démarrage.

## Impacts

- Options stockées : les valeurs `environmentReflections` et `lightingStyle` encore présentes dans le stockage local sont ignorées.
- Le fichier `dikhololo_night_1k.hdr` (1,7 Mo) quitte le dépôt et le build.
