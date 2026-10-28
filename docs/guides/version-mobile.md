# Version mobile

Sous 600 px de large, sur un téléphone en portrait, le dashboard remplace la barre latérale par un en-tête qui choisit entre deux vues, 3D et Pièces ([ADR 0038](../adr/0038-disposition-mobile-a-deux-vues.md)). La tablette ne change pas. Il n'y a rien à configurer : tout vient du `House.ts` de la maison.

## Ce qu'on trouve où

| Zone       | Contenu                                                                               | D'où ça vient                                     |
| ---------- | ------------------------------------------------------------------------------------- | ------------------------------------------------- |
| En-tête    | Sélecteur « 3D » / « Pièces », avatars                                                | `SideBarConfig` (personnes)                       |
| Vue 3D     | Scène 3D cadrée sur une pièce, menu rapide, carrousel des pièces                      | `HouseConfig.rooms`, [menu rapide](raccourcis.md) |
| Vue Pièces | Une carte par pièce, avec une tuile par équipement et des filtres                     | `HouseConfig.rooms[].items`                       |
| Foyer      | Personnes, animaux, raccourcis, puis Thème, Maison (s'il y en a plusieurs) et Système | `SideBarConfig`                                   |

## Gestes

- **Choisir une pièce** : touchez sa puce, ou glissez le carrousel. La caméra vole jusqu'à elle, et seules ses étiquettes restent dans la scène ([ADR 0039](../adr/0039-vol-de-camera-vers-une-piece.md)).
- **Carte de pièce** : dans le carrousel, toutes les cartes ont la même hauteur. Quand une pièce a plus de quatre équipements, faites défiler ses tuiles dans la carte.
- **Tuile** : elle se comporte comme l'étiquette de la scène.
  - Un appui court bascule une lumière ou une prise, et ouvre la modale des autres équipements.
  - Un appui long ouvre la modale d'une lumière ou d'une prise.
  - Un doigt qui glisse pour faire défiler n'appuie sur rien.
- **Modales** : elles s'ouvrent en carte, au centre de l'écran. Touchez le fond pour les fermer.
- **Foyer** : touchez les avatars de l'en-tête.

## Bien nommer les équipements

Une tuile affiche le `friendly_name` de l'entité dans Home Assistant, sur deux lignes au plus. Préférez des noms courts (« Plafonnier », « Fenêtre ») à des noms qui répètent la pièce, déjà écrite en tête de carte.

L'ordre des pièces, dans le carrousel comme dans la liste, est celui de `HouseConfig.rooms`. La première pièce est cadrée à l'ouverture.

La caméra se centre sur la lampe principale de la pièce : sa première lumière dans `House.ts`, retrouvée dans le modèle. Mettez le plafonnier en premier. Une pièce sans lumière dans le modèle est centrée sur son étiquette (`position`).

## Pour les développeurs

- `useIsMobile` (`src/hooks/useIsMobile.ts`) est la seule source de la bascule. Il est lu dès le premier rendu.
- Les composants propres au mobile vivent dans `src/components/Mobile/`. Les tuiles sont la variante `tile` des éléments de pièce (`House/Room/RoomItem`) : un nouveau type d'équipement doit prévoir les deux rendus.
- Le cadrage se règle dans `src/components/3d/RoomFocus.tsx` (`DISTANCE`, `SHIFT`) : les calculs sont dans `src/utils/camera.ts`, la lampe visée dans `src/utils/model.ts`.
- La page passe sous l'encoche et la barre d'accueil de l'iPhone (`viewport-fit=cover`). Un élément collé à un bord de l'écran ajoute `env(safe-area-inset-*)` à sa marge, comme l'en-tête et le carrousel. Les modales se centrent entre les zones sûres.
- Une modale de téléphone donne toute sa carte au contenu, sans marge en plus. Elle doit tenir dans les 659 px que Safari laisse visibles sur un iPhone 15 Pro : une hauteur relative à l'écran s'y écrit en `svh`, car `vh` compte aussi les barres de Safari. Une largeur fixe y devient `{xs: '100%', sm: …}`, et deux blocs côte à côte s'empilent (`direction={{xs: 'column', sm: 'row'}}`). La page ne défile pas (`overflow: hidden` dans `theme/components/CssBaseline.ts`) : ce qui déborde est coupé.
- Pour essayer : `pnpm build && pnpm preview`, puis la vue mobile des outils de développement, en 390 × 844. Les tests E2E sont dans `e2e/mobile.spec.ts`.
