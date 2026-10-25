# Compilation des shaders sans gel de l'écran

- Issue : #12
- Statut : Livrée

## Problème

Au chargement et à chaque changement d'option graphique, la première image compile les shaders de façon synchrone. Pendant ce temps, l'écran est figé : le chargeur ne tourne plus, et la barre latérale et les modales ne répondent plus. Au premier lancement, quand les caches de programmes sont vides, le gel dure de 2,7 à 11 s sur un Mac. Sur la tablette, il est bien plus long.

## Objectif

La compilation se fait en arrière-plan. L'interface reste réactive, et la scène ne s'affiche qu'une fois compilée.

## Hors périmètre

- La génération de la carte d'environnement (PMREM) avec les reflets, qui reste synchrone.
- La compilation des cartes d'ombre, faite par three au premier rendu des ombres.
- Le moteur logiciel de la CI (SwiftShader), qui ne sait pas compiler en parallèle : la compilation y reste bloquante.

## Comportement attendu

### Scénario : affiche le chargeur jusqu'à ce que la scène soit prête

- **Étant donné** le dashboard qui charge la maison
- **Quand** les fichiers sont téléchargés et les shaders en cours de compilation
- **Alors** le chargeur tourne (sans pourcentage) à la place de la vue 3D, puis disparaît quand la scène s'affiche

### Scénario : redessine la scène après un changement d'option

- **Étant donné** la scène affichée
- **Quand** l'utilisateur change une option graphique dans la modale Système
- **Alors** la dernière image reste affichée, sans chargeur, pendant la compilation, puis la scène est redessinée avec la nouvelle option

## Critères d'acceptation

- [x] Chargeur visible jusqu'à la fin de la compilation au démarrage (E2E).
- [x] Scène redessinée après un changement d'option (E2E).
- [x] Plus aucune tâche longue de compilation sur le build de production (Chrome avec GPU) : mesures dans l'[ADR 0015](../adr/0015-compilation-asynchrone.md).
- [x] Rendu identique au pixel près à celui d'avant, sauf correction des ombres (ADR 0015).
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : mêmes draw calls, aucun programme compilé pendant une rotation.

## Impacts

- `window.__dashboardBenchmark` n'existe qu'une fois la scène compilée. Il disparaît pendant la compilation qui suit un changement d'option.
- Pendant cette compilation, la scène ne se redessine pas : une rotation de la caméra n'apparaît qu'à la fin.
- Avec les ombres, changer une autre option ne les éteint plus.
