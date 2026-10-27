# 0039 — Vol de caméra vers une pièce

- Statut : Proposé
- Date : 2026-10-25
- Issue : #70

## Contexte

Sur mobile, le carrousel de la vue 3D choisit une pièce ([ADR 0038](0038-disposition-mobile-a-deux-vues.md)), et la caméra doit la cadrer. Jusqu'ici, seul l'utilisateur déplaçait la caméra, avec `OrbitControls`.

Contraintes :

- rendu à la demande : une animation doit s'arrêter d'elle-même ([ADR 0002](0002-rendu-3d-a-la-demande.md)) ;
- en mouvement, le DPR baisse et les ombres sont suspendues par `receiveShadow`, sans recompiler ([ADR 0005](0005-qualite-adaptative-en-mouvement.md), [ADR 0012](0012-suspendre-les-ombres-par-receiveshadow.md)) ;
- aucun programme ne doit être compilé pendant un mouvement ([ADR 0009](0009-budget-performance-tablette.md)) ;
- le champ vertical est fixe (75°) : en portrait, la vue est trois fois plus étroite qu'en paysage ;
- un carrousel couvre la moitié basse de l'écran ;
- la config ne décrit une pièce que par un point (`room.position`), pas par ses dimensions.

## Décision

`RoomFocus`, monté dans le `Canvas` quand une pièce est choisie, cadre cette pièce.

- **Centre** : `roomCenter` vise la lampe principale de la pièce, sa première lumière dans la config. Il la retrouve dans le modèle avec `findModelLight`, la règle de `RoomLight3d` : la caméra vise la lampe que pilote Home Assistant. Sans lumière dans le modèle, il vise l'étiquette de la pièce (`room.position`).
- **Pose** : `roomCameraPose`, une fonction pure testée, la calcule.
  - La caméra garde la direction de celle du modèle, vue depuis l'origine, et se place à 4 unités de la cible.
  - `portraitDistance` multiplie cette distance par la largeur relative de la vue (au plus ×2,5), pour garder la même largeur de scène en portrait.
  - La cible est à la hauteur de la lampe, et avance vers la caméra de 45 % de la distance : la lampe se place au milieu de la zone visible, entre l'en-tête et le carrousel.
- **Premier cadrage sans vol** : à l'ouverture, la caméra est posée directement sur la première pièce.
- **Vol** : un `useFrame` rapproche `camera.position` et `controls.target` de la pose par lissage exponentiel (taux 6/s), à l'image de `RoomLight3d`.
  - Il appelle `controls.update()` pour orienter la caméra dès l'image en cours.
  - Il s'arrête de lui-même à moins d'un centimètre de la pose.
- **Mode mouvement** : le vol envoie `start` aux `OrbitControls` au départ, puis `end` à l'arrivée, comme `__dashboardMotionBenchmark`. `Camera` le traite comme un geste : DPR réduit, ombres suspendues, puis retour à la qualité de repos 250 ms après l'arrivée.
- **Geste de l'utilisateur** : il interrompt le vol. Le `end` est alors celui de son geste.

## Conséquences

- Aucun programme compilé et aucune dépendance ajoutée : le vol réutilise le chemin du geste.
- Un vol dure environ une seconde en qualité réduite, puis l'image se raffermit.
- Les réglages (distance 4, avance 45 %) conviennent au modèle démo. Une maison à l'échelle très différente pourrait en demander d'autres.
- Une fois la pièce cadrée, les gestes tournent autour de sa lampe.
- En WebGPU, chaque vol paie la reconstruction des pipelines liée à `receiveShadow` ([ADR 0017](0017-webgl-par-defaut.md)).
- La tablette n'a pas de pièce choisie : sa caméra ne change pas.

## Alternatives considérées

- **`CameraControls` de drei** : des transitions toutes faites, mais il remplace `OrbitControls`, dont `Camera` écoute les événements pour le mode mouvement.
- **Cadrer la boîte englobante de la pièce** (`fitToBox`) : la config n'a pas la géométrie des pièces, et les retrouver dans le modèle dépend du nommage des meshes.
- **Viser le sol sous l'étiquette** (première version) : la lampe et les étiquettes remontaient en haut de l'écran. L'étiquette est aussi placée à la main, parfois à côté de la lampe.
- **Élargir le champ en portrait** : au-delà de 100°, la perspective se déforme fortement.
- **Sauter sans animation** : on perd le repère spatial qui montre où se trouve la pièce.
