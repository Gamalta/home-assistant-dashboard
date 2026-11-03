# Filtrer les étiquettes de la vue 3D

Ouvrir le dock en bas de la barre latérale (sur téléphone, le Foyer), puis **Configuration**. La colonne **Étiquettes** liste une catégorie par type d'élément présent dans la maison : **Lumières**, **Climat** (climatisations et thermomètres), **Volets**, **Ordinateurs**, **Prises**, **Télévision**, **Imprimante 3D**, **Aspirateur**, **Détecteur de fumée** et **Appareils sur pile**.

- **Couper une catégorie** masque ses étiquettes ; la réactiver les réaffiche.
- **Les appareils sur pile** (interrupteurs sans fil, télécommandes) sont passifs : masqués par défaut, ils s'affichent en activant leur ligne.
- **Batteries uniquement** n'affiche que le niveau de pile des éléments qui en donnent un (interrupteurs, détecteur de fumée, thermomètres avec `batteryEntityId`), quelle que soit leur catégorie. Un appui ouvre la modale habituelle de l'élément.
- **L'étiquette d'une pièce** perd les éléments masqués, et disparaît s'il ne lui reste rien.
- **Les lumières restent allumées** dans la maison : seules leurs étiquettes disparaissent.
- **Les choix sont mémorisés** sur l'appareil, comme les options graphiques : la tablette les retrouve au prochain démarrage, sans changer ceux d'un autre écran.

## Ajouter une catégorie (développeurs)

Un nouveau type d'élément sans catégorie reste toujours affiché, sans ligne dans la modale. Pour le rendre filtrable, ajouter une ligne à `labelCategories` dans `src/utils/labelCategories.ts`, ou compléter les `types` d'une catégorie existante. `passive: true` la masque par défaut :

```ts
{id: 'remote', label: 'Télécommandes', icon: RemoteIcon, types: ['remote'], passive: true},
```

Le choix de l'interface et du stockage est expliqué dans l'[ADR 0053](../adr/0053-reglages-dans-la-modale-configuration.md).
