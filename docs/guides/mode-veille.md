# Mode veille

Sur la tablette murale, ouvrir le dock en bas de la barre latérale, puis **Système**, et choisir un délai dans **Veille** : « Jamais » (par défaut), 1, 5, 10 ou 30 minutes.

Après ce délai sans interaction, l'écran de veille affiche :

- l'heure et la date ;
- la météo de la barre latérale : température, minimale et maximale du jour, quatre jours suivants ;
- une carte par trajet de train configuré dans les raccourcis ([guide des raccourcis](raccourcis.md)), avec la rame de la modale des trains et ses trois prochains départs ;
- les alertes de la maison ([guide des alertes](alertes.md)), seulement s'il y en a.

Le fond est un ciel qui suit le jour, d'après `sun.sun` ou, à défaut, l'heure. La nuit, le ciel est sombre et le contenu atténué, pour ne pas éclairer la pièce. Rien n'est à configurer en plus : l'écran de veille reprend la config de la barre latérale.

Un appui n'importe où réveille la tablette, sans actionner le bouton qui se trouve dessous.

Le réglage est propre à l'appareil : il n'a pas d'effet sur les autres écrans qui ouvrent le dashboard. Sur téléphone, la disposition mobile ne propose pas ce réglage et n'affiche pas d'écran de veille. Le rétroéclairage et le maintien de l'écran allumé restent gérés par l'application kiosque de la tablette ([ADR 0026](../adr/0026-veille-par-appareil.md)).
