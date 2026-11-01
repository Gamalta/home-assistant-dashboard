# Carte des températures depuis le menu rapide

- Issue : à créer
- Statut : Validée

## Problème

La carte des températures colore le sol de chaque pièce selon sa température et ne laisse que les étiquettes de thermomètre et de climatisation. Elle n'est accessible que dans la modale Système, parmi les options graphiques : il faut ouvrir le dock, la modale, puis trouver l'interrupteur. Le menu rapide de la démo propose bien « Température », mais c'est un script Home Assistant, sans effet sur l'affichage.

## Objectif

L'action « Température » du menu rapide affiche la carte des températures en deux appuis, et la coupe de la même façon. Elle remplace l'interrupteur de la modale Système.

## Hors périmètre

- Le rendu de la carte : couleurs, échelle, transparence de la maison.
- Un mode qui se coupe seul : la carte reste affichée tant qu'on ne la coupe pas, même après un rechargement.

## Comportement attendu

### Scénario : afficher la carte des températures

- **Étant donné** le menu rapide ouvert et la carte coupée
- **Quand** l'utilisateur touche « Température »
- **Alors** le menu se referme et le sol des pièces se colore selon leur température
- **Et** seules les étiquettes de thermomètre et de climatisation restent, avec leurs modales

### Scénario : revenir à la vue normale

- **Étant donné** la carte des températures affichée
- **Quand** l'utilisateur rouvre le menu rapide
- **Alors** « Température » est en surbrillance
- **Et** un appui dessus coupe la carte et rend toutes les étiquettes

### Scénario : la carte reste affichée après un rechargement

- **Étant donné** la carte activée depuis le menu rapide
- **Quand** la page se recharge
- **Alors** la carte reste affichée et « Température » en surbrillance

### Scénario : la modale Système ne propose plus la carte

- **Étant donné** la modale Système ouverte
- **Quand** l'utilisateur parcourt la section « Affichage »
- **Alors** l'interrupteur « Carte des températures » n'y figure plus

### Scénario : maison sans scénario

- **Étant donné** une maison sans `sideBar.scenarios`
- **Quand** le dashboard s'affiche
- **Alors** le menu rapide apparaît avec la seule action « Température »

## Critères d'acceptation

- [x] « Température » est une action du dashboard, placée en tête du menu, avant les scripts.
- [x] Elle bascule l'option mémorisée `heatmapShader`, dont l'interrupteur quitte la modale Système ([ADR 0041](../adr/0041-carte-des-temperatures-dans-le-menu-rapide.md)).
- [x] Budget de performance : rien de nouveau, la carte coûte ce qu'elle coûtait depuis la modale Système.
- [x] Chaque scénario est couvert par un test : E2E `e2e/shortcuts.spec.ts` et `e2e/options.spec.ts`, unitaires `QuickMenu/HeatmapAction.test.tsx` et `QuickMenu/index.test.tsx`.

## Impacts

- Config : `script.temperature` quitte les scénarios de la démo et le mock. Une maison qui garde un script « Température » l'affiche à côté de l'action.
- Modale Système : l'interrupteur « Carte des températures » disparaît. Le choix mémorisé est conservé : une carte activée avant la mise à jour reste affichée, et se coupe depuis le menu.
- Performance : la carte multiplie le temps GPU par 2,7 sur la démo ([état des lieux](../etat-des-lieux.md#constats)), et l'activer recompile les matériaux du sol derrière la compilation asynchrone ([ADR 0015](../adr/0015-compilation-asynchrone.md)), comme avant.
