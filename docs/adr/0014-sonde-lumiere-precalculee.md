# 0014 — Sonde de lumière précalculée, HDR chargé avec les reflets seulement

- Statut : Proposé
- Date : 2026-10-24
- Issue : #11

## Contexte

Sans les reflets, l'option par défaut, l'éclairage d'ambiance vient d'une `LightProbe` dont les 9 coefficients d'harmoniques sphériques étaient calculés en JS au démarrage, à partir de `dikhololo_night_1k.hdr`. Le fichier pèse 1,7 Mo. `useEnvironment` le chargeait dans le `<Canvas>`, donc après le modèle : la scène attendait ce téléchargement, puis son décodage. Les coefficients, eux, ne changent qu'avec le fichier.

Avec les reflets, le HDR reste indispensable : `<Environment>` en tire la carte d'environnement (PMREM).

## Décision

Les coefficients sont versionnés dans `src/rendering/environment/nightLightProbe.json`. `EnvironmentLighting` construit la sonde à partir de ce fichier, et ne monte `<Environment files={…}>`, qui télécharge le HDR, que si les reflets sont activés.

- Le calcul `sphericalHarmonicsFromEquirect` quitte le composant pour `src/rendering/environment/`. Il est inchangé.
- Le JSON est l'instantané (`toMatchFileSnapshot`) d'un test unitaire qui décode le HDR avec le `HDRLoader` de three, dont la sortie est identique à celle du `RGBELoader` de drei, puis recalcule les coefficients. Si le HDR change, `pnpm test` échoue et affiche la commande qui regénère le fichier : `pnpm run test -u`. `pnpm test -u` ne fonctionne pas, car pnpm intercepte l'option.
- Les coefficients sont arrondis à 12 chiffres significatifs. Au-delà, ils diffèrent entre le Mac (arm64) et la CI (x64), alors que le GPU n'en lit que 7 (float32). Les 27 valeurs restent identiques une fois converties en float32. Le fichier est formaté par prettier, pour qu'un `prettier --write` ne le modifie pas.
- `EnvironmentLighting` importe lui-même le HDR, pour garder le fichier et ses coefficients au même endroit.
- `SceneMaterials` compose les matériaux dans un `useLayoutEffect`. Sans l'attente du HDR, la première image pouvait partir avant son effet : elle compilait les `MeshPhysicalMaterial` d'origine (6 programmes sur `demo`, 8 sur `apartment`), aussitôt remplacés par Lambert.

## Conséquences

Les mesures sont faites sur le build de production, avec Chrome et le GPU d'un Mac, une fenêtre de 1280×800 et un DPR de 2. Chaque mesure part d'un navigateur neuf, les variantes « avant » et « après » sont entrelacées, et la valeur retenue est la médiane de 5 à 9 lancements. Le débit de 3 Mo/s, environ 25 Mbit/s, simule le Wi-Fi de la tablette.

| Maison, options par défaut | Transféré            | Scène prête, 3 Mo/s  | 1re image, 3 Mo/s    | 1re image, sans bridage |
| -------------------------- | -------------------- | -------------------- | -------------------- | ----------------------- |
| demo                       | 4 778 → **3 285** Ko | 2 235 → **1 638** ms | 2 355 → **1 803** ms | 1 295 → **1 152** ms    |
| apartment                  | 9 052 → **7 559** Ko | 3 870 → **3 243** ms | 4 070 → **3 517** ms | 1 486 → **1 378** ms    |

- L'image est identique au pixel près avant et après, sans reflets, avec reflets et avec ombres, sur les deux maisons. La bascule des reflets donne aussi les mêmes images.
- Avec les reflets, rien ne change : même volume, temps égaux aux variations de mesure près.
- Le nombre de draw calls est inchangé (46 sur `demo`, 929 sur `apartment`).
- La première activation des reflets télécharge le HDR. Pendant ce téléchargement, la scène suspend et le chargeur remplace la vue 3D. Les activations suivantes réutilisent le fichier déjà chargé.
- La scène s'affiche désormais avant que les lumières des pièces aient commencé leur fondu d'allumage. Cette première image, toutes lumières éteintes, compile 5 programmes Lambert de plus au démarrage (25 au lieu de 20 sur `demo`). Ils sont plus que compensés par le gain de temps, et la compilation au démarrage relève de l'issue #12.
- Changer de HDR demande de regénérer les coefficients. Le test le rappelle.
- Le résultat dépend du décodeur de three. Si une montée de version change une valeur au douzième chiffre, il suffit de regénérer le fichier.

## Alternatives considérées

- **Script de génération (`pnpm generate:probe`)** : un script de plus dans `package.json`, et il faut quand même un test pour détecter un fichier oublié. L'instantané fait les deux.
- **Test qui compare à une liste de nombres écrite dans le test** : la mise à jour passerait par un copier-coller. Avec l'instantané, une seule commande suffit.
- **Coefficients dans un fichier `.ts`** : prettier et le lint s'y appliquent, et l'instantané devrait reproduire leur format exact.
- **Calcul à la compilation, par un plugin Vite** : plus de code et un build plus lent, pour un résultat qui change une fois par an au plus.
- **`<Suspense>` local autour de `<Environment>`, avec la sonde en attendant** : pas de chargeur à l'activation des reflets, mais au démarrage la scène apparaîtrait sans reflets, puis changerait d'éclairage.
- **Garder tous les chiffres** : les derniers changent d'une machine à l'autre, et le test échouait en CI.
- **Arrondir à 6 chiffres** : le fichier serait plus court, mais les valeurs float32 changeraient, et l'image ne serait plus identique au bit près.
