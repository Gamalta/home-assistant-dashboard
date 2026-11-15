# 0056 — Une neige en Web Animations, derrière le canvas transparent

- Statut : Proposé
- Date : 2026-11-15
- Issue : à créer

## Contexte

Le mode fêtes ([spec](../specs/mode-fetes.md)) fait tomber une neige légère autour de la maison 3D. La scène est rendue à la demande ([ADR 0002](0002-rendu-3d-a-la-demande.md)) sur une tablette limitée par son GPU ([ADR 0009](0009-budget-performance-tablette.md)) : une animation qui la ferait redessiner à chaque image est exclue.

Le canvas WebGL est transparent : le fond de la vue est un dégradé CSS posé sur son parent.

## Décision

**Des flocons dans le DOM, entre le fond et le canvas.** Quarante points de 2 à 4 px, placés avant le canvas dans le même empilement : la maison et ses étiquettes passent devant eux, sans profondeur à calculer. Ils n'interceptent aucun appui (`pointer-events: none`).

**Animés par l'API Web Animations.** Chaque flocon ne déplace qu'une transformation (`element.animate`, en boucle), que Chrome confie au compositeur. Une animation CSS (`@keyframes`, comme le fil du courant de l'[ADR 0045](0045-animation-du-courant-en-css.md)) donnerait le même rendu, mais Chrome recalcule les styles sur le thread principal à chaque fin de cycle, pour l'événement `animationiteration`, soit environ 0,4 fois par seconde et par flocon. Web Animations n'a pas d'événement de cycle.

**Une répartition fixe**, au nombre d'or, plutôt qu'aléatoire : le rendu reste pur. **Aucune animation** quand la vue est masquée (vue Pièces du téléphone) ni avec « réduire les animations ».

## Conséquences

Mesures du 15/11/2026 : build de production, Chrome sur Mac M-series avec son GPU, 1280×800 à DPR 2, démo au repos pendant 5 s, plusieurs lancements :

| Pendant 5 s                        | Sans neige | Neige en CSS | Neige en Web Animations |
| ---------------------------------- | ---------: | -----------: | ----------------------: |
| Draw calls WebGL                   |          0 |            0 |                       0 |
| Layouts                            |      0 à 1 |            0 |                       0 |
| Recalculs de style                 |      7 à 8 |      77 à 79 |                       7 |
| Temps des tâches (ms)              |    18 à 23 |    108 à 123 |                 24 à 27 |
| GPU de `__dashboardBenchmark` (ms) |  4,1 à 4,7 |    3,7 à 4,7 |               4,2 à 4,8 |

- La scène ne dessine aucune image de plus, et son temps de rendu ne change pas.
- Tant que la neige tombe, le compositeur recompose la vue à chaque image au lieu de rester inactif : un coût GPU faible mais continu, de décembre au 6 janvier. Il reste à vérifier sur l'Adreno 610.
- Au retour sur la vue Maison, les flocons repartent de leur position de départ : la répartition est la même, le saut ne se voit pas.
- Un effet et une référence au DOM, que l'ADR 0045 avait évités pour le fil du courant. Le gain sur le thread principal les justifie ici.

## Alternatives considérées

- **Des particules dans la scène 3D** : la neige tomberait aussi devant la maison, mais la scène serait rendue en continu, de 40 à 300 ms par image sur la tablette.
- **Une animation CSS** : le même rendu, avec dix fois plus de recalculs de style (mesure ci-dessus).
- **Quelques grands calques de neige en motif répété** : une seule animation par calque, mais des calques de la taille de la vue, transparents presque partout, que le GPU mélange à chaque image et garde en mémoire.
- **La neige au-dessus du canvas** : elle passerait sur les étiquettes et gênerait leur lecture.
