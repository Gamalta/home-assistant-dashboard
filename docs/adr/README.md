# Décisions d'architecture (ADR)

Un ADR consigne **une** décision structurante : son contexte, ce qui a été choisi, ce que cela coûte et ce qui a été écarté. Il se lit en deux minutes et ne se réécrit pas. Si une décision change, un nouvel ADR la remplace et l'ancien passe à « Remplacé par NNNN ».

## Quand en écrire un

- Ajout ou retrait d'une dépendance.
- Nouveau motif d'architecture (contexte, backend, format de config).
- Compromis entre qualité visuelle et performance.
- Changement de l'outillage (tests, CI, build).

Un correctif ou une fonctionnalité qui suit un motif existant n'en a pas besoin.

## Comment

1. Copier [`0000-modele.md`](0000-modele.md) vers `NNNN-titre-en-kebab.md` en prenant le numéro libre suivant.
2. L'ADR arrive dans la même PR que le code qu'il justifie, avec le statut « Proposé ».
3. Il passe à « Accepté » à la fusion de la PR.

## Index

| N°                                                 | Décision                                                          | Statut  |
| -------------------------------------------------- | ----------------------------------------------------------------- | ------- |
| [0001](0001-consigner-les-decisions.md)            | Consigner les décisions dans des ADR                              | Accepté |
| [0002](0002-rendu-3d-a-la-demande.md)              | Scène 3D en React Three Fiber, rendue à la demande                | Accepté |
| [0003](0003-backends-webgl-webgpu.md)              | Backends WebGL et WebGPU interchangeables, chargés à la demande   | Accepté |
| [0004](0004-scenematerials-proprietaire-unique.md) | `SceneMaterials`, seul propriétaire des matériaux du modèle       | Accepté |
| [0005](0005-qualite-adaptative-en-mouvement.md)    | Qualité réduite pendant le mouvement, ombres figées               | Accepté |
| [0006](0006-home-assistant-simule.md)              | Home Assistant simulé pour le développement, la démo et les tests | Accepté |
| [0007](0007-une-config-par-maison.md)              | Une configuration par maison, la maison privée en sous-module     | Accepté |
| [0008](0008-specs-et-definition-de-termine.md)     | Spec, ADR, doc et tests dans chaque PR de fonctionnalité          | Accepté |
| [0009](0009-budget-performance-tablette.md)        | Budget de performance de la tablette                              | Proposé |
