# Mode veille de la tablette murale

- Issue : #24
- Statut : Livrée

## Problème

La tablette murale reste allumée toute la journée et la nuit. Le dashboard affiché en permanence éclaire la pièce dans le noir, et il fige les mêmes pixels à l'écran.

## Objectif

Après un délai sans interaction, la tablette affiche un écran de veille lisible de loin : l'heure, la météo, les prochains trains et les alertes de la maison, sur un ciel qui suit le jour. Un appui la réveille, sans actionner ce qui se trouve dessous.

## Hors périmètre

- Éteindre l'écran ou régler son rétroéclairage : un navigateur n'y a pas accès, c'est le rôle de l'application kiosque.
- Garder l'écran allumé (Screen Wake Lock) : idem.
- Une veille réglée par maison : le délai est propre à chaque appareil.
- La veille sur téléphone : la disposition mobile n'affiche ni l'écran de veille ni son réglage.

## Comportement attendu

### Scénario : mise en veille

- **Étant donné** un délai de veille réglé sur l'appareil
- **Quand** aucun appui, touche ni défilement n'a lieu pendant ce délai
- **Alors** l'écran de veille apparaît en fondu, avec l'heure et la date

### Scénario : informations de la maison

- **Étant donné** la météo, des trajets `trains` dans les raccourcis et des alertes dans la config de la barre latérale
- **Quand** l'écran de veille s'affiche
- **Alors** il montre une carte « Météo » (température, minimale et maximale du jour, quatre jours suivants), une carte par trajet avec ses trois prochains départs, et une carte des alertes. La carte des alertes n'apparaît que s'il y en a.

### Scénario : ciel et luminosité selon l'heure

- **Étant donné** l'écran de veille affiché
- **Quand** il fait nuit, d'après `sun.sun` ou, à défaut, l'heure
- **Alors** le fond est un ciel de nuit et le contenu est atténué (60 %). Le jour, le ciel s'éclaircit et le contenu est à pleine opacité. À l'aube et au crépuscule, le bas du ciel s'orange.

### Scénario : réveil sans effet de bord

- **Étant donné** l'écran de veille affiché
- **Quand** l'utilisateur touche l'écran, y compris à l'emplacement d'un bouton
- **Alors** le dashboard réapparaît et le bouton n'est pas actionné

### Scénario : réglage par appareil

- **Étant donné** la modale Système
- **Quand** l'utilisateur choisit un délai (« Jamais », 1, 5, 10 ou 30 min)
- **Alors** le choix est gardé sur cet appareil après un rechargement. « Jamais » est la valeur par défaut.

## Critères d'acceptation

- [x] Chaque interaction relance le délai (`hooks/useIdle.test.ts`).
- [x] Les scénarios sont couverts par `e2e/veille.spec.ts`.
- [x] La modale Système du téléphone ne propose pas de veille (`e2e/mobile.spec.ts`).
- [x] La scène 3D ne dessine aucune image pendant la veille (0 appel de dessin en 60 s, build de production).

## Impacts

- Option `screensaverMinutes` dans les options de l'appareil (`AppContext`).
- Aucune config propre à la veille : elle lit `weatherEntityId`, les raccourcis `trains` et `alerts` de la barre latérale.
- `useDaylight` est partagé avec l'éclairage de la scène 3D, et `useTrainDepartures` avec la tuile des trains.
