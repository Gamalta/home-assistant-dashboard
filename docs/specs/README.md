# Spécifications

Une spec décrit **ce que** fait une fonctionnalité, vu de l'utilisateur, avant de décrire comment elle est construite. Elle accompagne la PR qui la livre ([ADR 0008](../adr/0008-specs-et-definition-de-termine.md)).

- Nom du fichier : `docs/specs/<sujet-en-kebab>.md`, le même sujet que la branche.
- Point de départ : [`_modele.md`](_modele.md).
- Chaque scénario de la section « Comportement attendu » correspond à au moins un test, E2E s'il passe par la scène 3D, le rendu, la mise en page, une animation ou un vrai pointeur, unitaire sinon ([ADR 0040](../adr/0040-tests-plus-rapides.md)). Le nom du test reprend celui du scénario.
- Une spec ne décrit pas le code : les choix techniques vont dans un ADR.
