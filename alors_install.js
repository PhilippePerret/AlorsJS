'use strict';
/**
 * Ce module fait partie de Alors.js (bibliothèque de tests en pur
 * javascript) et ne sert qu'à lancer l'installation de tout le
 * module Alors.js
 */
window.alors_install = function(){
  const dslTag = DCreate('SCRIPT', {
      id:   "script-alors-dsl-js"
    , in:   document.body
    , type: "text/javascript"
    , src:  "/assets/js/alors_dsl.js"
    , onerror: function(ev){Flash.error("Impossible de charger la librairie Alors::DSL…")}
    , onload:  function(ev){AlorsDSL.prepare()}
  })
  const aTag = DCreate('SCRIPT', {
      id:   "script-alors-js"
    , in:   document.body
    , type: "text/javascript"
    , src:  "/assets/js/alors.js"
    , onerror: function(ev){
        Flash.error("Une erreur est survenue. Consulter la console.")
        console.error("Erreur au chargement de Alors.js…", ev)
      }
    , onload: function(ev){
        // console.log("OK, Alors.js est chargé")
        /**
         * Dès que cette balise est chargée, on peut lancer les tests,
         * soit pour une poursuite (quand elle se produit après recharge-
         * ment de la page) soit pour commencer.
         */
        ATest.prepare()
      }
  })
}

window.alors_uninstall = function(){
  [
      "script-alors-js"
    , "script-alors-test-page-courante"
    , "script-alors-dsl-js"
  ].forEach(id => {
    var o ;
    if ( o = document.querySelector(`#${id}`) ) o.remove()
  })
}