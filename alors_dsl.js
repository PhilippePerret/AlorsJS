'user strict';
/*
    Alors:DSL

    Ce sont toutes les méthodes qui vont permettre de jouer des tests
    d'intégration.

SYNOPSIS
  On essaie de décrire ci-dessous la démarche pour bien avoir en
  tête la démarche du test.

  Empreinte de base :

    quand(...).alors(...)

  On écrit :                Ça invoque :

      quand(...)                ContextAction.define(...)

  L'argument de quand/1 est une action ou un context
  Je crois que c'est toujours une action qui crée un
  context particulier.

      onrejoint(...)              Action.goto(url, options)
      onclique(...)               Action.clic(target, options)

  Ce contexte (pas encore évalué, normalement) est envoyé en
  premier argument de quand(...)

  On appelle alors la méthode 'alors' de quand(...). Cette méthode
  alors est une assertion.

      alors(...)                    new Assertion().alors

  À cette instance, à l'instanciation, est envoyé l'accumulateur
  défini dans quand(...), avec donc tout ce qu'il faut faire (c'est
  à dire l'action créant le contexte)
  Et donc la méthode 'alors' de l'assertion est appelée, avec 
  ce que l'on espère trouver comme résultat. La plupart du temps,
  ce sont des éléments DOM avec des propriétés particulières et
  contenu et d'apparence, mais ça peut être aussi tout ce qu'on veut
  d'autre, même des choses que seul le serveur peut fournir.

  Donc alors(...) (Assertion.alors(...)) est la méthode ultime qui
  va jouer l'action pour produire le résultat est contrôler que les
  attentes sont remplies. Ça tombe bien avec le fait que cette
  librairie s'appelle "Alors.js"…

RÉFLEXIONS
----------
1) À quoi doit ressembler la syntaxe et 2) de quoi avons-nous besoin ?

quand… etque… alors…

Avec  +quand+   qui définit un contexte mais aussi une action
      +etque+   définit plutôt une action, mais aussi un contexte
      +alors+   définit le résultat attendu. Ce résultat peut être
                visible sur la page ou faire appel au serveur pour
                vérifier quelque chose.

Exemple  quand(<on est sur la page d'accueil>)
          etque(<on clique sur "Liste des proto-exo")
          alors(<on rejoint une page ayant pour titre "Liste des proto-exos")

Exemple concret
  quand(onvasur("/"))
  .etque(onclique("Liste des proto-exos"))
  .alors(onvoit("<h2>Liste des proto-exos"))

2) Les interactions possibles :
  - touche de clavier, avec ou sans combinaison
  - clic de souris sur un élément quelconque
  - déplacement de souris pressée
  - simulation de déplacement d'objet (un div)
  - simulation de drag&drop de fichier
 
  Quelles sont les implications d'une telle expression ? Où se retrouvent 
  les assertions et les actions dans un tel protocole ?
  Si on regarde l'EXPRESSION :

    quand(onfaitca(...)).alors(onvoit(ceci(...)))

    dans l'ordre des évaluations :
  
      - onfaitca(...)
      - |-> argument de quand(...)
        Ce qui signifie que le résultat de onfaitca() est envoyé à
        quand.
      - on joue ensuite la méthode 'ceci(...)'
        son résultat est envoyé à onvoit(...)
        et le résultat de onvoit est envoyé à 'alors(...)' qui
        semble le point final de l'expression.

    quand(...).alors est une Assertion. C'est là que convergent les
    attentes concernant l'affirmation.
        
 */
class AlorsDSL {
  static prepare(){
    console.info("Librairie Alors::DSL préparée")
  }
}

class TestedSelector {
  constructor(selecteur){
    this.selector = selecteur
    this.data = {
        exist:    true
      , with:     null
      , visible:  true
    }
  }
  addData(data){Object.assign(this.data, data)}
  get obj(){return DGet(this.selector)}
}
class SelectorState {
  constructor(tselector) {
    this.tested_selector = tselector
  }
  get obj(){return this.tested_selector.obj}
  get isVisible() { return Dom.isVisible(this.obj) }
}

