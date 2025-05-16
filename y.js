function choo () {
  const s = '', events = ['abort', 'click', 'error', 'keydown', 'load', 'loadend', 'message', 'mousedown', 'mousemove',
    'online', 'open', 'popstate', 'success', 'touchmove', 'upgradeneeded', 'versionchange'].map(event => 'on' + event)

  function remove_attribute (node, name) {
    node.removeAttribute(name)
  }

  function set_attribute (node, name, value) {
    node.setAttribute(name, value)
  }

  function morph_attribute (new_node, old_node, name) {
    if (new_node[name] != old_node[name]) {
      old_node[name] = new_node[name]
      new_node[name] ? set_attribute(old_node, name, s) : remove_attribute(old_node, name)
    }
  }

  function has_attribute_ns (node, name, value) {
    return node.hasAttributeNS(name, value)
  }

  function morph_input (new_node, old_node) {
    let new_value = new_node.value, old_value = old_node.value, value = 'value'
    morph_attribute(new_node, old_node, 'checked')
    morph_attribute(new_node, old_node, 'disabled')
    if (new_value != old_value || old_node.type == 'range') set_attribute(old_node, value, new_value)
    if (new_value == s || !has_attribute_ns(new_node, s, value)) remove_attribute(old_node, value)
  }

  function replace_attributes (new_node, old_node) {
    let new_attrs = new_node.attributes, old_attrs = old_node.attributes, i, attr, name, namespace, value
    for (i = new_attrs.length; i--;) {
      attr = new_attrs[i]
      name = attr.name
      namespace = attr.namespaceURI
      value = attr.value
      if (namespace) {
        name = attr.localName || name
        old_node.getAttributeNS(namespace, name) != value && old_node.setAttributeNS(namespace, name, value)
      } else {
        if (old_node.hasAttribute(name)) {
          if (old_node.getAttribute(name) != value) {
            value == s ? remove_attribute(old_node, name) : set_attribute(old_node, name, value)
          }
        } else {
          set_attribute(old_node, name, value)
        }
      }
    }
    for (i = old_attrs.length; i--;) {
      attr = old_attrs[i]
      if (attr.specified) {
        name = attr.name
        namespace = attr.namespaceURI
        if (namespace) {
          name = attr.localName || name
          !has_attribute_ns(new_node, namespace, name) && old_node.removeAttributeNS(namespace, name)
        } else if (!has_attribute_ns(new_node, s, name)) {
          remove_attribute(old_node, name)
        }
      }
    }
  }

  function morph_textarea (new_node, old_node) {
    let new_value = new_node.value, child
    if (new_value != old_node.value) {
      old_node.value = new_value
      child = old_node.firstChild
      if (child && child.nodeValue != new_value && !(new_value == s && child.nodeValue == old_node.placeholder)) {
        child.nodeValue = new_value
      }
    }
  }

  function morph (new_node, old_node) {
    let new_type = new_node.nodeType, new_name = new_node.nodeName, new_value = new_node.nodeValue
    if (new_type == 3 || new_type == 8) {
      old_node.nodeValue = new_value
    } else if (new_type == 1) {
      replace_attributes(new_node, old_node)
    }
    if (new_name == 'INPUT') {
      morph_input(new_node, old_node)
    } else if (new_name == 'OPTION') {
      morph_attribute(new_node, old_node, 'selected')
    } else if (new_name == 'TEXTAREA') {
      morph_textarea(new_node, old_node)
    }
    events.forEach(event => old_node[event] = new_node[event] ? new_node[event] : s)
  }

  function same (a, b) {
    return a == b ? true : a.id ? a.id == b.id : a.type == 3 ? a.nodeValue == b.nodeValue : false
  }

  function update (new_node, old_node) {
    for (let i = 0, offset = 0, new_child, old_child, j, length, match, morphed; ; i++) {
      new_child = new_node.childNodes[i - offset]
      old_child = old_node.childNodes[i]
      old_node.a = old_node.childNodes
      if (!new_child && !old_child) {
        break
      } else if (!new_child) {
        old_node.removeChild(old_child)
        i--
      } else if (!old_child) {
        old_node.appendChild(new_child)
        offset++
      } else if (same(new_child, old_child) || !new_child.id && !old_child.id) {
        morphed = walk(new_child, old_child)
        if (morphed != old_child) {
          old_node.replaceChild(morphed, old_child)
          offset++
        }
      } else {
        match = s
        length = old_node.a.length
        for (j = i; j < length; j++) {
          if (same(old_node.a[j], new_child)) {
            match = old_node.a[j]
            break
          }
        }
        if (match) {
          morphed = walk(new_child, match)
          new_child = morphed
          if (morphed != match) offset++
        } else {
          offset++
        }
        old_node.insertBefore(new_child, old_child)
      }
    }
  }

  function walk (new_node, old_node) {
    if (new_node.f) {
      old_node = new_node.f
      new_node = new_node.e(new_node.d, new_node.b)
    }
    if (!old_node) {
      return new_node
    } else if (!new_node) {
      return
    } else if (new_node == old_node) {
      return old_node
    } else if (new_node.tagName != old_node.tagName) {
      return new_node
    }
    morph(new_node, old_node)
    update(new_node, old_node)
    return old_node
  }

  function relay () {
    this.a = function (event) {
      event = this.c[event]
      if (event) {
        let data = [], i, length = arguments.length
        for (i = 1; i < length; i++) {
          data.push(arguments[i])
        }
        for (length = event.length, i = 0; i < length; i++) {
          listener = event[i]
          listener.apply(listener, data)
        }
      } 
      return this
    }
    this.on = this.b = function (event, listener) {
      if (!this.c[event]) {
        this.c[event] = []
      }
      this.c[event].push(listener)
      return this
    }
    this.c = {}
  }

  function traverse (node) {
    if (node) return node.localName != 'a' ? traverse(node.parentNode) : node
  }

  function special (event) {
    return event.altKey || event.button || event.ctrlKey || event.metaKey || event.shiftKey
  }

  function ready (callback) {
    window.onclick = event => {
      if (!special(event)) {
        const node = traverse(event.target)
        if (node) event.preventDefault()
        callback(node)
      }
    }
    window.ontouchstart = event => event.preventDefault()
  }

  this.a = new relay()
  this.b = this.a.a.bind(this.a)
  this.c = []
  this.d = {}
  this.e = {}

  this.use = function (callback) {
    const self = this
    self.c.push(state => callback(state, self.a))
  }

  this.load = function (callback) {
    const self = this
    self.c.push(state => callback(state, self.b))
  }

  this.route = function (route) {
    this.e = route
  }

  this.mount = function (node) {
    const self = this
    window.onpopstate = event => walk(self)
    ready(state => {
      state = state && state.href
      if (state) {
        history.pushState({}, s, state)
        walk(self)
      }
    })
    self.c.forEach(func => func(self.d))
    self.f = document.getElementById(node)
    walk(self)
  }
}

