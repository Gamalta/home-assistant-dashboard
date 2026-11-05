# Thème sombre par défaut

- Statut : Livrée

## Problème

Sans choix enregistré, le dashboard suit l'heure (« Auto ») : il s'ouvre en clair de 6 h à 16 h. Le propriétaire veut le thème sombre tant qu'il n'a rien choisi.

## Objectif

Le dashboard s'ouvre en thème sombre, de jour comme de nuit, tant qu'aucun thème n'a été choisi.

## Hors périmètre

- Un nouveau thème : le sombre existant (« Sombre ») est repris tel quel.
- Les options « Système », « Auto » et « Clair », qui restent proposées.

## Comportement attendu

### Scénario : ouvre le dashboard en thème sombre, même en journée

- **Étant donné** aucun thème enregistré, à midi
- **Quand** le dashboard s'ouvre
- **Alors** il est en thème sombre

### Scénario : garde le thème choisi

- **Étant donné** le thème « Clair » choisi auparavant
- **Quand** le dashboard s'ouvre
- **Alors** il est en thème clair

## Critères d'acceptation

- [x] Thème sombre sans choix enregistré, même en journée (`src/contexts/ThemeProvider.test.tsx`).
- [x] Le thème choisi est gardé (`src/contexts/ThemeProvider.test.tsx`).

## Impacts

Un appareil qui n'a jamais choisi de thème passe en sombre, y compris en journée. Un choix enregistré, « Auto » compris, est conservé.
