# 0044 — Retour haptique par l'API Vibration et l'interrupteur d'iOS

- Statut : Proposé
- Date : 2026-10-29
- Issue : #70

## Contexte

Sur le téléphone, un appui long ouvre une modale et un appui court bascule une lumière sans que le doigt sente rien : on ne sait pas si l'appui long a pris avant de lever le doigt. Le propriétaire veut un retour haptique, comme dans l'application Maison d'iOS.

- Chrome sur Android expose `navigator.vibrate`, une fois que l'utilisateur a touché la page.
- Safari n'a pas l'API Vibration. Depuis iOS 18, basculer un interrupteur natif (`<input type="checkbox" switch>`) fait vibrer l'iPhone.
- Jusqu'à iOS 26.4, un clic de script sur cet interrupteur suffisait. iOS 26.5 l'ignore : seul un vrai toucher qui bascule l'interrupteur, directement ou par son label, fait vibrer.
- `useLongPress` annulait le clic du navigateur à la fin du toucher, pour ne pas basculer deux fois la lumière.

## Décision

- **Android** : `haptic()` (`src/utils/haptic.ts`) vibre 10 ms avec `navigator.vibrate`, à l'appui court de `useLongPress` et à l'ouverture de toute modale (`Modal`), quel que soit le geste qui l'ouvre.
- **iPhone** : la tuile (`Mobile/Tile.tsx`) est couverte d'un label invisible qui relaie le toucher à un interrupteur caché. Chaque toucher de tuile le bascule et fait vibrer.
- L'appui court de `useLongPress` attend donc le clic du navigateur. Seul l'appui long l'annule, pour que le doigt levé ne referme pas la modale qu'il vient d'ouvrir.

## Conséquences

- Aucune dépendance ajoutée. La tablette murale n'a pas de vibreur : `haptic()` n'y fait rien.
- Sur iPhone, l'appui long ne vibre pas : quand la modale s'ouvre, le doigt est encore posé et il n'y a pas de clic. Les étiquettes 3D, le menu rapide et le Foyer ne vibrent pas non plus, faute d'interrupteur.
- Un élément à faire vibrer sur iPhone doit cacher son propre interrupteur sous le doigt, comme la tuile. Arrêter la propagation du clic relayé évite un second appui.
- L'interrupteur repose sur un comportement d'iOS, pas sur une API : une mise à jour peut le faire taire, sans autre effet.
- Ni Chromium sans tête ni jsdom ne vibrent : les tests vérifient l'appel à `navigator.vibrate` et la bascule de l'interrupteur, le doigt vérifie la vibration.

## Alternatives considérées

- **Un clic de script sur un interrupteur** : ignoré depuis iOS 26.5.
- **Glisser un label sous le doigt à la fin de chaque toucher**, comme le paquet `vibration` : tout appel à `haptic()` pendant un toucher vibrerait. Le paquet n'a ni version publiée ni historique, et le recopier ajoute une mécanique globale pour un seul usage.
- **Le paquet `ios-haptics`** : il pose le même label que la tuile, pour une dépendance.
- **Vibrer aussi à l'appui long** : l'ouverture de la modale vibre déjà sur Android ; sur iPhone, c'est impossible.
