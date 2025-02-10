# Réflexions sur le fonctionnement


## Synopsis général

Pour le moment, voilà comment se déroulent les tests quand ils sont lancés :

* une page est chargée et charge ses tests (si elle en a, mais toutes les pages devraient en avoir)
* avant de les jouer, elle procède aux vérifications qui sont peut-être demandées par la page appelante
* ensuite, elle lance ses tests (plus tard, ce sera fait seulement si c'est la première fois qu'on arrive sur cette page => mémoriser les pages)
* ces tests sont joués, mais au premier test qui fait appel à une autre page, on interrompt les tests pour passer à l'autre page et poursuivre.

Ce fonctionnement fait que :

* sauf à imaginer qu'une page n'ait qu'un seul appel à une autre page à vérifier, les tests ne seront jamais fait complètement

Ça n'est pas possible, il faut :

* jouer tous les tests en mettant de côté les tests appelant une autre page (comment les reconnaitre ? — mais ils sont reconnaissables, forcément)

Pour conserver l'état de la page, il serait nécessaire d'appeler l'autre page dans un autre onglet. Mais dans ce cas, on perd l'accès au sessionStorage en cours… Et rien ne garantit qu'ouvrir la page dans un autre onglet laisse le même état et garantit l'état de l'autre page.

On pourrait penser les choses autrement : les tests d'intégration sont censés tester des utilisations réelles de l'application. On pourrait inventer ici le "concept de réalité". Typiquement, quand un utilisateur crée une donnée, il n'essaie pas toutes les valeurs (même si un cas comme celui-ci est envisageable, à partir du moment où il ne change pas tout). Et à partir du moment où on applique le "concept de réalité", on ne doit pas pouvoir créer un test qui conduit à une boucle sans fin ou à des incongruités…

D'après ce principe de réalité, il y deux choses : 

* les tests de page "universels", c'est-à-dire les choses qu'on doit toujours trouver dans une page, quelle que soit les façons de l'aborder. Par exemple un titre qui ne changerait pas. Ces tests-là seraient des tests "in-place", c'est-à-dire qu'il ne renverraient jamais sur une autre page (comprendre que les boutons de navigation du site ne doivent pas, dans ces tests universels, être testés en cliquant dessus ; ce test doit faire l'objet d'un vrai test d'intégration user ; dans le test universel, on ne test que la présence du bouton et la validité de ses attributs)

* les tests d'intégration qu'on pourrait appeler "tests de cas" (case test) ou plutôt "tests d'action" (une action est par exemple (s'inscrire sur le site) qui correspondraient à un test précis d'un "geste" d'utilisateur, par exemple, pour commencer son inscription. Ça ressemble fortement à du BDD (Behaviour Driven Developpemnt). L'inscription est un exemple de parcours qu'il faudrait flécher :
US = User Story
  - arrivée sur l'accueil
  - clic sur le bouton "s'inscrire"
  - on rejoint la page d'inscription
  - remplissage du formulaire
  - clic pour soumettre le formulaire (après test direct de la validité des informations)
  - on rejoint la page qui confirme l'inscription

Dans ces conditions, les "test"s seraient donc des entités assez complexes, mais qu'on pourrait définir par plus petites entités afin de pouvoir les réutiliser.
Par exemple, dans le test précédant, on pourrait reprendre des éléments pour faire le test d'une réinscription d'un membre déjà inscrit.
Les 5 premières étapes seraient identiques.
Pourrait-on les appeler des "step"s ? Un tests d'intégration ce cas 
