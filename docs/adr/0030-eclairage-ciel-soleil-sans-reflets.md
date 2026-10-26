# 0030 — Éclairer par un ciel et un soleil, sans reflets d'environnement

- Statut : Proposé
- Date : 2026-10-24
- Issue : #56

## Contexte

- Les reflets d'environnement remettent tout le modèle en `MeshPhysicalMaterial`, qui évalue un BRDF complet pour chaque lumière et chaque pixel, et chargent une carte HDR de 1,7 Mo convertie en PMREM.
- Sur l'appartement en 2560 × 1440 @2, le GPU passe de 7,6 à 15,7 ms par image (M4). En WebGPU, l'option fige la page 3 s à l'activation. Sur la tablette (Adreno 610), ce n'est pas tenable, et le propriétaire ne parvient pas à les afficher même sur Mac.
- Le gain visuel est faible : les matériaux du modèle sont mats (rugosité ≥ 0,64, métal ≤ 0,2), donc leurs reflets se voient à peine.
- Sans reflets, la scène n'avait qu'une lumière ambiante uniforme et une sonde de lumière tirée d'un HDR de nuit. Les volumes se lisent mal, et sans tone mapping (`flat`) les zones éclairées par les lampes saturent.

## Décision

L'option « Reflets d'environnement » est supprimée, avec le HDR et la sonde de lumière. Les matériaux sont toujours convertis en Lambert. L'éclairage ambiant devient `Daylight`, qui crée deux lumières fixes : une lumière hémisphérique (ciel et sol) et un soleil haut et fixe. Seules leurs couleurs et leurs intensités suivent la hauteur du soleil, lue dans `sun.sun` ou déduite de l'heure :

|      | Ciel      | Sol       | Intensité du ciel | Soleil | Exposition |
| ---- | --------- | --------- | ----------------: | -----: | ---------: |
| Jour | `#fff3e3` | `#d9b48a` |               1,1 |   0,35 |        1,2 |
| Nuit | `#c8c4bc` | `#8a7660` |              0,45 |      0 |          1 |

Le rendu est en tone mapping Neutral (Khronos PBR Neutral) jour et nuit. Il garde la teinte des lampes et donne de la profondeur à la nuit. L'exposition n'est qu'un uniform : elle varie sans recompiler, alors que changer de tone mapping entre le jour et la nuit recompilerait tous les shaders au crépuscule.

### Comment ce rendu a été choisi

Un premier rendu suivait le soleil réel, en direction et en intensité. Le propriétaire l'a trouvé trop réaliste et peu flatteur : il veut un beau rendu, plus doux et léger.

Dix ambiances ont été essayées dans l'application, avec un curseur d'heure : plat, soleil réel, doux et chaud, cosy, maquette, fin d'après-midi, studio, chaud et saturé, et deux variantes qui teintaient sols et murs.

Il a retenu « doux et chaud » pour le jour et la nuit du soleil réel. Le curseur d'heure reste, dans un panneau posé sur la vue 3D, pour revoir le jour et la nuit.

## Conséquences

- Mesuré sur M4, en 1440 × 900 @2, au repos :
  - le GPU reste égal en WebGL (démo 4,4 → 4,9 ms, appartement 4,6 → 4,5 ms, à la précision de la mesure près) ;
  - il est divisé par deux en WebGPU (démo 4,8 → 2,5 ms, appartement 7,9 → 3,8 ms).
- Au démarrage, la démo compile 26 programmes de part et d'autre, une fois les lampes allumées. Le ciel et le soleil font partie de la clé des programmes dès la première compilation.
- Le nombre de lumières ne varie jamais : la journée qui passe ne change que des uniforms, sans aucune recompilation. Un E2E le vérifie. Ne jamais monter ni démonter `Daylight` selon l'heure.
- Le soleil ne projette pas d'ombre : il en faudrait une carte de plus, et la mise à jour de toutes les ombres à chaque mouvement du soleil.
- Les ombres des lampes récupèrent l'unité de texture qu'occupait la carte d'environnement.
- Complète l'[ADR 0005](0005-qualite-adaptative-en-mouvement.md) : les matériaux sont désormais toujours en Lambert. Remplace la sonde de lumière précalculée de l'[ADR 0014](0014-sonde-lumiere-precalculee.md).

## Alternatives considérées

- **Garder les reflets en option, allégés** (`MeshStandardMaterial`, PMREM de 64 px) : le coût par lampe et par pixel reste, et le gain se voit à peine sur des matériaux mats.
- **Garder la sonde de lumière du HDR de nuit** : sa teinte est fixe, sans lien avec l'heure, et elle n'apporte presque rien de plus que le ciel.
- **Occlusion ambiante en post-traitement (SSAO, N8AO)** : trop lourde pour l'Adreno 610 en rotation.
- **Occlusion ambiante précalculée dans le modèle** : c'est le meilleur gain de réalisme restant, sans coût au rendu, mais il faut un dépliage UV ou une géométrie subdivisée. Piste pour plus tard.
