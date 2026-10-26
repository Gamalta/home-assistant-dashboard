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

Les fichiers sont numérotés dans l'ordre des décisions : la liste du dossier fait office d'index, ce qui évite qu'un tableau central ne crée des conflits entre les PR. Le statut figure en tête de chaque ADR.
