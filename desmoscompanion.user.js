// ==UserScript==
// @name Desmos Companion
// @version 1.1.1
// @description Provides a set of easy to use wrappers around the Desmos API to make Desmos even more programmable!
// @author supermusti7

// @match https://www.desmos.com/calculator
// @match https://www.desmos.com/calculator/*


// @require  	https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==

var SHOWCONSOLE = true;  // change to false to hide console

function main() {
  const $ = window.jQuery;
  graph_container = document.getElementById("graph-container")

  if (graph_container.children.length < 1) {
    console.log("timing out")
    setTimeout(main, 0)

  } else {
    // add console stylesheet
    $('head').append($("<link />", {rel: "stylesheet", href: "https://thechosenreader.github.io/javascript-sandbox-console/src/sandbox.css"}))
    // console
    myConsole = document.createElement("div")
    myConsole.style.visibility = "hidden"
    myConsole.innerHTML = `<div id="sandbox" style="position: fixed; bottom: 0; right: 0"> sandbox loading.. </div>
    	<!-- The sandbox template -->
    	<script type="text/template" id="tplSandbox">
    		<pre class="output"></pre>
    		<div class="input">
    			<textarea rows="1" placeholder="<%= placeholder %>"></textarea>
    		</div>
    	</script>

    	<!-- The command/result template (NB whitespace/line breaks matter inside <pre> tag): -->
    	<script type="text/template" id="tplCommand"><% if (! _hidden) { %><span class="command"><%= command %></span>
    	<span class="prefix"><%= this.resultPrefix %></span><span class="<%= _class %>"><%= result %></span>
    	<% } %></script>`

    // show console button
    button = document.createElement("button")
    button.type = "submit"
    button.style.width = "80px"
    button.style.height = "20px"
    button.style.position = "absolute"
    button.style.bottom = "5px"
    button.style.right = "5px"
    button.style.fontSize = "10px"
    button.style.color = "rgb(0, 0, 0)"
    button.style.backgroundColor = "rgb(200, 200, 200)"
    button.innerHTML = "Show Console"

    isConsoleShowing = false
    button.onclick = function() {
      isConsoleShowing = !isConsoleShowing
      if (isConsoleShowing) {
        myConsole.style.visibility = ""
        button.innerHTML = "Hide Console"
      } else {
        myConsole.style.visibility = "hidden"
        button.innerHTML = "Show Console"
      }
    }

    /* calling appendChild on graph_container itself causes the element to be
    appended before the graph is created. item(0) is yet another container, but
    its presence guarantees the appended element appears on top of the graph.
    using @run-at didnt work too well, but i didnt explore it properly either
    */
    if (SHOWCONSOLE) {
      $(graph_container.children.item(0)).append(myConsole)
      $(graph_container.children.item(0)).append(button)
    }

    /* this crazy shit is to ensure that the sandbox is created after every
       script has been loaded in the correct order. probably, backbone.js is not
       dependent on underscore, but fuck it, ive been doing this too long
    */
    get_dependencies(
      ["https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.13.1/underscore-umd-min.js",  // latest as of 06/07/21
       "https://thechosenreader.github.io/javascript-sandbox-console/src/libs/backbone.min.js",
       "https://thechosenreader.github.io/javascript-sandbox-console/src/libs/backbone-localStorage.min.js",
       "https://thechosenreader.github.io/JSON-js/cycle.js",
       "https://thechosenreader.github.io/javascript-sandbox-console/src/sandbox-console.js"],
      (d, t, s) => {
        if (SHOWCONSOLE) {
          window.sandbox = new Sandbox.View({
          el : $('#sandbox'),
          model : new Sandbox.Model()
        });
        }

      }, [
        /* this defines a special callback for underscore.js, which seems to just
           exit after defining underscore for AMD, so this deals with that case
        */
        (d, t, s) => { (typeof _ === "undefined") ? window._ = require("underscore") : null }
      ])


      get_dependencies(
        [
          "https://thechosenreader.github.io/desmos_companion/src/shlex.js",
          "https://thechosenreader.github.io/desmos_companion/src/help.js",
          "https://thechosenreader.github.io/desmos_companion/src/query.js",
          "https://thechosenreader.github.io/desmos_companion/src/input.js",
          "https://thechosenreader.github.io/desmos_companion/src/parser.js"
        ], (d, t, s) => {
          Calc.observeEvent("change", onChanged)  // parser.js
          document.onkeyup = onKeyUp;  // parser.js
        },

        []
      )
  }

}

function get_dependencies(files, callback, individual_callbacks) {
  var i = 0;
  var individual_callbacks = (individual_callbacks === null ? [] : individual_callbacks)
  function _recursive_callback(d, t, s) {
    var cidx = i++  // save current value of i and then increment i
    var _c = (cidx === files.length - 1) ? callback : _recursive_callback
    // debugger;
    var c = (individual_callbacks[cidx] ? (d1, t1, s1) => { individual_callbacks[cidx](d, t, s); _c(d, t, s) } : _c)
    $.getScript(files[cidx], c)
  }

  _recursive_callback(null, null, null);
}

main()
