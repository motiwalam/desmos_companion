/*
  all of the documentation available within the console
*/

HELP = {
  shortcuts:
            `ctrl-alt-o (or type '"' in an empty expression): new note
             ctrl-alt-f (or type "folder"): new folder
             ctrl-alt-i: new image`
}


function help(s) {
  if (HELP[s]) {
    return HELP[s]
  } else {
    if (typeof s === "undefined") {
      return HELP
    }
    return "sorry, I don't have any information on that just yet"
  }
}
