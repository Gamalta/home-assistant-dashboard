# Suivi du crédit immobilier

- Issue : #20
- Statut : Livrée

## Problème

Savoir où en est le crédit de la maison (capital restant, intérêts déjà payés, date de fin) demande d'ouvrir l'espace client de la banque ou un tableau d'amortissement en PDF.

## Objectif

Une carte du carrousel qui montre d'un coup d'œil le capital restant dû et la part remboursée, et une modale qui détaille le prêt à la date du jour.

## Hors périmètre

- Remboursement anticipé, modulation des échéances, taux variable : le calcul suppose un prêt à taux fixe et à échéances constantes.
- Synchronisation avec la banque : les paramètres du prêt viennent de la config.

## Comportement attendu

### Scénario : la carte donne le capital restant et l'avancement

- **Étant donné** un prêt configuré
- **Quand** la barre latérale s'affiche
- **Alors** la carte « Crédit » (ou le libellé configuré) affiche en grand le capital restant dû, avec une barre et le pourcentage du capital déjà remboursé

### Scénario : la modale détaille le prêt

- **Étant donné** la carte
- **Quand** l'utilisateur la touche
- **Alors** la modale affiche le capital restant dû sur le montant emprunté, une barre d'avancement, la courbe du capital restant année par année, la mensualité (et l'assurance si elle est configurée), les échéances payées sur le total, les intérêts payés et restants, et le mois de la dernière échéance

### Scénario : l'avancement suit le calendrier

- **Étant donné** la date de la première échéance
- **Quand** le jour de prélèvement d'un mois est atteint
- **Alors** l'échéance de ce mois est comptée comme payée, jusqu'à la dernière

## Critères d'acceptation

- [x] Mensualité, capital restant et intérêts conformes à un tableau d'amortissement à échéances constantes, taux nul compris (`utils/mortgage.test.ts`).
- [x] Plusieurs prêts possibles : une carte par prêt, avec `label`.
- [x] E2E `e2e/credit.spec.ts` sur la démo, avec un prêt fictif.

## Impacts

- Config : type de carte `mortgage` dans `SideBarConfigType.shortcuts`.
- Confidentialité : les montants réels restent dans la config privée de la maison.
