window.Alors = (function(){
  'use scrict';

  const LIB_URL = 'https://www.atelier-icare.net/js-libraries/alors/';
  const WANTED_SCRIPTS = ['alors', 'alors_dsl'];

  class Alors {
    /**
     * Appelée après le chargement des scripts pour préparer et lancer les tests
     * 
     * @protected
     */
    static prepareAndRun(){
      console.info("Je dois apprendre à préparer et lancer les scripts.")
    }

    /**
     * Installation de Alors
     * 
     * @param {Boolean} local Si true, on charge la librairie locale
     *    @default false
     * 
     * @return {Boolean} true en cas de succès.
     * 
     * @public
     */
    static install(local = false) {
      console.info("-> install (Alors)")
      try {
        this.loadScriptsWithTags(local)
      } catch(erreur){
        console.log("Une erreur est survenue au cours du chargement de la librairie Alors.js… ", erreur)
      }
      console.info("<- install (Alors)")
    }

    /**
     * Désinstalle la librairie Alors.js
     * 
     * @public
     */
    static uninstall(){
      console.info("-> uninstall")
      Array.from(document.querySelectorAll('script.alors-library'))
      .forEach(scriptTag => scriptTag.remove())
      console.info("<- uninstall")
    }

    /**
     * Permet de charger localement les fichiers de la librairie Alors.
     * 
     * @return void
     * 
     * @public
     */
    static download(){
      console.log("Je dois apprendre à downloader les fichiers de Alors.js")
    }

    /**
     * Chargement des scripts de la librairie dans des balises <script>
     * 
     * @param {Boolean} local True si le chargement se fait localement, i.e. à partir de fichier locaux
     * 
     * @protected
     */
    static loadScriptsWithTags(local = false){
      this.wantedScriptCount = WANTED_SCRIPTS.length
      const now = Number(new Date())
      WANTED_SCRIPTS.forEach(affix => {
        DCreate('SCRIPT', {
            class: 'alors-library'
          , in: 'document.head'
          , src: (local ? '/priv/static/js/' : LIB_URL) + `${affix}.js?cb=${now}`
          , onerror: this.onLoadScriptError.bind(this, affix)
          , onload:  this.onLoadScriptSuccess.bind(this, affix)
        })
      })
    }

    /**
     * Appelée en cas d'erreur script 
     * 
     * @param {Event} ev Evènement onerror généré
     */
    static onLoadScriptError(affix, ev){
      console.log("Erreur au chargement du script %s.js", affix, ev)
    }
    static onLoadScriptSuccess(affix, ev){
      this.setScriptLoaded(affix)
    }
    /** 
     * Appelée quand un des scripts est chargé. Quand tous les scripts sont chargés, la méthode 'prepareAndRun' est invoquée
     * @protected
     */
    static setScriptLoaded(affix){
      -- this.wantedScriptCount;
      if ( this.wantedScriptCount == 0 /* tous les scripts ont été chargés */) {
        this.prepareAndRun()
      }
    }
  }

  return Alors;
})();