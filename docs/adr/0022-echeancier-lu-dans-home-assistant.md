# 0022 — Échéancier du crédit lu dans Home Assistant

- Statut : Remplacé par [0043](0043-tableau-d-amortissement-une-ligne-par-mois.md)
- Date : 2026-10-24, révisé le 2026-10-26
- Issue : #20

## Contexte

Le crédit du propriétaire compte plusieurs prêts. Il a déjà leurs tableaux d'amortissement dans Home Assistant, en capteurs template, mois par mois. Calculer les échéances à partir du montant, du taux et de la durée (première version de cette PR) ne retombe pas sur ces tableaux : première échéance au prorata, différé d'un PTZ, remboursement anticipé, arrondis de la banque.

## Décision

Chaque prêt est une entité Home Assistant, listée dans `sideBar.mortgages`. Ses attributs `principal`, `interest` et `insurance` associent chacun un mois `AAAA-MM` à la part de l'échéance de ce mois. Son `friendly_name` le nomme dans la légende, et son état n'est pas lu.

Le dashboard ne calcule plus d'amortissement : les fonctions pures de `src/utils/mortgage.ts` additionnent ces montants à la date du jour (capital restant dû, intérêts payés, échéances), par année (graphiques) et sur l'ensemble des prêts. L'échéance d'un mois compte dès le 1er du mois.

## Conséquences

- Les montants sont ceux de la banque, au centime, quel que soit le prêt (différé, taux variable, remboursement anticipé).
- Les montants réels restent dans Home Assistant, jamais dans le dépôt public. La config de la maison ne liste que des identifiants d'entités.
- Le tableau d'amortissement se maintient dans Home Assistant : après un remboursement anticipé, c'est le template qui change.
- Un échéancier de 25 ans dépasse les 16 Ko d'attributs que l'enregistreur de Home Assistant accepte : il l'ignore avec un avertissement. Le dashboard ne lit que l'état courant, et l'entité peut être exclue de l'enregistreur.
- Le jour de prélèvement n'est pas connu : en début de mois, l'échéance compte quelques jours avant d'être prélevée.
- Le mock simule ces entités (`src/mock/mocks/createLoan.ts`) avec la formule des échéances constantes, pour la démo et les tests.

## Alternatives considérées

- **Calcul par le dashboard à partir de 5 paramètres** (première version) : faux dès que l'échéancier réel s'écarte de la formule, et en double avec les tableaux déjà présents dans Home Assistant.
- **Un attribut par mois avec le total seulement** (`monthly`, le format actuel du propriétaire) : impossible d'isoler les intérêts et l'assurance, que montrent les graphiques.
- **Une entité par mesure** (capital restant dû, mensualité, intérêts payés…) : pas d'échéancier, donc ni courbe sur toute la durée ni coût par année.
