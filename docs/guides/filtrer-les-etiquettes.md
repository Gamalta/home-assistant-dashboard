# Filtrer les étiquettes de la vue 3D

En haut de la vue 3D, une rangée de puces affiche ou masque les étiquettes par catégorie : **Lumières**, **Climat** (climatisations et thermomètres), **Volets** et **Ordinateurs**. Seules les catégories présentes dans la maison apparaissent.

- **Toucher une puce** masque ses étiquettes ; la toucher à nouveau les réaffiche. Une icône ambre signifie « affiché », une icône grise « masqué ».
- **Le nom de la catégorie** s'affiche au toucher, dans une infobulle.
- **L'étiquette d'une pièce** perd les éléments masqués, et disparaît s'il ne lui reste rien.
- **Les lumières restent allumées** dans la maison : seules leurs étiquettes disparaissent.
- **Le choix est mémorisé** sur l'appareil, comme les options graphiques : la tablette le retrouve au prochain démarrage, sans changer celui d'un autre écran.

## Ajouter une catégorie (développeurs)

Un nouveau type d'élément sans catégorie reste toujours affiché, sans puce. Pour le rendre filtrable, ajouter une ligne à `labelCategories` dans `src/utils/labelCategories.ts`, ou compléter les `types` d'une catégorie existante :

```ts
{id: 'outlet', label: 'Prises', icon: PowerIcon, types: ['outlet']},
```

Le choix de l'interface et du stockage est expliqué dans l'[ADR 0033](../adr/0033-filtre-des-etiquettes-par-categorie.md).
