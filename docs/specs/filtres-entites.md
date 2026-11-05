# Filtrer les étiquettes de la vue 3D

- Issue : #59
- Statut : Brouillon

## Problème

Chaque pièce et chaque élément de la vue 3D affichent une étiquette : lumières, climatisations, thermomètres, volets, prises, appareils sur pile… Sur la démo, cela fait 39 boutons sur 32 étiquettes, qui se chevauchent par endroits. Sur la tablette murale, on cherche souvent une seule chose (« quels volets sont ouverts ? », « quelle pile faiblit ? ») et le reste gêne. Les appareils passifs, comme les interrupteurs sans fil, encombrent la vue alors qu'on ne les consulte que pour leur pile.

## Objectif

Choisir dans la modale Configuration quels éléments la vue 3D affiche, avec les appareils passifs masqués par défaut, voir d'un geste la pile de tous les éléments, et retrouver ces choix au prochain démarrage de la tablette.

## Hors périmètre

- Filtrer pièce par pièce ou entité par entité : le filtre porte sur des catégories.
- Éteindre ou masquer les lumières 3D : seules les étiquettes disparaissent.
- Les tuiles de la version mobile, qui listent toujours tous les éléments d'une pièce.
- La pile de l'aspirateur, donnée par un attribut et non par un `sensor`.
- Synchroniser les choix entre appareils : ils sont mémorisés par appareil, comme les options graphiques.

## Comportement attendu

### Scénario : masque puis réaffiche les étiquettes d'une catégorie

- **Étant donné** la modale Configuration ouverte depuis le dock
- **Quand** l'utilisateur coupe « Volets », puis « Climat »
- **Alors** les étiquettes des volets, puis celles des climatisations et des thermomètres disparaissent, les autres restent
- **Et** réactiver chaque interrupteur les réaffiche

### Scénario : masque par défaut les appareils sur pile

- **Étant donné** un appareil qui n'a jamais enregistré de choix
- **Quand** la vue 3D s'affiche
- **Alors** les interrupteurs sans fil n'ont pas d'étiquette, et « Appareils sur pile » est coupé dans la modale
- **Et** l'activer affiche leurs étiquettes

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

### Scénario : n'affiche que les piles de tous les éléments

- **Étant donné** la modale Configuration ouverte
- **Quand** l'utilisateur active « Batteries uniquement »
- **Alors** seuls les éléments qui donnent un niveau de pile gardent une étiquette, qui montre ce niveau : les trois interrupteurs (54 %, 12 %, 85 %), même masqués, et le détecteur de fumée (90 %)
- **Et** les interrupteurs des catégories sont grisés, puis couper l'option rend les étiquettes habituelles

### Scénario : ouvre la modale Configuration depuis le Foyer

- **Étant donné** la version mobile, le Foyer ouvert
- **Quand** l'utilisateur touche « Configuration »
- **Alors** la modale Configuration s'ouvre par-dessus le menu, sans le réglage de la veille

## Critères d'acceptation

- [x] Une ligne par catégorie présente dans la maison, avec son icône et son nom : la démo, sans ordinateur, en affiche neuf.
- [x] Un type d'élément qui n'a pas de catégorie reste toujours affiché.
- [x] En mode « Batteries uniquement », un appui sur une étiquette ouvre la modale habituelle de l'élément.
- [x] Masquer ou afficher une catégorie ne compile aucun shader et ne lance pas de rendu continu.
- [x] Une étiquette masquée est démontée : elle ne coûte plus rien à chaque image.
- [x] La modale Système ne garde que le serveur, internet, les mises à jour, les sauvegardes et la tablette.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)).

## Impacts

- Configuration des maisons : aucune. Un nouveau type d'élément s'ajoute à la table `src/utils/labelCategories.ts` ([ADR 0053](../adr/0053-reglages-dans-la-modale-configuration.md)).
- Options stockées : `graphics-options` gagne `shownCategories` (vide par défaut) et `batteriesOnly` (coupé). L'ancien `hiddenCategories` est ignoré.
- Interface : le dock gagne « Configuration », et son bouton de choix de la maison devient « Maison ». Le Foyer gagne « Configuration ».
- Performance : voir l'[ADR 0033](../adr/0033-filtre-des-etiquettes-par-categorie.md) ; la rangée de puces ne coûte plus rien sur la vue 3D.
