# 0043 — Tableau d'amortissement, une ligne par mois

- Statut : Proposé
- Date : 2026-10-27
- Issue : #20

## Contexte

L'[ADR 0022](0022-echeancier-lu-dans-home-assistant.md) lit l'échéancier de chaque prêt dans Home Assistant, en trois attributs `principal`, `interest` et `insurance` qui associent chacun un mois à un montant. Le propriétaire saisit ses tableaux d'amortissement à la main, depuis ceux de la banque : une ligne par échéance, avec ses colonnes capital, intérêts et assurance. Répartir chaque ligne entre trois attributs éloigne le template du tableau qu'il recopie.

## Décision

Chaque prêt reste une entité Home Assistant listée dans `sideBar.mortgages`, nommée par son `friendly_name`, dont l'état n'est pas lu. Son attribut `amortization` associe chaque mois `AAAA-MM` à sa ligne du tableau : `[capital, intérêts, assurance]`, l'assurance étant facultative.

Le reste de l'ADR 0022 tient toujours : le dashboard ne calcule pas d'amortissement, `src/utils/mortgage.ts` additionne les montants à la date du jour, et l'échéance d'un mois compte dès le 1er.

## Conséquences

- Une ligne du tableau de la banque devient une ligne du template, avec les colonnes dans le même ordre.
- Sur 25 ans, l'attribut pèse environ 9 Ko : il reste sous les 16 Ko que l'enregistreur de Home Assistant accepte, et l'entité n'a plus à en être exclue.
- Les colonnes se repèrent à leur position : un capital et des intérêts inversés passent inaperçus.
- Une ligne réduite à un montant, comme dans l'ancien attribut `monthly`, est ignorée.
- Le mock (`src/mock/mocks/createLoan.ts`) produit ce format pour la démo et les tests.

## Alternatives considérées

- **Trois attributs `principal`, `interest` et `insurance`** ([ADR 0022](0022-echeancier-lu-dans-home-assistant.md)) : chaque échéance se saisit à trois endroits du template, et l'ensemble pèse environ 15 Ko sur 25 ans, au bord de la limite de l'enregistreur.
- **Une ligne avec des clés nommées** (`{principal, interest, insurance}`) : plus explicite, mais environ 20 Ko sur 25 ans, au-delà de la limite.
- **Un attribut `monthly` avec le total seulement** : il ne sépare pas les intérêts et l'assurance, que montrent les graphiques.
