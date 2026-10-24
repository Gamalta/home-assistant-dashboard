# Sonde de lumière précalculée

- Issue : #11
- Statut : Remplacée par [Éclairage réaliste](eclairage-realiste.md) (ADR 0030)

## Problème

Sans les reflets d'environnement, l'option par défaut, la tablette télécharge et décode quand même les 1,7 Mo de `dikhololo_night_1k.hdr` à chaque démarrage. Le fichier ne sert qu'à calculer les 9 coefficients de la lumière d'ambiance (`LightProbe`), qui ne changent jamais. Le chargement de la scène attend ce téléchargement.

## Objectif

Avec les options par défaut, la scène s'affiche sans télécharger le HDR, avec un rendu identique.

## Hors périmètre

- Le rendu avec les reflets, qui a toujours besoin du HDR.
- Le préchargement du HDR avant l'activation des reflets.

## Comportement attendu

### Scénario : ne télécharge pas le HDR avec les options par défaut

- **Étant donné** les options graphiques par défaut, reflets désactivés
- **Quand** le dashboard charge la scène 3D
- **Alors** aucune requête ne part vers le fichier `.hdr`

### Scénario : télécharge le HDR dès que les reflets sont activés

- **Étant donné** la scène chargée sans les reflets
- **Quand** l'utilisateur active « Reflets d'environnement » dans la modale Système
- **Alors** le HDR est téléchargé

### Scénario : garde la sonde de lumière versionnée identique au calcul depuis le HDR

- **Étant donné** des coefficients versionnés dans `src/rendering/environment/nightLightProbe.json`
- **Quand** le HDR change sans que les coefficients soient regénérés
- **Alors** `pnpm test` échoue et indique la commande qui les regénère, `pnpm run test -u`

## Critères d'acceptation

- [x] Aucune requête `.hdr` avec les options par défaut (E2E).
- [x] Une requête `.hdr` à l'activation des reflets (E2E).
- [x] Coefficients synchronisés avec le HDR (test unitaire).
- [x] Rendu identique au pixel près, avec et sans reflets, sur `demo` et `apartment`.
- [x] Budget de performance respecté ([ADR 0009](../adr/0009-budget-performance-tablette.md)) : mêmes draw calls, aucun programme compilé pendant une rotation.

## Impacts

- Démarrage par défaut : 1,46 Mo de moins à télécharger. Avec un débit de 3 Mo/s, la scène est prête environ 0,6 s plus tôt (mesures dans l'[ADR 0014](../adr/0014-sonde-lumiere-precalculee.md)).
- La première activation des reflets affiche le chargeur le temps de télécharger le HDR. Les suivantes réutilisent le fichier déjà chargé.
- Changer de HDR demande de regénérer les coefficients.
- Aucune migration des options stockées.
