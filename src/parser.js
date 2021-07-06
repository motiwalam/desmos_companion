/*
  this file creates the framework for making and parsing commands written in
  Desmos
*/
REGISTRY = {

  keywords: {

    call: {
      end: " ;",
      method: function(input, expr) {
        argv = shlex_split(input.replace(REGISTRY.keywords.call.end, ""))
        macro = argv[0]
        macro_input = _.rest(argv)
        console.log(macro)
        console.log(macro_input)
        if (typeof REGISTRY.macros[macro] !== "undefined") {
          REGISTRY.macros[macro](macro_input, expr)
        }
      }
    }

  },

  macros: {

  },

  keyshortcuts: {

  }

}

function _parseCommand(input) {
  idx = input.indexOf(" ")
  // [keyword, input]
  return [input.slice(1, input.indexOf(" ")), input.slice(idx+1)]
}

function onChanged() {
  expr = getSelectedExpression()
  // commands must be given in "notes" or expressions with type: "text"
  if (expr && expr.text) {
    // $ indicates the intent of giving a command
    if (expr.text.startsWith("$")) {
      keyword_input = _parseCommand(expr.text);
      // $ macro is an alias for $call macro
      keyword = keyword_input[0].length === 0 ? "call" : keyword_input[0]
      input = keyword_input[1]
      // this indicates the command is over
      if (expr.text.endsWith(REGISTRY.keywords[keyword].end)) {
        console.log(keyword)
        console.log(input)
        console.log(expr)
        Calc.removeSelected()
        REGISTRY.keywords[keyword].method(input, expr)
      }
    }
  }
}


function registerKeyword(keyword, kwobj) {
  if (typeof kwobj !== "object") {
    throw "you need to pass an object with a property 'method' that is a function "
  }
  // default end value is " ;"
  if (!_.has(kwobj, "end")) {
    kwobj.end = " ;"
  }

  if (!_.has(kwobj, "method")) {
    throw "keyword objects must have a property 'method' that is a function "
  }

  REGISTRY.keywords[keyword] = kwobj;
}


function registerMacro(macro, mfunc) {
  REGISTRY.macros[macro] = mfunc;
}


function registerShortcut(combo, func) {

  function compressToId(combo) {
    if (combo) {
      var c = 2 * ( _.has(combo, "ctrl") ? 1 : 0 )    // ctrl key
      var s = 4 * ( _.has(combo, "shift") ? 1 : 0 )  // shift key
      var a = 8 * ( _.has(combo, "alt") ? 1 : 0 )    // alt key
      var cc = _.has(combo, "key") ? combo.key : 0  // actual char code
      return c + s + a + cc
    }
  }

  var id = compressToId(combo)
  if (id && typeof func === "function") {
    REGISTRY.keyshortcuts[id] = func
  } else {
    throw "failed. did you pass a function?"
  }

}


function onKeyUp(e) {
  function getId(e) {
    return (2*e.ctrlKey + 4*e.shiftKey + 8*e.altKey) + (e.keyCode || e.which)
  }

  var id = getId(e)
  if (_.has(REGISTRY.keyshortcuts, id)) {
    REGISTRY.keyshortcuts[id](e)
  }
}
