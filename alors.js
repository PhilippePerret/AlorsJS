'use strict';
/*
Réflexion sur comment il faut que ça fonctionne

* pour le moment, les tests s'arrêtent lorsque la page courante n'a
  pas de feuille de test. Il faudrait un autre système tout en 
  maintenant cette idée générale que chaque page contient ses propres
  tests. Mais il faut tenir compte du fait que l'appel d'une page 
  peut exiger ses propres tests.
* chaque test est identifié par un identifiant unique qui permet de ne 
  jamais recommencer le même test (SAUF QUE parfois, il faut le 
  recommencer => dans ce cas, le test doit contenir une propriété 
  :repeatable à true)
  Pour obtenir cet identifiant, on lui ajoute le nom (path relatif) de
  sa page de test.
* chaque page contient sa propre feuille de test qui permet de vérifier
  sa validité, ce qui fait qu'on ne garde jamais en mémoire un nombre
  considérable de tests.
* À chaque chargement de page on affiche le comptage actuel des succès
  et des échecs.

  */

/**
 * Fonction définissant et retournant, au tout premier lancement des
 * tests, un TOKEN qui permettra de spécifier les données en stockage
 * de session afin de ne pas malencontreusement écraser un item de 
 * l'application.
 */
function defAndGetAtestToken(){
  const token = String(Number(new Date()))
  sessionStorage.setItem("ATEST-TOKEN", token)
}
const ATEST_TOKEN = sessionStorage.getItem("ATEST-TOKEN") || defAndGetAtestToken()
// console.log("ATEST_TOKEN", ATEST_TOKEN)

/**
 * Classe FeuilleTest
 * 
 * C'est la classe singleton qui gère la page courante affichée pour
 * en tirer les informations, caractériser les id des tests, 
 * construire sa balise <script>, etc.
 */
class FeuilleTest {
  constructor(){}
  init(){
    const loc = this.location = window.location
    this.pathname = loc.pathname
    this.name = this.id = this.getTestNameFromUrl()
    this.url = this.src = "/assets/js/alors_tests/" + this.name

    /*
    console.log("name", this.name)
    console.log("url", this.url)
    //*/

    this.setScriptTag()
  }

  getTestNameFromUrl(){
    const name = []
    name.push(...window.location.pathname.split("/").filter(a => a != ""), "test.js")
    // console.log("name", name)
    return name.join("_").replace("-", "_")
  }

  /**
   * Fonction qui construit la balise <script> permettant de charger
   * cette feuille de test si elle existe.
   */
  setScriptTag(){
    const tag = document.createElement('SCRIPT')
    tag.type     = "text/javascript"
    tag.id       = "script-alors-test-page-courante"
    tag.onload   = this.onLoaded.bind(this)
    tag.onerror  = this.onErrorLoading.bind(this)
    this.tag = tag

    document.body.appendChild(this.tag)
    this.tag.src = this.src

  }
  onLoaded(ev){
    // Quand la feuille de test est vraiment chargée, on peut lancer
    // le testeur.
    ATest.run()
  }
  onErrorLoading(ev){
    // Erreur "normale" quand le test n'existe pas. Ça signe la fin
    // des tests
    ATest.stop()
  }

}
const CurrentFeuilleTest = new FeuilleTest()
const CFT = CurrentFeuilleTest
CFT.init()

class Alors {

  static get verbose(){ return true }
  /**
   * Cette fonction est appelée à chaque rechargement de page. Elle 
   * consiste principalement à insérer une balise <script> dans la
   * page pour tester la page courante.
   * 
   * Rappel : les tests généraux (unitaires) de l'application se font
   * de préférence sur la page d'accueil ou une page dédiée.
   */
  static install(){

  }

  static log(msg, options){
    if (options && options.verbose == false ) { return }
    console.log('%c'+msg, "font-family:monospace;font-size:10pt;")
  }

}


/**
 * Pour créer un test :
 *    test("<titre>", "<id>", <callback>, <data>)
 * Par exemple
 *    test("Mon premier test", "premier-test", _ => {console.log("ici le test")}, {repeatable: true, pending: false, tags: ["toujours"]})
 */
class ATest {
  static get verbose(){ return true } // toujours, pour le moment
  static init(){
    this.tests = []
  }

