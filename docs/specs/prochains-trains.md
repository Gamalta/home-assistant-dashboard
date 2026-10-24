# Prochains trains

- Issue : #26
- Statut : Livrée

## Problème

Avant de partir, il faut ouvrir l'application SNCF pour savoir si le prochain train est à l'heure. Home Assistant connaît déjà les départs grâce à l'intégration HACS `sncf_trains`, mais le dashboard ne les montre pas.

## Objectif

Une tuile par trajet dans la barre latérale montre le prochain départ et son retard, et sa modale liste les départs suivants.

## Hors périmètre

- Les trajets avec correspondance : l'intégration ne garde que les trajets directs.
- Les trains supprimés et la voie avec sncf_trains 1.3.3 : l'intégration ne les publie pas, et un train supprimé disparaît de la liste ([ADR 0027](../adr/0027-trains-sncf-par-prefixe.md)). Le dashboard les affiche dès qu'un capteur les fournit.
- Configurer les trajets depuis le dashboard : ils se créent dans l'intégration.

## Comportement attendu

### Scénario : la tuile affiche le prochain départ

- **Étant donné** un trajet dont le prochain train part à 07:42
- **Quand** la barre latérale s'affiche
- **Alors** la tuile porte le libellé du trajet et indique « 07:42 · à l'heure », ou « 07:42 · +5 min » si le train part avec 5 minutes de retard

### Scénario : un départ supprimé ou en retard se voit

- **Étant donné** un prochain départ supprimé, ou en retard
- **Quand** la tuile s'affiche
- **Alors** elle indique « 07:42 · supprimé » en rouge, ou le retard en orange

### Scénario : la modale liste les départs, avec le retard et le supprimé

- **Étant donné** un trajet avec plusieurs départs à venir
- **Quand** l'utilisateur touche la tuile
- **Alors** la modale liste les départs du plus proche au plus lointain. Pour chacun, elle met en avant l'heure de départ réelle, puis affiche l'heure prévue barrée si le train est en retard, le retard ou « supprimé », la voie si elle est connue, le mode, le numéro et l'heure d'arrivée

### Scénario : un train parti disparaît

- **Étant donné** un train dont l'heure de départ réelle est passée
- **Quand** la tuile se met à jour, au plus tard 30 s après
- **Alors** il n'apparaît plus, ni sur la tuile ni dans la modale. Un train prévu à une heure passée mais parti en retard reste affiché

### Scénario : données manquantes

- **Étant donné** des capteurs absents, inconnus ou indisponibles, ou des attributs manquants
- **Quand** la tuile s'affiche
- **Alors** ces capteurs sont ignorés, un train sans attributs est considéré à l'heure, et sans aucun départ la tuile indique « Aucun départ » et la modale « Aucun départ prévu. »

## Critères d'acceptation

- [x] Un trajet se configure par son libellé et le préfixe de ses capteurs.
- [x] La démo et le mock n'utilisent que des gares fictives, avec des horaires relatifs à l'heure courante.
- [x] Chaque scénario est couvert par un test : E2E `e2e/prochains-trains.spec.ts`, unitaires `src/utils/trains.test.ts` et `src/components/Modal/TrainsModal/index.test.tsx`.

## Impacts

- Config : nouveau type de tuile `trains` dans `SideBarConfigType.shortcuts`.
- Mock : un trajet fictif Paris → Lyon de 4 départs, dont un en retard et un supprimé, recalculés au chargement de la page.
- Performance : aucun impact sur la scène 3D. La tuile se redessine toutes les 30 s.
