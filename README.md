# AlorsJS

Librairie intuitive pour tests d'intégration vivants d'une application web (ou locale).

Exemple : 

~~~
quand(onClic("Liste des élèves"))
.alors(onVoit("<h1>Liste des élèves</h1>"))
~~~

Dans ce test, on a simuler un clic de souris sur un lien dans le texte, lien qui nous a fait rejoindre une page dont le titre est donné.

## AlorsJS

* … ne nécessite aucune installation,
* … ne fait appel à aucun
* … se joue directement dans la console du navigateur
* … teste tout ou seulement les pages qu'on visite

## Installation

* Ajouter le code suivant au `<head>` de votre page HTML.

  ~~~
  <script defer src="https://www.atelier-icare.net/js-libraries/alors/alors_install.js"></script>
  ~~~

* avec l'application chargée, jouer `Alors.install()` dans la console de votre navigateur,
* la librairie est chargée et les tests sont lancés !

