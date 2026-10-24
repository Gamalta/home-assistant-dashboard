# 0022 — Crédit immobilier calculé par le dashboard

- Statut : Proposé
- Date : 2026-10-24
- Issue : #20

## Contexte

Home Assistant n'expose aucune entité pour un crédit immobilier. Il faudrait des capteurs template ou une intégration bancaire, que le propriétaire n'a pas. Un prêt à taux fixe et à échéances constantes se calcule entièrement à partir de cinq paramètres : montant, taux, durée, date de la première échéance et assurance.

## Décision

La tuile `mortgage` porte ces paramètres dans sa config. Les fonctions pures de `src/utils/mortgage.ts` calculent la mensualité, le capital restant dû, les intérêts et le calendrier à la date du jour.

## Conséquences

- Aucune entité Home Assistant à créer, et aucun appel réseau.
- Les montants réels sont dans la config de la maison, donc dans le sous-module privé ([ADR 0007](0007-une-config-par-maison.md)), jamais dans le dépôt public.
- Un remboursement anticipé ou une renégociation rend le calcul faux, jusqu'à ce que la config soit mise à jour (nouveau capital et nouvelle date de départ).
- Le calcul suit la formule de l'échéance constante ; l'échéancier de la banque peut différer de quelques centimes à cause des arrondis.

## Alternatives considérées

- **Capteurs template dans Home Assistant** : la même formule, écrite en Jinja et plus difficile à tester, pour un résultat que seul le dashboard affiche.
- **Importer le tableau d'amortissement de la banque** : exact au centime, mais il faut un fichier à maintenir et à garder privé.
