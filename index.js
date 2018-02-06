/**
options:


*/
module.exports = function (babel) {
  var t = babel.types

  return {
    inherits: require('babel-plugin-syntax-jsx'),
    visitor: {
      JSXNamespacedName (path) {
        throw path.buildCodeFrameError(
          'Namespaced tags/attributes are not supported. JSX is not XML.\n' +
          'For attributes like xlink:href, use xlinkHref instead.'
        )
      },
      JSXElement: {
        exit (path, state) {
          // turn tag into createElement call
          var callExpr = buildElementCall(path.get('openingElement'), state)
          if (path.node.children.length) {
            // add children as 3rd+ arg
            path.node.children.forEach(c=>callExpr.arguments.push(c));
            // if you want to create an array instead, do it here
          }
          path.replaceWith(t.inherits(callExpr, path.node))
        }
      }
    }
  }

  function buildElementCall (path, state) {
    // extra option to add arrow around every js expression that is a child
    replaceWithArrow(path.parent.children, state);
    path.parent.children = t.react.buildChildren(path.parent)

    var tagExpr = convertJSXIdentifier(path.node.name, path.node)
    var args = []
    var tagName
    if (t.isIdentifier(tagExpr)) {
      tagName = tagExpr.name
    } else if (t.isLiteral(tagExpr)) {
      tagName = tagExpr.value
    }

    if (t.react.isCompatTag(tagName)) { // starts with uppercase
      args.push(t.stringLiteral(tagName))
    } else {
      args.push(tagExpr)
    }

    var attribs = path.node.attributes
    if (attribs.length) {
      attribs = buildOpeningElementAttributes(attribs, state)
    } else {
      attribs = t.nullLiteral()
    }
    args.push(attribs)

    return t.callExpression(t.identifier('h'), args)
  }

  function convertJSXIdentifier (node, parent) {
    if (t.isJSXIdentifier(node)) {
      if (node.name === 'this' && t.isReferenced(node, parent)) {
        node = t.thisExpression()
      } else{
        // Vue uses esutils here to confirm valid Identifier name
        // we do no such thing for our simple JSX transform
        node.type = 'Identifier'
      }
    } else if (t.isJSXMemberExpression(node)) {
      node = t.memberExpression(
        convertJSXIdentifier(node.object, node),
        convertJSXIdentifier(node.property, node)
      )
    }
    return node
  }

  /**
   * Convert to object declaration by adding all 
   * props and spreads as they are found.
   */

  function buildOpeningElementAttributes (attribs, state) {
    var _props = []

    while (attribs.length) {
      var prop = attribs.shift()
      if (t.isJSXSpreadAttribute(prop)) {
        prop.argument._isSpread = true
        _props.push(t.spreadProperty(prop.argument))
      } else {
        _props.push(convertAttribute(prop, state))
      }
    }

    attribs = t.objectExpression(_props)
    
    return attribs
  }

  function convertAttribute (node, state) {
    var value = convertAttributeValue(node.value || t.booleanLiteral(true))
    if (t.isStringLiteral(value) && !t.isJSXExpressionContainer(node.value)) {
      value.value = value.value.replace(/\n\s+/g, ' ')
    }
    if (t.isValidIdentifier(node.name.name)) {
      node.name.type = 'Identifier'
    } else {
      node.name = t.stringLiteral(node.name.name)
    }

    // add arrow around every attribute value that is js expression
    if(t.isJSXExpressionContainer(node.value)){
      if(isRefIdentifier(value)){
        // do nothing
      }else if(state.opts.staticTranslation && isTranslationCall(value)){
        // do nothing
      }else if(isRefCall(value)){
        value = value.arguments[0];
      }else{
        value = t.arrowFunctionExpression([],value)
      }
    }
    return t.inherits(t.objectProperty(node.name, value), node)
  }

  function convertAttributeValue (node) {
    if (t.isJSXExpressionContainer(node)) {
      return node.expression
    } else {
      return node
    }
  }

  function isRefIdentifier(expr){
    return t.isIdentifier(expr) && expr.name && expr.name[0] == '$';
  }
  function isRefCall(expr){
    return t.isCallExpression(expr) && expr.callee && expr.callee.name == '$ref';
  }
  function isTranslationCall(expr){
    return t.isCallExpression(expr) && expr.callee && expr.callee.name == 't';
  }

  function replaceWithArrow (ch, state) {
    for(var i=0; i<ch.length; i++){
      if(t.isJSXExpressionContainer(ch[i])){
        var expr = ch[i].expression;
        if(isRefIdentifier(expr)){
          // leave as is
        }else if(state.opts.staticTranslation && isTranslationCall(expr)){
          // leave as is
        }else if(isRefCall(expr)){
          // single liner using splice to insert all elements in place. This works for all array sizes(0,1,...)
          ch.splice.apply(ch,[i,1].concat(expr.arguments));
        }else{
          ch[i].expression = t.arrowFunctionExpression([],ch[i].expression)
        }
      }
    }
  }
}
