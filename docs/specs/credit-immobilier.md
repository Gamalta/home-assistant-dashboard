# Suivi du crédit immobilier

- Issue : #20
- Statut : Livrée

## Problème

Savoir où en est le crédit de la maison (capital restant, intérêts déjà payés, date de fin), souvent fait de plusieurs prêts (prêt principal, PTZ, Action Logement, travaux), demande d'ouvrir l'espace client de la banque ou un tableau d'amortissement en PDF.

## Objectif

Une seule entrée « Crédit » dans le menu rapide, qui ouvre une modale réunissant tous les prêts à la date du jour : un récapitulatif, l'avancement de chaque prêt, et la part des intérêts et de l'assurance. Le propriétaire ne veut pas de carte dans le carrousel.

## Hors périmètre

- Remboursement anticipé, modulation des échéances, taux variable : le calcul suppose un prêt à taux fixe et à échéances constantes.
- Synchronisation avec la banque : les paramètres du prêt viennent de la config.

## Comportement attendu

### Scénario : le récapitulatif réunit tous les prêts

- **Étant donné** un ou plusieurs prêts configurés
- **Quand** l'utilisateur ouvre le menu rapide et touche « Crédit », sa seule entrée pour tous les prêts
- **Alors** le menu se referme et la modale grandit depuis le bouton rond du menu, où elle se résorbe à la fermeture
- **Et** la modale montre une maison qui se remplit, à l'ouverture, jusqu'à la part du capital remboursée, tous prêts confondus, avec ce pourcentage en grand dessous
- **Et** une colonne donne en grand le capital restant dû sur le total emprunté, la mensualité des prêts en cours (et leur assurance), le mois de la dernière échéance avec les années restantes, les intérêts payés et les intérêts restants

### Scénario : l'historique montre l'avancement de chaque prêt

- **Étant donné** la modale ouverte
- **Quand** l'utilisateur touche « Historique »
- **Alors** un premier graphique empile le capital restant dû de chaque prêt, de la première échéance au 1er janvier qui suit la dernière, sous le capital restant dû en grand
- **Et** sa légende donne, pour chaque prêt, son nom, sa couleur et sa part remboursée

### Scénario : l'historique montre la part des intérêts et de l'assurance

- **Étant donné** l'historique affiché
- **Quand** l'utilisateur regarde le second graphique
- **Alors** des barres empilées donnent, par année civile et tous prêts confondus, le capital remboursé, les intérêts et l'assurance
- **Et** le coût du crédit s'affiche en grand, avec la part des intérêts et celle de l'assurance sur toute la durée
- **Et** l'infobulle donne l'année et les trois montants sous le doigt, et le bouton « Avancement » ramène à la maison

### Scénario : l'avancement suit le calendrier

- **Étant donné** la date de la première échéance
- **Quand** le jour de prélèvement d'un mois est atteint
- **Alors** l'échéance de ce mois est comptée comme payée, jusqu'à la dernière

## Critères d'acceptation

- [x] Mensualité, capital restant et intérêts conformes à un tableau d'amortissement à échéances constantes, taux nul compris (`utils/mortgage.test.ts`).
- [x] La maison se remplit à hauteur de la part remboursée, et n'affiche 100 % qu'une fois tout remboursé (`MortgageModal/MortgageHouse.test.tsx`).
- [x] Plusieurs prêts : une seule entrée du menu, des totaux pondérés par le capital emprunté, et la mensualité d'un prêt terminé n'est plus comptée (`utils/mortgage.test.ts`).
- [x] Utiliser la modale ne rouvre pas le menu rapide.
- [x] E2E `e2e/mortgage.spec.ts` sur la démo, avec 4 prêts fictifs.

## Impacts

- Config : liste `mortgages` dans `SideBarConfigType`, chaque prêt avec un `label`. L'entrée « Crédit » s'ajoute après les scénarios.
- Confidentialité : les montants réels restent dans la config privée de la maison.