class Assertion { // alors
  constructor(accumulator){
    this.accumulator = accumulator
  }
  /**
   * Fonction principale du DSL qui produit les actions, évalue le 
   * résultat et le compare aux attentes.
   * 
   * Les actions sont définies dans this.accumulator
   * Les attentes sont définies dans +assertions+
   * 
   * Bien sûr, si l'action consiste à charger une autre page, on
   * doit mettre l'expectation dans la session (session Storage) et
   * l'évaluer après le rechargement de la page.
   * 
   * @param assertions  Les résultats des affirmations comme 
   *    onvoit, etc.
   */
  alors(assertions){
    console.log("Alors…", assertions, this.accumulator)
  }
}

class ContextAction { // Quand
  constructor(accu){
    this.accumulateur = accu || []
  }
  define(accu){
    // console.log("Contexte ou action", accu)
    this.accumulateur.push(accu)
    return {
        alors: (function(accumulateur){
          const assert = new Assertion(accumulateur)
          return assert.alors.bind(assert)
        })(this.accumulateur)
      , etque: (new ContextAction(this.accumulateur).define)
    }
  }
}

class Action {
  goto(url, options){ // = onrejoint
    options = options || {}
    console.log("On doit rejoindre l'url '%s'", url)
    return {action: 'goto', param: url, options: options}
  }
}


class OnVoit {
  /**
   * Définit ce qu'on doit trouver dans la page. Ces différents 
   * formats de définition sont acceptés :
   *    1 argument  : string définissant un sélecteur
   *                : array définissant une liste de sélecteur
   *                : array définissant une liste d'objets définissant
   *                  les sélecteurs avec des choses comme :
   *                  {selector: "div#div", visible: false, exist: false}
   *                  {selector: "div", with: <liste de sous éléments>}
   *    x arguments : un nombre non défini d'arguments
   */
  element(selecteur){
    console.log("arguments", arguments)
    const all_arguments = []
    const elements = []
    // Faire la liste des éléments à trouver
    if ( arguments.length == 1 ) {
      all_arguments.push(selecteur)
    } else {
      all_arguments.push(...arguments)
    }

    all_arguments.forEach( selSpecs => {
      if ( 'string' == typeof selSpecs ) { 
        elements.push(this.elementAsString(selSpecs))
      } else if ( selSpecs.length ) {
        elements.push(...this.elementAsArray(selSpecs))
      } else if ( 'object' == typeof selSpecs ) {
        elements.push(this.elementAsObject(selSpecs))
      }
    })
    console.log("Éléments à trouver sur la page", elements)
    return {element_a_trouver: selecteur}
    // return new TestedSelector(selecteur)
  }
  elementAsArray(list){
    list.map( sel => {return new TestedSelector(sel)})
  }
  elementAsString(sel){
    return new TestedSelector(sel)
  }
  elementAsObject(osel){
    const tsel  = new TestedSelector(osel.selector)
    tsel.addData(osel)
    return tsel
  }
}




class Clic {
  constructor(){

  }
  activate(target, targetSpecs){
    // Si +target+ est un string, ça peut être un sélecteur
    console.log("'string' == typeof target", 'string' == typeof target)
    console.log("document.querySelector(target)", document.querySelector(target))
    if ( 'string' == typeof target && document.querySelector(target)) {
      target = document.querySelector(target)
    }
    // Quand +target+ est un string, il faut le chercher dans la page
    console.log("Clic sur target", target, typeof target)
    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
  }
}

class Page {
  /**
   * Cette fonction retourne true si la route de la page courante
   * est bien +route+
   * Par défaut, c'est la propriété +pathname+ de window.location qui
   * est testé, mais on peut aussi utilisé une autre propriété en
   * second argument.
   * Par exemple 
   *    Page.check("https://www.google.com", "host")
   *    surpage(...)
   */
  static check(route, property = "pathname"){
    // console.log("window.location", window.location)
    return window.location[property] == route
  }
}



window.AlorsDSL = AlorsDSL
// Point(s) d'entrée du test
window.quand = (function(){
  const instance = new ContextAction(null)
  return instance.define.bind(instance)
})()
window.onrejoint = (function(){
  const instance = new Action()
  return instance.goto.bind(instance)
})()
window.onvoit = (function(){
  const instance = new OnVoit()
  return instance.element.bind(instance)
})()
window.onclique = (function(){
  const instance = new Clic()
  return instance.activate.bind(instance)
})()
window.surlapage = Page.check.bind(Page)
