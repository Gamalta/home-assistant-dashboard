# Filtrer les étiquettes de la vue 3D

- Issue : #59
- Statut : Brouillon

## Problème

Chaque pièce et chaque élément de la vue 3D affichent une étiquette : lumières, climatisations, thermomètres, volets, ordinateurs. Sur la démo, cela fait déjà 31 boutons sur 24 étiquettes, qui se chevauchent par endroits (le volet de la cuisine cache sa température). Sur la tablette murale, on cherche souvent une seule chose (« quels volets sont ouverts ? », « quelle température dans les chambres ? ») et le reste gêne.

## Objectif

Choisir d'un appui quelles catégories d'étiquettes la vue 3D affiche, et retrouver ce choix au prochain démarrage de la tablette.

## Hors périmètre

- Filtrer pièce par pièce ou entité par entité : le filtre porte sur des catégories.
- Éteindre ou masquer les lumières 3D : seules les étiquettes disparaissent.
- La carte des températures, qui n'affiche déjà que les climatisations et les thermomètres : les autres puces y restent sans effet.
- Synchroniser le filtre entre appareils : il est mémorisé par appareil, comme les options graphiques.

## Comportement attendu

### Scénario : masque puis réaffiche les étiquettes d'une catégorie

- **Étant donné** la vue 3D avec toutes ses étiquettes
- **Quand** l'utilisateur touche la puce « Volets », puis la puce « Climat »
- **Alors** les étiquettes des volets, puis celles des climatisations et des thermomètres disparaissent, les autres restent
- **Et** un nouvel appui sur chaque puce les réaffiche

### Scénario : retire l'étiquette d'une pièce dont tous les éléments sont masqués

- **Étant donné** une pièce dont l'étiquette ne contient qu'une lumière
- **Quand** l'utilisateur masque les lumières
- **Alors** l'étiquette de la pièce disparaît entièrement, et une pièce qui affiche aussi sa température garde cette température

### Scénario : garde les lumières 3D allumées quand leurs étiquettes sont masquées

- **Étant donné** des lumières allumées dans la maison
- **Quand** l'utilisateur masque les lumières
- **Alors** l'éclairage de la scène 3D ne change pas

### Scénario : mémorise le filtre après rechargement

- **Étant donné** les volets masqués
- **Quand** la page est rechargée
- **Alors** les volets sont toujours masqués et les autres catégories affichées

### Scénario : reste utilisable au doigt à 1280 × 800 sans cacher la maison

- **Étant donné** la tablette (1280 × 800)
- **Quand** la vue 3D s'affiche
- **Alors** les puces forment une rangée en haut de la vue 3D, au-dessus de la maison et plus courte que la moitié de la vue, chacune d'au moins 40 × 40 px, et aucune étiquette ne passe dessous

## Critères d'acceptation

- [x] Une puce par catégorie présente dans la maison : la démo, sans ordinateur, en affiche sept.
- [x] Chaque puce porte le nom de sa catégorie, affiché au toucher dans une infobulle.
- [x] Un type d'élément qui n'a pas de catégorie reste toujours affiché.
- [x] Masquer ou afficher une catégorie ne compile aucun shader et ne lance pas de rendu continu.
- [x] Une étiquette masquée est démontée : elle ne coûte plus rien à chaque image.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)).

## Impacts

- Configuration des maisons : aucune. Un nouveau type d'élément s'ajoute à la table `src/utils/labelCategories.ts` ([ADR 0033](../adr/0033-filtre-des-etiquettes-par-categorie.md)).
- Options stockées : `graphics-options` gagne `hiddenCategories`, qui masque les piles par défaut. Les options déjà enregistrées restent valables.
- Performance : voir l'ADR 0033.