function html (options={}) {
  const var_attr = 0, text_attr = 1, open_attr = 2, close_attr = 3, attr = 4, attr_key = 5, attr_key_w = 6,
    attr_value_w = 7, attr_value = 8, attr_sq = 9, attr_dq = 10, attr_eq = 11, attr_break = 12, comment = 13,
    end_hyphen = /-$/, forward_slash = /^\//, lead_line = /^\n[\s]+/, lead_space = /^[\s]+/,
    multi_space = /[\n\s]+/g, not_whitespace = /[^\s"'=/]/, single_char_only = /\S/, start_comment = /^!--$/,
    trail_line = /\n[\s]+$/, trail_space = /[\s]+$/, whitespace = /\s/,  whitespace_only = /^\s*$/,
    word_or_hyphen = /[\w-]/, xmlns = /^xmlns($|:)/i, comment_tag = '!--', string = 'string', s = '', p = ' ',
    func = 'function', obj = 'object', slash = '/', style = 'style', sstyle = '/style', eq = '=', dq = '"', sq = "'"
  const bool_props = ['autofocus', 'checked', 'defaultchecked', 'disabled', 'formnovalidate', 'indeterminate',
    'readonly', 'required', 'selected', 'willvalidate'], code_tags = ['code', 'pre'], text_tags = ['a', 'abbr', 'b',
    'bdi', 'bdo', 'br', 'cite', 'data', 'dfn', 'em', 'i', 'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'amp',
    'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr']
  const void_closes = RegExp('^(' + ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen',
    'link', 'meta', 'param', 'source', 'track', 'wbr'].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')

  function append_child (parent, node) {
    parent.appendChild(node)
  }

  function concat (a, b) {
    return String(a) + String(b)
  }

  function create_text_node (node) {
    return document.createTextNode(node)
  }

  function lower (string) {
    return string.toLowerCase()
  }

  function index (object, key) {
    return object.indexOf(key)
  }

  function is_array (object) {
    return Array.isArray(object)
  }

  function is_quote (state) {
    return state == attr_sq || state == attr_dq
  }

  function own (part, prop) {
    return part.hasOwnProperty(prop)
  }

  function r (node, regex, value) {
    return node.replace(regex, value)
  }

  function set_ns (el, attr, prop, value) {
    el.setAttributeNS(attr, prop, value)
  }

  function test (regex, string) {
    return regex.test(string)
  }

  function create (tag, props, children) {
    let el, ns
    if (props.namespace) ns = props.namespace
    if (ns) {
      el = document.createElementNS(ns, tag)
    } else if (tag == comment_tag) {
      return document.createComment(props.comment)
    } else {
      el = document.createElement(tag)
    }
    let key, node_name = lower(el.nodeName), prop, value
    for (prop in props) {
      if (own(props, prop)) {
        key = lower(prop)
        value = props[prop]
        if (key == 'classname') {
          key = prop = 'class'
        }
        if (prop == 'htmlFor') prop = 'for'
        if (index(bool_props, key) != -1) {
          if (value == 'true') {
            value = key
          } else if (value == 'false') {
            continue
          }
        }
        if (key.slice(0, 2) == 'on') {
          el[prop] = value
        } else {
          if (ns) {
            prop == 'xlink:href' ? set_ns(el, s, prop, value) : !test(xmlns, prop) && set_ns(el, null, prop, value)
          } else {
            el.setAttribute(prop, value)
          }
        }
      }
    }

    function append_branch (children) {
      if (!is_array(children)) return
      for (let branch, had = false, i = 0, length = children.length, node, value; i < length; i++) {
        node = children[i]
        if (is_array(node)) {
          append_branch(node)
          continue
        }
        if (typeof node == 'number' || typeof node == 'boolean' || typeof node == func || node instanceof Date ||
          node instanceof RegExp) {
          node = node.toString()
        }
        branch = el.childNodes[el.childNodes.length - 1]

        function clean_branch () {
          had = false
          if (index(code_tags, node_name) == -1) {
            if (index(text_tags, node_name) == -1) {
              value = r(r(r(r(branch.nodeValue, lead_line, s), multi_space, p), trail_line, s), trail_space, s)
              value == s ? el.removeChild(branch) : branch.nodeValue = value
            } else {
              branch.nodeValue = r(r(r(r(r(branch.nodeValue, lead_line, i ? p : s), lead_space, p),
                multi_space, p), trail_line, s), trail_space, s)
            }
          }
        }

        if (typeof node == string) {
          had = true
          if (branch && branch.nodeName == '#text') {
            branch.nodeValue += node
          } else {
            node = create_text_node(node)
            append_child(el, node)
            branch = node
          }
          if (i == length - 1) clean_branch()
        } else if (node && node.nodeType) {
          if (had) clean_branch()
          node_name = lower(node.nodeName)
          append_child(el, node)
        }
      }
    }
    append_branch(children)
    return el
  }

  function string_func (x) {
    return typeof x == func || typeof x == obj || typeof x == string ? x : !x ? s : concat(s, x)
  }

  this.html = function (strings) {
    let arg, closed = false, i = 0, length = strings.length, part, state = text_attr, text = s, xstate
    const arglen = arguments.length, parts = []
    for (; i < length; i++) {
      if (i < arglen - 1) {
        arg = arguments[i + 1]
        part = parse(strings[i])
        xstate = parseInt(state)
        if (xstate == attr_dq || xstate == attr_sq || xstate == attr_value_w) xstate = attr_value
        if (xstate == attr) xstate = attr_key
        if (xstate == open_attr) {
          if (text == slash) {
            part.push([open_attr, slash, arg])
            text = s
          } else {
            part.push([open_attr, arg])
          }
        } else if (xstate == comment && options.comments) {
          text += String(arg)
        } else if (xstate != comment) {
          part.push([var_attr, xstate, arg])
        }
        parts.push(...part)
      } else {
        parts.push(...parse(strings[i]))
      }
    }

    function parse (string) {
      if (state == attr_value_w) state = attr
      const result = []
      for (let char, i = 0, length = string.length, style_tag = false; i < length; i++) {
        char = string.charAt(i)
        if (state == text_attr && char == '<') {
          if (text.length) result.push([text_attr, text])
          text = s
          state = open_attr
          style_tag = false
        } else if (char == '>' && !is_quote(state) && state != comment) {
          if (state == open_attr && text.length) {
            result.push([open_attr, text])
            text == style ? style_tag = true : text == sstyle ? style_tag = false : s
          } else if (state == attr_key) {
            result.push([attr_key, text])
          } else if (state == attr_value && text.length) {
            result.push([attr_value, text])
          }
          if (state == text_attr && style_tag) {
            text += char
          } else {
            result.push([close_attr, closed])
            closed = false
            text = s
          }
          state = text_attr
        } else if (state == comment && test(end_hyphen, text) && char == '-') {
          if (options.comments) result.push([attr_value, text.substr(0, text.length - 1)])
          text = s
          closed = true
          state = text_attr
        } else if (state == open_attr && test(start_comment, text)) {
          if (options.comments) result.push([open_attr, text], [attr_key, 'comment'], [attr_eq])
          text = char
          state = comment
        } else if (state == open_attr && char == slash && text.length) {
          closed = true
        } else if (state == open_attr && test(whitespace, char)) {
          if (text.length) result.push([open_attr, text])
          text == style ? style_tag = true : text == sstyle ? style_tag = false : s
          text = s
          state = attr
        } else if (state == open_attr || state == text_attr || state == comment) {
          text += char
        } else if (state == attr && test(not_whitespace, char)) {
          state = attr_key
          text = char
        } else if (state == attr && test(whitespace, char)) {
          if (text.length) result.push([attr_key, text])
          result.push([attr_break])
        } else if (state == attr_key && test(whitespace, char)) {
          result.push([attr_key, text])
          text = s
          state = attr_key_w
        } else if (state == attr_key && char == eq) {
          result.push([attr_key, text], [attr_eq])
          text = s
          state = attr_value_w
        } else if (state == attr_key && char == slash) {
          closed = true
          text = s
          state = attr
        } else if (state == attr_key) {
          text += char
        } else if ((state == attr_key_w || state == attr) && char == eq) {
          result.push([attr_eq])
          state = attr_value_w
        } else if ((state == attr_key_w || state == attr) && !test(whitespace, char)) {
          result.push([attr_break])
          if (test(word_or_hyphen, char)) {
            text += char
            state = attr_key
          } else if (char == slash) {
            closed = true
          } else {
            state = attr
          }
        } else if (state == attr_value_w && char == dq) {
          state = attr_dq
        } else if (state == attr_value_w && char == sq) {
          state = attr_sq
        } else if ((state == attr_dq && char == dq) || (state == attr_sq && char == sq)
          || (state == attr_value && test(whitespace, char))) {
          result.push([attr_value, text], [attr_break])
          text = s
          state = attr
        } else if (state == attr_value_w && !test(whitespace, char)) {
          state = attr_value
          i--
        } else if (state == attr_value || state == attr_sq || state == attr_dq) {
          text += char
        }
      }
      if (state == text_attr && text.length) {
        result.push([text_attr, text])
        text = s
      } else if (text.length && (state == attr_value || state == attr_dq || state == attr_sq)) {
        result.push([attr_value, text])
        text = s
      } else if (state == attr_key) {
        result.push([attr_key, text])
        text = s
      }
      return result
    }

    let j, key, old_key, segment, segments, tree = [null, {}, []]
    const stack = [[tree, -1]]
    for (i = 0, length = parts.length; i < length; i++) {
      segments = stack[stack.length - 1][0]
      part = parts[i]
      state = part[0]
      if (state == open_attr && test(forward_slash, part[1])) {
        if (stack.length > 1) {
          j = stack[stack.length - 1][1]
          stack.pop()
          stack[stack.length - 1][0][2][j] = create(segments[0], segments[1], segments[2].length && segments[2])
        }
      } else if (state == open_attr) {
        segment = [part[1], {}, []]
        segments[2].push(segment)
        stack.push([segment, segments[2].length - 1])
      } else if (state == attr_key || (state == var_attr && part[1] == attr_key)) {
        key = s
        for (length = parts.length; i < length; i++) {
          if (parts[i][0] == attr_key) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] == var_attr && parts[i][1] == attr_key) {
            if (typeof parts[i][2] == obj && !key) {
              for (old_key in parts[i][2]) {
                if (own(parts[i][2], old_key) && !segments[1][old_key]) segments[1][old_key] = parts[i][2][old_key]
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else {
            break
          }
        }
        if (parts[i][0] == attr_eq) i++
        for (j = i, length = parts.length; i < length; i++) {
          if (parts[i][0] == attr_value || parts[i][0] == attr_key) {
            if (!segments[1][key]) {
              segments[1][key] = string_func(parts[i][1])
            } else {
              parts[i][1] == s || (segments[1][key] = concat(segments[1][key], parts[i][1]))
            }
          } else if (parts[i][0] == var_attr && (parts[i][1] == attr_value || parts[i][1] == attr_key)) {
            if (!segments[1][key]) {
              segments[1][key] = string_func(parts[i][2])
            } else {
              parts[i][2] == s || (segments[1][key] = concat(segments[1][key], parts[i][2]))
            }
          } else {
            if (key && !segments[1][key] && i == j && (parts[i][0] == close_attr || parts[i][0] == attr_break)) {
              segments[1][key] = lower(key)
            }
            if (parts[i][0] == close_attr) i--
            break
          }
        }
      } else if (state == attr_key) {
        segments[1][part[1]] = true
      } else if (state == var_attr && part[1] == attr_key) {
        segments[1][part[2]] = true
      } else if (state == close_attr) {
        closed = part[1] || test(void_closes, segments[0])
        if (closed && stack.length) {
          j = stack[stack.length - 1][1]
          stack.pop()
          stack[stack.length - 1][0][2][j] = create(segments[0], segments[1], segments[2].length && segments[2])
        }
      } else if (state == var_attr && part[1] == text_attr) {
        part[2] == null ? s : concat(s, part[2])
        is_array(part[2]) ? segments[2].push(...part[2]) : segments[2].push(part[2])
      } else if (state == text_attr) {
        segments[2].push(part[1])
      }
    }
    tree = tree[2]
    if (tree.length > 1 && test(whitespace_only, tree[0])) tree.shift()
    if (tree.length > 2 || (tree.length == 2 && test(single_char_only, tree[1]))) {
      segments = tree, segment = document.createDocumentFragment()
      for (i = 0, length = segments.length; i < length; i++) {
        if (typeof segments[i] == string) segments[i] = create_text_node(segments[i])
        append_child(segment, segments[i])
      }
      return segment
    }
    tree = tree[0]
    if (is_array(tree) && typeof tree[0] == string && is_array(tree[2])) return create(tree[0], tree[1], tree[2])
    return tree
  }
}

html = new html().html

function process (state, relay) {
  relay.b('change', function (args) {
    if (!state.test) state.test = args
  })
}

const start = {}

function load (state, relay) {
  Object.assign(state, start)
  relay('change', [])
}

function route (state, relay) {
  return html`<div id='xo'>${'wow'}</div>`
}

choo = new choo()
choo.use(process)
choo.load(load)
choo.route(route)
choo.mount('xo')