  /**
   * -> test(...)
   * 
   * Fonction appelé par le DSL test(...) des feuilles de test
   * 
   * Elle peut être appelée sans identifiant, dans lequel cas cet 
   * identifiant est calculé en fonction de la ligne (forcément
   * unique du test)
   */
  static add(titre, id, callback, data){
    if ( 'function' == typeof id ) {
      data      = JSON.parse(JSON.stringify(callback || null))
      callback  = id
      id        = null
    }
    data = Object.assign({pending: false, verbose: Alors.verbose}, data || {})
    try { throw new Error("Pour voir la ligne ")}
    catch(erreur) { Object.assign(data, this.getLineForm(erreur) ) }
    id = id || `test-ligne-${data.line}`
    console.log("Identifiant du test : ", id)
    const newTest = new ATest(titre, id, callback, data)
    this.tests.push(newTest)
    // Ça ajoute toujours un test aux résultats
    TestWorker.storedResultats.addTest(`${CFT.id}-${id}`)
  }
  static getLineForm(erreur){
    const last = erreur.stack.split("\n").pop().split(":")
    const column  = Number(last.pop())
    const line    = Number(last.pop())
    return {line: line, column: column}
  }
  /**
   * Fonction appelée pour préparer les tests. La préparation des
   * tests sert principalement à charger la feuille de test de la
   * page courante.
   */
  static prepare(){
    Alors.install()
  }
  /**
   * Pour lancer tous les tests de la page. La fonction est appelée
   * à la fin du chargement de la page.
   */
  static run(){
    console.info("-> ATest.run (LANCEMENT DES TESTS)")
    var montest;
    if ( montest = unstore("TODO-ATEST") ) {
      console.info("Un test a été mémorisé : ", montest)
    }

    this.tests.forEach(test => test.run())

    /* Si on est encore là, c'est qu'aucun des tests précédents ne
     * chargeait une autre page. On a donc terminé les tests        */
    this.stop()
  }

  /**
   * Quand tous les tests ont été joués.
   */
  static stop(){
    console.info("-> ATest.stop (FIN DES TESTS)")
    TestWorker.setFin()
    TestWorker.reporter.displayFinalReport()
  }


  // ========== INSTANCE D'UN TEST =============
  
  
  constructor(titre, id, callback, data){
    this.titre = titre
    this.id = id
    this.callback = callback
    this.data = data
  }
  run(){
    if ( this.pending ) {
      // TODO Indiquer que ce test est passé
    } else {
      console.info("Je joue le test %s", this.titre)
      this.callback()
    }
  }

  /**
   * Dans un test, on peut utiliser this.log() pour écrire un
   * message dans la console (repérable). Sauf si verbose est
   * réglé à false pour ce test (la valeur verbose du test surclasse
   * toujours la valeur globale)
   */
  log(msg){
    var verbose ;
    if ( this.verbose === undefined ) {
      verbose = Alors.verbose || false
    } else {
      verbose = this.verbose
    }
    // msg = msg.replace(/__ID__/g, String(this.id))
    console.log("Message corrigé avant d'écrire : ", msg)
    Alors.log(msg, {verbose: verbose})
  }

  get verbose(){ return this.data.verbose }
  get pending(){ return this.data.pending }
}
ATest.init()



const TEST_WORKER_KEY = `TEST-WORKER-${ATEST_TOKEN}`;
class TestWorker {

  /**
   * Initialisation du test
   * ----------------------
   * Cette fonction est appelée dans deux cas différents :
   *  1) au tout début des tests, quand on les lance
   *  2) au chargement d'une page quand on change de page
   * Dans le premier cas, elle crée l'objet TestWorker qui sera
   * consigné dans la sessionStorage. Une fois que cet objet est
   * créé, on sait qu'on est dans la suite des tests.
   * 
   * Elle est en tout cas appelée à chaque chargement de page et peut
   * donc faire le rapport de suivi des tests.
   * 
   */
  static initOrRestore(){
    // Init ou Restore ?
    this.reporter.displayResume()
  }
  static get reporter(){return this._reporter || (this._reporter = new Reporter())}

  /**
   * OBJET TRANSPORTÉ DE PAGE EN PAGE
   * ================================
   * C'est l'objet le plus important puisqu'il consigne au fil des 
   * tests tout ce qui est fait.
   */
  static get storedResultats(){return this._storedres || (this._storedres = new StoredResultat(TEST_WORKER_KEY))}
  
  static test_and_register(assertion, msg_success, msg_failure, negative = false){
    const ok = assertion == (!negative)
    const message = ok ? msg_success : msg_failure ;
    this[ok ? 'addSuccess' : 'addFailure']({message:message})
    return ok
  }

