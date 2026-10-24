# Raccourcis de la barre latérale et « Tout éteindre »

- Issue : #15
- Statut : Livrée

## Problème

Les actions qui concernent toute la maison n'ont pas d'emplacement : la carte sous les personnes est vide. Le soir, sur la tablette murale, il faut ouvrir chaque pièce pour éteindre ses lumières, sans même savoir lesquelles sont encore allumées.

## Objectif

Une grille de tuiles configurables dans la barre latérale. La première, « Tout éteindre », éteint en un geste toutes les lumières allumées de la maison.

## Hors périmètre

- Éteindre autre chose que des lumières (prises, TV) : un script Home Assistant le permet via `scriptEntityId`.
- Réordonner les tuiles depuis l'interface : l'ordre est celui de la config.

## Comportement attendu

### Scénario : la tuile indique ce qui est allumé

- **Étant donné** une maison avec des lumières allumées
- **Quand** la barre latérale s'affiche
- **Alors** la tuile « Tout éteindre » indique le nombre de lumières allumées, ou « Tout est éteint »

### Scénario : la modale liste les lumières allumées

- **Étant donné** des lumières allumées
- **Quand** l'utilisateur touche la tuile
- **Alors** une modale liste leurs noms

### Scénario : tout éteindre en un geste

- **Étant donné** la modale ouverte
- **Quand** l'utilisateur touche « Éteindre »
- **Alors** les lumières allumées de la maison s'éteignent en un seul appel au service `light.turn_off`, la modale se ferme et la tuile indique « Tout est éteint »

### Scénario : script Home Assistant à la place

- **Étant donné** une tuile configurée avec `scriptEntityId`
- **Quand** l'utilisateur touche « Éteindre »
- **Alors** le script est lancé, et le dashboard n'éteint rien lui-même

### Scénario : rien à éteindre

- **Étant donné** aucune lumière allumée et aucun script
- **Quand** la modale est ouverte
- **Alors** elle indique « Aucune lumière allumée. » et le bouton est désactivé

## Critères d'acceptation

- [x] Les tuiles viennent de `sideBar.shortcuts` ; sans config, la carte reste vide.
- [x] Seules les lumières de la maison configurée sont concernées.
- [x] Chaque scénario est couvert par un test (E2E `e2e/raccourcis.spec.ts`, unitaires `AllLightsOffModal/index.test.tsx` et `utils/house.test.ts`).

## Impacts

- Config : champ optionnel `shortcuts` dans `SideBarConfigType`.
- Mock : `light.turn_off` et les services appelés sur plusieurs entités à la fois sont désormais simulés, et les lumières de la démo ont un nom.
- Performance : aucun impact sur la scène 3D.
