# 0044 — Retour haptique par l'API Vibration et l'interrupteur d'iOS

- Statut : Proposé
- Date : 2026-10-28
- Issue : #70

## Contexte

Sur le téléphone, un appui long ouvre une modale et un appui court bascule une lumière sans que le doigt sente rien : on ne sait pas si l'appui long a pris avant de lever le doigt. Le propriétaire veut un retour haptique, comme dans l'application Maison d'iOS.

- Chrome sur Android expose `navigator.vibrate`, une fois que l'utilisateur a touché la page.
- Safari n'a pas l'API Vibration. Depuis iOS 18, basculer un interrupteur natif (`<input type="checkbox" switch>`) fait vibrer l'iPhone, y compris par un clic de script.

## Décision

Une seule fonction, `haptic()` (`src/utils/haptic.ts`), vibre 10 ms avec `navigator.vibrate`, et sinon clique sur un interrupteur caché qu'elle retire aussitôt.

Elle est appelée à deux endroits seulement :

- à l'ouverture de toute modale (`Modal`), quel que soit le geste qui l'ouvre ;
- à l'appui court de `useLongPress`, qui bascule une lumière ou une prise.

## Conséquences

- Aucune dépendance ajoutée. La tablette murale n'a pas de vibreur : l'appel n'y fait rien.
- Un nouveau retour haptique passe par `haptic()`, pas par `navigator.vibrate`.
- L'astuce de l'interrupteur repose sur un comportement d'iOS, pas sur une API : une mise à jour d'iOS peut la faire taire, sans autre effet. iOS peut aussi l'ignorer hors d'un geste, quand la modale s'ouvre au bout de l'appui long : à vérifier sur l'iPhone.
- Ni Chromium sans tête ni jsdom ne vibrent : les tests vérifient l'appel, le doigt vérifie la vibration.

## Alternatives considérées

- **`navigator.vibrate` seul** : rien sur iPhone, le téléphone du propriétaire.
- **Le paquet `ios-haptics`** : une dépendance pour quinze lignes.
- **Vibrer aussi à l'appui long** : l'ouverture de la modale vibre déjà, le doigt sentirait deux coups.
