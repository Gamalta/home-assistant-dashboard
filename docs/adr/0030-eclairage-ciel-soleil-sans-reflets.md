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

L'option « Reflets d'environnement » est supprimée, avec le HDR et la sonde de lumière. Les matériaux sont toujours convertis en Lambert. L'éclairage ambiant devient `Daylight`, qui crée deux lumières fixes :

- une lumière hémisphérique : ciel bleuté de jour, gris neutre de nuit, et sol brun ;
- une lumière directionnelle pour le soleil, placée d'après les attributs `elevation` et `azimuth` de `sun.sun`, ou d'après l'heure sans cette entité. Elle est orangée près de l'horizon et s'éteint sous -6°. L'option de config `orientation` de la maison oriente le modèle.

Les intensités suivent le soleil : le ciel varie de 0,45 la nuit à 0,6 le jour, et le soleil de 0 à 2.

Le rendu passe en tone mapping Neutral (Khronos PBR Neutral). Il garde la teinte des lampes et adoucit leurs zones saturées ; ACES délavait les murs et AgX les couleurs. Il est fixé dans `onCreated`, car React Three Fiber n'impose le sien qu'à la création.

### Ambiances à l'essai

Le propriétaire trouve le rendu du soleil réel trop réaliste et peu flatteur. Il veut un beau rendu, plus doux et léger. Dix ambiances (`src/rendering/lightingStyles.ts`) s'essaient donc dans un panneau posé sur la vue 3D, ouvert depuis la modale Système, le temps qu'il en retienne une. Le panneau a aussi un curseur d'heure, non mémorisé, pour les voir de jour comme de nuit :

- chacune règle les mêmes lumières fixes : ciel, sol, lumière ambiante, soleil réel ou fixe ;
- elle fixe aussi le tone mapping ;
- deux d'entre elles teintent en plus les sols et les murs.

Changer d'ambiance ne recompile que si le tone mapping ou les teintes changent, et seulement au moment du choix. Une fois l'ambiance retenue, la table se réduit à elle, ou aux deux ou trois gardées comme option.

## Conséquences

- Mesuré sur M4, en 1440 × 900 @2, au repos :
  - le GPU reste égal en WebGL (démo 4,4 → 4,9 ms, appartement 4,6 → 4,5 ms, à la précision de la mesure près) ;
  - il est divisé par deux en WebGPU (démo 4,8 → 2,5 ms, appartement 7,9 → 3,8 ms).
- Au démarrage, la démo compile 26 programmes de part et d'autre, une fois les lampes allumées. Le ciel et le soleil font partie de la clé des programmes dès la première compilation.
- Le nombre de lumières ne varie jamais : la journée qui passe ne change que des uniforms, sans aucune recompilation. Un E2E le vérifie. Ne jamais monter ni démonter `Daylight` selon l'heure.
- Le soleil ne projette pas d'ombre : il en faudrait une carte de plus, et la mise à jour de toutes les ombres à chaque mouvement du soleil.
- Les ombres des lampes récupèrent l'unité de texture qu'occupait la carte d'environnement.
- Complète l'[ADR 0005](0005-qualite-adaptative-en-mouvement.md) : les matériaux sont désormais toujours en Lambert. Remplace la sonde de lumière précalculée de la PR #36 : son ADR 0014 passe à « Remplacé par 0030 » si elle est mergée.

## Alternatives considérées

- **Garder les reflets en option, allégés** (`MeshStandardMaterial`, PMREM de 64 px) : le coût par lampe et par pixel reste, et le gain se voit à peine sur des matériaux mats.
- **Garder la sonde de lumière du HDR de nuit** : sa teinte est fixe, sans lien avec l'heure, et elle n'apporte presque rien de plus que le ciel.
- **Occlusion ambiante en post-traitement (SSAO, N8AO)** : trop lourde pour l'Adreno 610 en rotation.
- **Occlusion ambiante précalculée dans le modèle** : c'est le meilleur gain de réalisme restant, sans coût au rendu, mais il faut un dépliage UV ou une géométrie subdivisée. Piste pour plus tard.
