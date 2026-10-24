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

### Scénario : la modale illustre l'avancement

- **Étant donné** la carte
- **Quand** l'utilisateur la touche
- **Alors** la modale montre une maison qui se remplit, à l'ouverture, jusqu'à la part du capital remboursée, avec ce pourcentage en grand dessous
- **Et** une colonne donne en grand le capital restant dû sur le montant emprunté, la mensualité (et l'assurance si elle est configurée), le mois de la dernière échéance avec les échéances payées sur le total, les intérêts payés et les intérêts restants

### Scénario : l'historique trace le capital restant dû

- **Étant donné** la modale ouverte
- **Quand** l'utilisateur touche « Historique »
- **Alors** le graphique commun ([spec des graphiques](graphiques.md)) trace le capital restant dû au début de chaque année du prêt : en aire jusqu'au dernier anniversaire, puis en pointillés pour la projection jusqu'à la fin, sous le capital restant dû en grand
- **Et** l'infobulle donne l'année et le montant sous le doigt, et le bouton « Avancement » ramène à la maison

### Scénario : l'avancement suit le calendrier

- **Étant donné** la date de la première échéance
- **Quand** le jour de prélèvement d'un mois est atteint
- **Alors** l'échéance de ce mois est comptée comme payée, jusqu'à la dernière

## Critères d'acceptation

- [x] Mensualité, capital restant et intérêts conformes à un tableau d'amortissement à échéances constantes, taux nul compris (`utils/mortgage.test.ts`).
- [x] La maison se remplit à hauteur de la part remboursée, et n'affiche 100 % qu'une fois tout remboursé (`MortgageModal/MortgageHouse.test.tsx`).
- [x] Plusieurs prêts possibles : une carte par prêt, avec `label`.
- [x] E2E `e2e/credit.spec.ts` sur la démo, avec un prêt fictif.

## Impacts

- Config : type de carte `mortgage` dans `SideBarConfigType.shortcuts`.
- Confidentialité : les montants réels restent dans la config privée de la maison.
