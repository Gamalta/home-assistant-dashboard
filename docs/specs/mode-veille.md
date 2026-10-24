# Mode veille de la tablette murale

- Issue : #24
- Statut : Livrée

## Problème

La tablette murale reste allumée toute la journée et la nuit. Le dashboard affiché en permanence éclaire la pièce dans le noir, et il fige les mêmes pixels à l'écran.

## Objectif

Après un délai sans interaction, la tablette affiche un écran sombre avec l'heure ; un appui la réveille, sans actionner ce qui se trouve dessous.

## Hors périmètre

- Éteindre l'écran ou régler son rétroéclairage : un navigateur n'y a pas accès, c'est le rôle de l'application kiosque.
- Garder l'écran allumé (Screen Wake Lock) : idem.
- Une veille réglée par maison : le délai est propre à chaque appareil.

## Comportement attendu

### Scénario : mise en veille

- **Étant donné** un délai de veille réglé sur l'appareil
- **Quand** aucun appui, touche ni défilement n'a lieu pendant ce délai
- **Alors** un écran noir apparaît en fondu, avec l'heure et la date

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
- [x] La scène 3D ne consomme rien de plus en veille.

## Impacts

- Option `screensaverMinutes` dans les options de l'appareil (`AppContext`).
