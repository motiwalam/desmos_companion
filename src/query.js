/*
  this file defines all the methods used to query the state of the Calculator
*/

/* the api has two ways to get the list of expressions, either with a call to
  getExpressions() or through getState(). the two arrays are different, so this
  merges them
*/
function getAllExpressions() {
  return _.map(_.zip(Calc.getExpressions(), Calc.getState().expressions.list),
      (kv) => {
        return _.extend(kv[0], kv[1])
      })
}

/* iterate over getAllExpressions() until it finds an object containing all the
  key-value pairs of obj
*/
function getExpression(obj) {
  return _.find(getAllExpressions(), (e) => {return _.isMatch(e, obj)});
}


function getExpressionById(id) {
  return getExpression({id: id})
}


function getExpressionByRow(row) {
  row = parseInt(row)
  if (isNaN(row)) {
    throw "row is NaN"
  } else {
    exprs = getAllExpressions()
    if (row < 1 || row >= exprs.length) {
      return exprs[row]
    }
  }
}


function getSelectedExpression() {
  return getExpressionById(Calc.selectedExpressionId)
}


function getUnusedId() {
  return `${parseInt(_.max(getAllExpressions(), (e) => { return isNaN(e.id) ? 0 : e.id }).id) + 1}`
}

function inferType(expr) {
  if (_.has(expr, "latex")) {
    return "expression"
  } else if (_.has(expr, "text")) {
    return "text"
  } else if (_.has(expr, "columns")) {
    return "table"
  } else if (_.has(expr, "title")) {
    return "folder"
  } else if (_.has(expr, "image_url")) {
    return "image"
  }
}

function addExpression(expr, row) {
  var tmp = Calc.getState()
  var row = parseInt(row)
  row = Math.max(1, Math.min(isNaN(row) ? Infinity : row, tmp.expressions.list.length))
  if (typeof expr.id === "undefined") {expr.id = getUnusedId()} // undefined id's cause problems
  if (typeof expr.type === "undefined") {expr.type = inferType(expr)}
  tmp.expressions.list.splice(row - 1, 0, expr)
  Calc.setState(tmp)
}

function addExpressions(...objs) {
  _.map(objs, (o) => {addExpression(o.expr, o.row)})
}
