# Liste de courses partagée

- Issue : #21
- Statut : Livrée

## Problème

La liste de courses de Home Assistant (`todo.shopping_list`) n'est accessible que depuis le téléphone. Dans la cuisine, devant la tablette murale, on ne peut pas y ajouter ce qui manque.

## Objectif

Consulter et modifier la liste de courses depuis une tuile de la barre latérale, avec une synchronisation immédiate avec les téléphones.

## Hors périmètre

- Échéances, descriptions et réordonnancement des articles.
- Plusieurs listes dans une même tuile : une tuile par liste.

## Comportement attendu

### Scénario : la tuile compte ce qu'il reste à acheter

- **Étant donné** une liste avec des articles à acheter et des articles cochés
- **Quand** la barre latérale s'affiche
- **Alors** la tuile indique le nombre d'articles à acheter, ou « Liste vide »

### Scénario : ajouter un article au clavier

- **Étant donné** la modale ouverte
- **Quand** l'utilisateur saisit un article et valide (Entrée ou +)
- **Alors** l'article apparaît dans la liste, non coché, et le champ se vide

### Scénario : cocher un article

- **Étant donné** un article à acheter
- **Quand** l'utilisateur le touche
- **Alors** il est coché et barré ; le toucher de nouveau le décoche

### Scénario : retirer les articles cochés

- **Étant donné** des articles cochés
- **Quand** l'utilisateur touche « Retirer les articles cochés »
- **Alors** ils disparaissent de la liste, et le bouton aussi

### Scénario : synchronisation

- **Étant donné** la tuile affichée
- **Quand** la liste change ailleurs (téléphone, assistant vocal)
- **Alors** la tuile et la modale se mettent à jour sans recharger la page

## Critères d'acceptation

- [x] Les articles à acheter apparaissent avant les articles cochés.
- [x] Chaque scénario est couvert : `e2e/courses.spec.ts`, et `hooks/useTodoList.test.ts` pour l'abonnement et les services.

## Impacts

- Config : type de tuile `shoppingList` dans `SideBarConfigType.shortcuts`.
- Mock : la liste est simulée, avec l'abonnement `todo/item/subscribe` et les services `todo.*`.