  static addSuccess(data){
    this.storedResultats.addSuccess(data)
    ATest.verbose && console.log('%c✅ ' + data.message, GREEN_COLOR)
  }
  static addFailure(data){
    this.storedResultats.addFailure(data)
    console.log('%c❌ ' + data.message, RED_COLOR)
  }
  static addPending(data){
    this.storedResultats.addPending(data)
    ATest.verbose && console.log("Pending:", msg_pending)
  }

  static setStart(){
    this.storedResultats.startTime = Number(new Date())
  }
  static setFin(){
    this.storedResultats.endTime = Number(new Date())
  }
}

/**
 * Classe gérant l'objet conservé en session de page en page
 * et consignant les résultats au fur et à mesure des tests.
 * C'est la propriété TestWorker.storedResultat qui s'en sert
 */
class StoredResultat {
  constructor(session_key){
    // À la construction, soit cette donnée existe déjà, soit
    // il faut l'initier
    this.key = session_key
    this.data =  this.getDataFromSession(session_key) || this.createData(session_key)
    console.info("Résultats stored = ", this.data)
  }

  addTest(testId){
    Object.assign(this.data.testsPerId, {[testId]: true})
  }

  addSuccess(data){
    this.add('success', data)
  }
  addFailure(data){
    this.add('failures', data)
  }
  addPending(data){
    this.add('pendings', data)
  }
  add(type, data){
    this.data[type].push(data.message)
    this.save()
  }

  save(data){
    data = data || this.data
    sessionStorage.setItem(this.key, JSON.stringify(data))
  }

  getDataFromSession(key){
    let data = sessionStorage.getItem(key)
    if ( data ) return JSON.parse(data) ;
  }
  createData(key){
    const data = {
        key: key
      , created_at: Number(new Date())
      , success:  []    // Juste la liste des identifiants des tests réussis
      , failures: []    // Les erreurs qui seront à afficher à la fin
      , pendings: []
      , testsPerId: {} // chaque test génère une ligne <id test>: true sauf s'il est répétable
      , testCount: 0
      , startTime: null
      , endTime: null
    }
    this.save(data)
    return data
  }
  get create_at() {return new Date(this.data.created_at)}
  get testCount() {return this.data.testCount}
  get success()   {return this.data.success}
  get failures()  {return this.data.failures}
  get pendings()  {return this.data.pendings}
  get startTime() {return this.data.startTime}
  set startTime(v){this.data.startTime = v}
  get endTime()   {return this.data.endTime}
  set endTime(v)  {this.data.endTime = v}
}

const GREEN_COLOR = 'color:green; background-color:#DDFFDD;'
const RED_COLOR   = 'color:red; background-color:#FFDDDD;'

class Reporter {
  constructor(){
    this.worker = TestWorker.storedResultats
  }
  displayResume(){
    const w = this.worker
    const testsFailed = w.failures.length > 0
    const color = testsFailed ? RED_COLOR : GREEN_COLOR  ; 
    const style = `font-size:16pt;${color};outline:1px solid;`
    console.log('%c'+"Tests: %s Success: %s Failures: %s Pendings: %s", style, w.testCount, w.success.length, w.failures.length, w.pendings.length)
    if ( testsFailed ) {
      console.error("ERREURS\n", w.failures.join("\n"))
    }
  }

  displayFinalReport(){
    this.displayResume()
    console.info("Je dois apprendre à afficher le rapport final.")
  }
}

class Storage {
  /**
   * Une seule fonction (raccourci: store(…)) pour récupérer et 
   * définir une valeur.
   * 
   */
  static set_or_get(key, value) {
    if ( undefined === value ) {
      return this.get(key)
    } else {
      return this.set(key, value)
    }
  }
  static get(key, defaultValue){
    key = this.realKeyFor(key)
    return this.toRealValue(sessionStorage.getItem(key)) || defaultValue
  }
  static get_and_remove(key, defaultValue) {
    key = this.realKeyFor(key)
    const value = this.toRealValue(sessionStorage.getItem(key)) || defaultValue
    sessionStorage.removeItem(key)
    return value
  }
  static set(key, value){
    key = this.realKeyFor(key)
    sessionStorage.setItem(key, this.toStorableValue(value))
  }
  static toStorableValue(value){
    return JSON.stringify(value)
  }
  static toRealValue(value){
    return JSON.parse(value)
  }
  static realKeyFor(key){
    return `${key}-${TEST_WORKER_KEY}`
  }
}

window.Alors = Alors
const store   = Storage.set_or_get.bind(Storage)
const destore = Storage.get.bind(Storage)
const unstore = Storage.get_and_remove.bind(Storage)
window.ATest  = ATest 
window.test   = ATest.add.bind(ATest)

TestWorker.initOrRestore()
