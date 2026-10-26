# Liste de courses partagée

- Issue : #21
- Statut : Livrée

## Problème

La liste de courses de Home Assistant (`todo.shopping_list`) n'est accessible que depuis le téléphone. Dans la cuisine, devant la tablette murale, on ne peut pas y ajouter ce qui manque.

## Objectif

Consulter et modifier la liste de courses depuis l'entrée « Courses » du menu rapide, avec une synchronisation immédiate avec les téléphones. Le propriétaire ne veut pas de carte dans le carrousel.

## Hors périmètre

- Échéances, descriptions et réordonnancement des articles.
- Plusieurs listes : le menu n'en ouvre qu'une.
- Le nombre d'articles à acheter hors de la modale.

## Comportement attendu

### Scénario : ouvrir la liste depuis le menu

- **Étant donné** une liste de courses configurée
- **Quand** l'utilisateur ouvre le menu rapide et touche « Courses »
- **Alors** le menu se referme et la modale « Courses » grandit depuis le bouton rond du menu, où elle se résorbe à la fermeture

### Scénario : voir la liste d'un coup d'œil

- **Étant donné** des articles à acheter et des articles cochés
- **Quand** la modale est ouverte
- **Alors** les articles sont des tuiles de 3 par ligne, avec un emoji selon leur nom (le panier pour un article inconnu)
- **Et** les articles à acheter sont sous « À acheter », les cochés sous « Dans le panier », estompés, barrés et marqués d'une coche
- **Et** un nom trop long est tronqué, sans élargir sa tuile
- **Et** la modale garde la même hauteur quel que soit le nombre d'articles : la liste défile, le champ et le bouton de retrait restent en place

### Scénario : ajouter un article au clavier

- **Étant donné** la modale ouverte
- **Quand** l'utilisateur saisit un article et valide (Entrée ou +, actif seulement quand le champ n'est pas vide)
- **Alors** l'article apparaît dans la liste, non coché, et le champ se vide

### Scénario : cocher un article

- **Étant donné** un article à acheter
- **Quand** l'utilisateur le touche
- **Alors** il est coché et barré, et sa tuile glisse sous « Dans le panier » ; le toucher de nouveau le décoche

### Scénario : retirer les articles cochés

- **Étant donné** des articles cochés
- **Quand** l'utilisateur touche « Retirer les articles cochés »
- **Alors** ils disparaissent de la liste, et le bouton aussi

### Scénario : synchronisation

- **Étant donné** la modale ouverte
- **Quand** la liste change ailleurs (téléphone, assistant vocal)
- **Alors** la modale se met à jour sans recharger la page

## Critères d'acceptation

- [x] Les articles à acheter apparaissent avant les articles cochés.
- [x] Saisir un article ne rouvre pas le menu rapide.
- [x] Chaque scénario est couvert : `e2e/shopping-list.spec.ts`, `hooks/useTodoList.test.ts` pour l'abonnement et les services, et `utils/groceryEmoji.test.ts` pour les emojis.

## Impacts

- Config : `shoppingListEntityId` dans `SideBarConfigType`. L'entrée « Courses » s'ajoute après les scénarios.
- Mock : la liste est simulée, avec l'abonnement `todo/item/subscribe` et les services `todo.*`.
