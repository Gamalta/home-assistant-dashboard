# Elihome Dashboard

Dashboard Home Assistant pour tablette murale : la maison est affichée en 3D, et chaque lumière, thermomètre, volet ou climatisation se pilote directement dans la scène.

React 19 · Vite · React Three Fiber · three.js · MUI · [@hakit/core](https://github.com/shannonhochkins/ha-component-kit)

## Démarrer

Prérequis : Node 24 et pnpm 10.

```sh
git clone --recurse-submodules https://github.com/Gamalta/home-assistant-dashboard.git
pnpm install
cp .env.example .env   # ou créer .env, voir ci-dessous
pnpm dev
```

Sans accès au sous-module privé `src/configs/apartment`, utiliser la maison `demo`.

| Variable                   | Rôle                                                   | Exemple                            |
| -------------------------- | ------------------------------------------------------ | ---------------------------------- |
| `VITE_HA_URL`              | URL de l'instance Home Assistant                       | `https://homeassistant.local:8123` |
| `VITE_MOCK_HOME_ASSISTANT` | `true` pour simuler Home Assistant                     | `true`                             |
| `VITE_HOUSE_CONFIGS`       | Maisons disponibles, la première s'ouvre par défaut    | `["demo"]`                         |
| `SENTRY_AUTH_TOKEN`        | Upload des sourcemaps au build (laisser vide en local) |                                    |

## Scripts

| Commande                                 | Effet                                            |
| ---------------------------------------- | ------------------------------------------------ |
| `pnpm dev`                               | Serveur de développement                         |
| `pnpm build` / `pnpm preview`            | Build de production et serveur local             |
| `pnpm lint` / `pnpm fix`                 | Lint gts, avec correction automatique pour `fix` |
| `pnpm optimize-model <in.glb> [out.glb]` | Compression d'un modèle glTF pour le web         |
| `pnpm bench`                             | Mesure du rendu sur le build de production       |

## Documentation

Tout est dans [`docs/`](docs/README.md) : état des lieux, conventions, décisions d'architecture (ADR), specs et guides.
