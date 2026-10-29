# Suivi du crédit immobilier

- Issue : #20
- Statut : Livrée

## Problème

Savoir où en est le crédit de la maison (capital restant, intérêts déjà payés, date de fin), souvent fait de plusieurs prêts (prêt principal, PTZ, Action Logement, travaux), demande d'ouvrir l'espace client de la banque ou un tableau d'amortissement en PDF. Ces tableaux sont déjà dans Home Assistant, en capteurs template.

## Objectif

Une seule entrée « Crédit » dans le menu rapide, qui ouvre une modale réunissant tous les prêts à la date du jour : un récapitulatif, l'avancement de chaque prêt, et la part des intérêts et de l'assurance. Le propriétaire ne veut pas de carte dans le carrousel.

## Hors périmètre

- Calcul de l'échéancier : Home Assistant le fournit, prêt par prêt ([ADR 0043](../adr/0043-tableau-d-amortissement-une-ligne-par-mois.md)).
- Synchronisation avec la banque : le tableau d'amortissement se met à jour dans Home Assistant.
- Jour de prélèvement : l'échéance d'un mois compte dès le 1er.

## Comportement attendu

### Scénario : le récapitulatif réunit tous les prêts

- **Étant donné** une ou plusieurs entités de prêt, avec leur tableau d'amortissement en attribut
- **Quand** l'utilisateur ouvre le menu rapide et touche « Crédit », sa seule entrée pour tous les prêts
- **Alors** le menu se referme et la modale grandit depuis le bouton rond du menu, où elle se résorbe à la fermeture
- **Et** la modale montre une maison qui se remplit, à l'ouverture, jusqu'à la part du capital remboursée, tous prêts confondus, avec ce pourcentage en grand dessous
- **Et** une colonne donne en grand le capital restant dû sur le total emprunté, la mensualité du mois (et son assurance), le mois de la dernière échéance avec les échéances payées sur le total, les intérêts payés et les intérêts restants

### Scénario : l'historique montre l'avancement de chaque prêt

- **Étant donné** la modale ouverte
- **Quand** l'utilisateur touche « Historique »
- **Alors** un premier graphique empile le capital restant dû de chaque prêt, de la première échéance au 1er janvier qui suit la dernière, sous le capital restant dû en grand
- **Et** sa légende donne, pour chaque prêt, son nom (`friendly_name`), sa couleur et sa part remboursée

### Scénario : l'historique montre la part des intérêts et de l'assurance

- **Étant donné** l'historique affiché
- **Quand** l'utilisateur regarde le second graphique
- **Alors** des barres empilées donnent, par année civile et tous prêts confondus, le capital remboursé, les intérêts et l'assurance
- **Et** le coût du crédit s'affiche en grand, avec la part des intérêts et celle de l'assurance sur toute la durée
- **Et** l'infobulle donne l'année et les trois montants sous le doigt, et le bouton « Avancement » ramène à la maison

### Scénario : l'avancement suit le calendrier

- **Étant donné** l'échéancier d'un prêt, mois par mois
- **Quand** un mois commence
- **Alors** son échéance est comptée comme payée, jusqu'à la dernière

## Critères d'acceptation

- [x] L'échéancier se lit dans l'attribut `amortization`, une ligne `[capital, intérêts, assurance]` par mois, trié par mois ; une entité sans `amortization` n'a pas d'échéance, et une ligne à un seul montant est ignorée (`utils/mortgage.test.ts`).
- [x] La maison se remplit à hauteur de la part remboursée, et n'affiche 100 % qu'une fois tout remboursé (`MortgageModal/MortgageHouse.test.tsx`).
- [x] Plusieurs prêts : une seule entrée du menu, des totaux sur tous les prêts, plus de mensualité après la dernière échéance, et le capital de chaque prêt et le coût de chaque année justes (`utils/mortgage.test.ts`).
- [x] Utiliser la modale ne rouvre pas le menu rapide.
- [x] E2E `e2e/mortgage.spec.ts` sur la démo, avec 4 entités de prêt fictives (`mock/mocks/createLoan.ts`).

## Impacts

- Config : liste `mortgages` d'entités `sensor` dans `SideBarConfigType`. L'entrée « Crédit » s'ajoute après les scénarios.
- Home Assistant : un capteur template par prêt, avec son tableau d'amortissement dans l'attribut `amortization` ([guide](../guides/raccourcis.md#crédit-immobilier)).
- Confidentialité : les montants réels restent dans Home Assistant ; le dépôt ne contient que des identifiants d'entités.
