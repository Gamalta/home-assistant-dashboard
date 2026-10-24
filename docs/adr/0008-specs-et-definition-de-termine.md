# 0008 — Spec, ADR, doc et tests dans chaque PR de fonctionnalité

- Statut : Accepté
- Date : 2026-10-24

## Contexte

Le projet n'a ni tests ni documentation. Les fonctionnalités arrivent dans des branches indépendantes, et toutes ne seront pas forcément fusionnées. Chaque PR doit donc pouvoir être comprise, vérifiée et refusée seule.

## Décision

Chaque PR de fonctionnalité contient :

- une **spec** (`docs/specs/<sujet>.md`) : problème, comportement attendu sous forme de scénarios, critères d'acceptation ;
- un **ADR** par décision structurante ;
- la **documentation** utilisateur ou développeur concernée ;
- des **tests unitaires** pour la logique et des **tests E2E** pour chaque scénario visible de la spec.

La PR est liée à son issue. La [définition de « terminé »](../conventions.md#définition-de-terminé) en est la liste de contrôle.

## Conséquences

- Une PR se relit sans contexte oral.
- Une petite fonctionnalité coûte une spec courte en plus. Un correctif sans comportement nouveau peut s'en passer.
- Les scénarios de la spec et les tests E2E doivent rester alignés.

## Alternatives considérées

- **Documentation à la fin** : en pratique, elle n'est jamais écrite.
- **Specs dans les issues seulement** : elles ne sont pas versionnées avec le code qu'elles décrivent.
