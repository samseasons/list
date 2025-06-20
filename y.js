const empty = '', falsee = false, truee = true

function len (a) {
  return a.length
}

function choo () {
  const v = 'value'
  const events = ['abort', 'click', 'error', 'keydown', 'load', 'loadend', 'message', 'mousedown', 'mousemove',
    'online', 'open', 'popstate', 'success', 'touchmove', 'upgradeneeded', 'versionchange'].map(e => 'on' + e)

  function value (node) {
    return node.value
  }

  function remove_attribute (node, name) {
    node.removeAttribute(name)
  }

  function set_attribute (node, name, value) {
    node.setAttribute(name, value)
  }

  function morph_attribute (new_node, old_node, name) {
    if (new_node[name] != old_node[name]) {
      old_node[name] = new_node[name]
      new_node[name] ? set_attribute(old_node, name, empty) : remove_attribute(old_node, name)
    }
  }

  function has_attribute_ns (node, name, value) {
    return node.hasAttributeNS(name, value)
  }

  function morph_input (new_node, old_node) {
    const new_value = value(new_node), old_value = value(old_node)
    morph_attribute(new_node, old_node, 'checked')
    morph_attribute(new_node, old_node, 'disabled')
    if (new_value != old_value || old_node.type == 'range') set_attribute(old_node, v, new_value)
    if (new_value == empty || !has_attribute_ns(new_node, empty, v)) remove_attribute(old_node, v)
  }

  function node_value (node) {
    return node.nodeValue
  }

  function morph_textarea (new_node, old_node) {
    const new_value = value(new_node)
    if (new_value != value(old_node)) {
      old_node.value = new_value
      const child = old_node.firstChild
      if (child && node_value(child) != new_value && !(new_value == empty && node_value(child) == old_node.placeholder)) {
        child.nodeValue = new_value
      }
    }
  }

  function replace_attributes (new_node, old_node) {
    let attr, attrs = new_node.attributes, i, name, namespace, val
    for (i = len(attrs); i--;) {
      attr = attrs[i]
      name = attr.name
      namespace = attr.namespaceURI
      val = value(attr)
      if (namespace) {
        name = attr.localName || name
        if (old_node.getAttributeNS(namespace, name) != val) old_node.setAttributeNS(namespace, name, val)
      } else {
        if (old_node.hasAttribute(name)) {
          if (old_node.getAttribute(name) != val) {
            val == empty ? remove_attribute(old_node, name) : set_attribute(old_node, name, val)
          }
        } else {
          set_attribute(old_node, name, val)
        }
      }
    }
    attrs = old_node.attributes
    for (i = len(attrs); i--;) {
      attr = attrs[i]
      if (attr.specified) {
        name = attr.name
        namespace = attr.namespaceURI
        if (namespace) {
          name = attr.localName || name
          if (!has_attribute_ns(new_node, namespace, name)) old_node.removeAttributeNS(namespace, name)
        } else if (!has_attribute_ns(new_node, empty, name)) {
          remove_attribute(old_node, name)
        }
      }
    }
  }

  function morph (new_node, old_node) {
    const new_type = new_node.nodeType, new_name = new_node.nodeName, new_value = node_value(new_node)
    if (new_type == 1) {
      replace_attributes(new_node, old_node)
    } else if (new_type == 3 || new_type == 8) {
      old_node.nodeValue = new_value
    }
    if (new_name == 'INPUT') {
      morph_input(new_node, old_node)
    } else if (new_name == 'OPTION') {
      morph_attribute(new_node, old_node, 'selected')
    } else if (new_name == 'TEXTAREA') {
      morph_textarea(new_node, old_node)
    }
    events.forEach(event => old_node[event] = new_node[event] ? new_node[event] : empty)
  }

  function same (a, b) {
    return a == b ? truee : a.id ? a.id == b.id : a.type == 3 ? node_value(a) == node_value(b) : falsee
  }

  function update (new_node, old_node) {
    for (let i = 0, offset = 0, new_child, old_child, j, length, match, morphed; ; i++) {
      new_child = new_node.childNodes[i - offset]
      old_node.a = old_node.childNodes
      old_child = old_node.a[i]
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
        match = empty
        length = len(old_node.a)
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
      new_node = new_node.d(new_node.e, new_node.b)
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
  }

  function relay () {
    this.a = function (event) {
      event = this.c[event]
      if (event) {
        const data = []
        let i, length = len(arguments)
        for (i = 1; i < length; i++) {
          data.push(arguments[i])
        }
        for (length = len(event), i = 0; i < length; i++) {
          listener = event[i]
          listener.apply(listener, data)
        }
      }
      return this
    }
    this.on = this.b = function (event, listener) {
      if (!this.c[event]) this.c[event] = []
      this.c[event].push(listener)
      return this
    }
    this.c = {}
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
    this.d = route
  }

  this.mount = function (node) {
    const self = this
    window.onpopstate = event => walk(self)
    ready(state => {
      if (state) state = state.href
      if (state) {
        history.pushState({}, empty, state)
        walk(self)
      }
    })
    self.c.forEach(func => func(self.e))
    self.f = document.getElementById(node)
    walk(self)
  }
}

function html (comments) {
  const var_attr = 0, text_attr = 1, open_attr = 2, close_attr = 3, attr = 4, attr_key = 5, attr_key_w = 6,
    attr_value_w = 7, attr_value = 8, attr_sq = 9, attr_dq = 10, attr_eq = 11, attr_break = 12, comment = 13,
    end_hyphen = /-$/, forward_slash = /^\//, lead_line = /^\n[\s]+/, lead_space = /^[\s]+/,
    multi_space = /[\n\s]+/g, not_whitespace = /[^\s"'=/]/, single_char_only = /\S/, start_comment = /^!--$/,
    trail_line = /\n[\s]+$/, trail_space = /[\s]+$/, whitespace = /\s/,  whitespace_only = /^\s*$/,
    word_or_hyphen = /[\w-]/, xmlns = /^xmlns($|:)/i, comment_tag = '!--', dq = '"', eq = '=', func = 'function',
    obj = 'object', p = ' ', slash = '/', sq = "'", string = 'string', style = 'style', styles = '/style'
  const bool_tags = ['autofocus', 'checked', 'defaultchecked', 'disabled', 'formnovalidate', 'indeterminate',
    'readonly', 'required', 'selected', 'willvalidate'], code_tags = ['code', 'pre'], text_tags = ['a', 'abbr', 'b',
    'bdi', 'bdo', 'br', 'cite', 'data', 'dfn', 'em', 'i', 'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'amp',
    'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr']
  const closes = RegExp('^(' + ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen',
    'link', 'meta', 'param', 'source', 'track', 'wbr'].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')

  function append_child (parent, node) {
    parent.appendChild(node)
  }

  function create_text_node (node) {
    return document.createTextNode(node)
  }

  function index (object, key) {
    return object.indexOf(key)
  }

  function is_array (object) {
    return Array.isArray(object)
  }

  function lower (string) {
    return string.toLowerCase()
  }

  function node_name (element) {
    return element.nodeName
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
    const namespace = props.namespace
    if (namespace) ns = namespace
    if (ns) {
      el = document.createElementNS(ns, tag)
    } else if (tag == comment_tag) {
      return document.createComment(props.comment)
    } else {
      el = document.createElement(tag)
    }
    let key, name = lower(node_name(el)), prop, value
    for (prop in props) {
      if (own(props, prop)) {
        key = lower(prop)
        value = props[prop]
        if (key == 'classname') key = prop = 'class'
        if (prop == 'htmlFor') prop = 'for'
        if (index(bool_tags, key) != -1) {
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
            prop == 'xlink:href' ? set_ns(el, empty, prop, value) : !test(xmlns, prop) && set_ns(el, p, prop, value)
          } else {
            el.setAttribute(prop, value)
          }
        }
      }
    }

    function append_branch (children) {
      if (!is_array(children)) return
      for (let branch, had = falsee, i = 0, length = len(children), node, value; i < length; i++) {
        node = children[i]
        if (is_array(node)) {
          append_branch(node)
          continue
        }
        if (typeof node == 'number' || typeof node == 'boolean' || typeof node == func || node instanceof Date ||
          node instanceof RegExp) node = node.toString()
        branch = el.childNodes[len(el.childNodes) - 1]

        function clean_branch () {
          had = falsee
          if (index(code_tags, name) != -1) return
          if (index(text_tags, name) == -1) {
            value = r(r(r(r(branch.nodeValue, lead_line, empty), multi_space, p), trail_line, empty), trail_space,
              empty)
            value == empty ? el.removeChild(branch) : branch.nodeValue = value
          } else {
            branch.nodeValue = r(r(r(r(r(branch.nodeValue, lead_line, i ? p : empty), lead_space, p),
              multi_space, p), trail_line, empty), trail_space, empty)
          }
        }

        if (typeof node == string) {
          had = truee
          if (branch && node_name(branch) == '#text') {
            branch.nodeValue += node
          } else {
            node = create_text_node(node)
            append_child(el, node)
            branch = node
          }
          if (i == length - 1) clean_branch()
        } else if (node && node.nodeType) {
          if (had) clean_branch()
          name = lower(node_name(node))
          append_child(el, node)
        }
      }
    }
    append_branch(children)
    return el
  }

  function concat (a, b) {
    return String(a) + String(b)
  }

  function string_func (x) {
    return typeof x == func || typeof x == obj || typeof x == string ? x : !x ? empty : concat(empty, x)
  }

  this.html = function (strings) {
    let arg, closed = falsee, i, j, key, length = len(strings), old_key, part, segment, segments, stack_length, stat,
      state = text_attr, text = empty, tree = [empty, {}, []]
    const arglen = len(arguments), parts = [], stack = [[tree, -1]]

    function parse (string) {
      if (state == attr_value_w) state = attr
      const result = []
      for (let char, i = 0, length = len(string), style_tag = falsee; i < length; i++) {
        char = string.charAt(i)
        if (state == text_attr && char == '<') {
          if (len(text)) result.push([text_attr, text])
          text = empty
          state = open_attr
          style_tag = falsee
        } else if (char == '>' && !(state == attr_sq || state == attr_dq) && state != comment) {
          if (state == open_attr && len(text)) {
            result.push([open_attr, text])
            text == style ? style_tag = truee : text == styles ? style_tag = falsee : empty
          } else if (state == attr_key) {
            result.push([attr_key, text])
          } else if (state == attr_value && len(text)) {
            result.push([attr_value, text])
          }
          if (state == text_attr && style_tag) {
            text += char
          } else {
            result.push([close_attr, closed])
            closed = falsee
            text = empty
          }
          state = text_attr
        } else if (state == comment && test(end_hyphen, text) && char == '-') {
          if (comments) result.push([attr_value, text.substr(0, len(text) - 1)])
          text = empty
          closed = truee
          state = text_attr
        } else if (state == open_attr && test(start_comment, text)) {
          if (comments) result.push([open_attr, text], [attr_key, 'comment'], [attr_eq])
          text = char
          state = comment
        } else if (state == open_attr && char == slash && len(text)) {
          closed = truee
        } else if (state == open_attr && test(whitespace, char)) {
          if (len(text)) result.push([open_attr, text])
          text == style ? style_tag = truee : text == styles ? style_tag = falsee : empty
          text = empty
          state = attr
        } else if (state == open_attr || state == text_attr || state == comment) {
          text += char
        } else if (state == attr && test(not_whitespace, char)) {
          state = attr_key
          text = char
        } else if (state == attr && test(whitespace, char)) {
          if (len(text)) result.push([attr_key, text])
          result.push([attr_break])
        } else if (state == attr_key && test(whitespace, char)) {
          result.push([attr_key, text])
          text = empty
          state = attr_key_w
        } else if (state == attr_key && char == eq) {
          result.push([attr_key, text], [attr_eq])
          text = empty
          state = attr_value_w
        } else if (state == attr_key && char == slash) {
          closed = truee
          text = empty
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
            closed = truee
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
          text = empty
          state = attr
        } else if (state == attr_value_w && !test(whitespace, char)) {
          state = attr_value
          i--
        } else if (state == attr_value || state == attr_sq || state == attr_dq) {
          text += char
        }
      }
      if (state == text_attr && len(text)) {
        result.push([text_attr, text])
        text = empty
      } else if (len(text) && (state == attr_value || state == attr_dq || state == attr_sq)) {
        result.push([attr_value, text])
        text = empty
      } else if (state == attr_key) {
        result.push([attr_key, text])
        text = empty
      }
      return result
    }

    for (i = 0; i < length; i++) {
      if (i < arglen - 1) {
        arg = arguments[i + 1]
        part = parse(strings[i])
        stat = parseInt(state)
        if (stat == attr_dq || stat == attr_sq || stat == attr_value_w) stat = attr_value
        if (stat == attr) stat = attr_key
        if (stat == open_attr) {
          if (text == slash) {
            part.push([open_attr, slash, arg])
            text = empty
          } else {
            part.push([open_attr, arg])
          }
        } else if (stat == comment && comments) {
          text += String(arg)
        } else if (stat != comment) {
          part.push([var_attr, stat, arg])
        }
        parts.push(...part)
      } else {
        parts.push(...parse(strings[i]))
      }
    }
    for (i = 0, length = len(parts); i < length; i++) {
      segments = stack[len(stack) - 1][0]
      part = parts[i]
      state = part[0]
      if (state == open_attr && test(forward_slash, part[1])) {
        stack_length = len(stack)
        if (stack_length > 1) {
          j = stack[stack_length - 1][1]
          stack.pop()
          stack[len(stack) - 1][0][2][j] = create(segments[0], segments[1], len(segments[2]) && segments[2])
        }
      } else if (state == open_attr) {
        segment = [part[1], {}, []]
        segments[2].push(segment)
        stack.push([segment, len(segments[2]) - 1])
      } else if (state == attr_key || (state == var_attr && part[1] == attr_key)) {
        key = empty
        for (length = len(parts); i < length; i++) {
          part = parts[i]
          if (part[0] == attr_key) {
            key = concat(key, part[1])
          } else if (part[0] == var_attr && part[1] == attr_key) {
            if (typeof part[2] == obj && !key) {
              for (old_key in part[2]) {
                if (own(part[2], old_key) && !segments[1][old_key]) segments[1][old_key] = part[2][old_key]
              }
            } else {
              key = concat(key, part[2])
            }
          } else {
            break
          }
        }
        if (part[0] == attr_eq) i++
        for (j = i, length = len(parts); i < length; i++) {
          part = parts[i]
          if (part[0] == attr_value || part[0] == attr_key) {
            if (!segments[1][key]) {
              segments[1][key] = string_func(part[1])
            } else if (part[1] != empty) {
              segments[1][key] = concat(segments[1][key], part[1])
            }
          } else if (part[0] == var_attr && (part[1] == attr_value || part[1] == attr_key)) {
            if (!segments[1][key]) {
              segments[1][key] = string_func(part[2])
            } else if (part[2] != empty) {
              segments[1][key] = concat(segments[1][key], part[2])
            }
          } else {
            if (key && !segments[1][key] && i == j && (part[0] == close_attr || part[0] == attr_break)) {
              segments[1][key] = lower(key)
            }
            if (part[0] == close_attr) i--
            break
          }
        }
      } else if (state == attr_key) {
        segments[1][part[1]] = truee
      } else if (state == var_attr && part[1] == attr_key) {
        segments[1][part[2]] = truee
      } else if (state == close_attr) {
        closed = part[1] || test(closes, segments[0])
        if (closed) {
          stack_length = len(stack)
          if (stack_length) {
            j = stack[stack_length - 1][1]
            stack.pop()
            stack[len(stack) - 1][0][2][j] = create(segments[0], segments[1], len(segments[2]) && segments[2])
          }
        }
      } else if (state == var_attr && part[1] == text_attr) {
        if (!!part[2]) concat(empty, part[2])
        is_array(part[2]) ? segments[2].push(...part[2]) : segments[2].push(part[2])
      } else if (state == text_attr) {
        segments[2].push(part[1])
      }
    }
    tree = tree[2]
    if (len(tree) > 1 && test(whitespace_only, tree[0])) tree.shift()
    if (len(tree) > 2 || (len(tree) == 2 && test(single_char_only, tree[1]))) {
      segment = document.createDocumentFragment()
      segments = tree
      for (i = 0, length = len(segments); i < length; i++) {
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

function array (a) {
  return Uint8Array.from(atob(a), a => a.charCodeAt())
}

function string (a) {
  return btoa(String.fromCharCode(...a))
}

function random (bytes=1) {
  return crypto.getRandomValues(new Uint8Array(bytes))
}

function random_string (chars=1) {
  return string(random((chars + 1) * 0.75)).slice(0, chars)
}

function blob (a) {
  return new Blob([a])
}

function file_reader () {
  return new FileReader()
}

function promise (a) {
  return new Promise(a)
}

function base (a) {
  return promise(resolve => {
    const b = file_reader()
    b.onloadend = a => resolve(b.result.slice(37))
    b.readAsDataURL(blob(a))
  })
}

function sabe (a) {
  return promise(resolve => {
    const b = file_reader()
    b.onloadend = a => resolve(b.result)
    b.readAsText(blob(a))
  })
}

async function encrypt (patch) {
  patch = array(await base(JSON.stringify(patch)))
  const length = len(patch)
  const rand = random(length)
  for (let i = 0; i < length; i++) {
    patch[i] ^= rand[i]
  }
  return [string(patch), string(rand)]
}

async function decrypt (patch, rand) {
  patch = array(patch)
  rand = array(rand)
  for (let i = 0, length = len(patch); i < length; i++) {
    patch[i] ^= rand[i]
  }
  return JSON.parse(await sabe(patch))
}

function cache () {
  const a = 'a', b = 'b', dot = '.', rw = 'readwrite', slash = '/', spa = ' ('

  window.IDBKeyRange = window.IDBKeyRange || window.msIDBKeyRange || window.webkitIDBKeyRange
  window.IDBTransaction = window.IDBTransaction || window.msIDBTransaction || window.webkitIDBTransaction
    || { READ_WRITE: rw }

  function indexed_db () {
    return window.indexedDB || window.mozIndexedDB || window.msIndexedDB || window.webkitIndexedDB
  }

  function open () {
    if (this.c) return
    return promise(resolve => {
      const request = indexed_db().open(empty, 1)
      request.onerror = error => {
        console.error(error, 'not open')
        resolve(falsee)
      }
      request.onsuccess = function () {
        this.c = c = request.result
        c.onversionchange = () => { if (c) c.close() }
        resolve(truee)
      }
      request.onupgradeneeded = function () {
        this.c = c = request.result
        const keys = [a, b]
        keys.forEach(a => { if (!c.objectStoreNames.contains(a)) c.createObjectStore(a) })
        resolve(truee)
      }
    })
  }

  function result_target (event) {
    return event.target.result
  }

  function get (store, name) {
    return promise(resolve => {
      try {
        const request = this.c.transaction(store, 'readonly').objectStore(store).get(name)
        request.onerror = error => resolve(falsee)
        request.onsuccess = event => resolve(result_target(event))
      } catch {
        resolve(falsee)
      }
    })
  }

  this.exists = async function (name) {
    await open()
    return await get(a, name) || falsee
  }

  this.is_file = async function (name) {
    await open()
    const key = await get(a, name)
    return key && key[0] == b || falsee
  }

  this.is_folder = async function (name) {
    await open()
    const key = await get(a, name)
    return key && key[0] == a || falsee
  }

  this.read = async function (name) {
    await open()
    const key = await get(a, name)
    return key && await get(b, key) || falsee
  }

  async function get_key (key) {
    key = key[0] + random_string(4)
    return await get(b, key) ? get_key(key) : key
  }

  function delete_key (store, key) {
    return promise(resolve => {
      try {
        const request = this.c.transaction(store, rw).objectStore(store).delete(key)
        request.onerror = error => resolve(falsee)
        request.onsuccess = event => resolve(result_target(event))
      } catch {
        resolve(falsee)
      }
    })
  }

  function join (split, separator) {
    return split.join(separator)
  }

  function separate (name, separator) {
    return name.split(separator)
  }

  function slice (split) {
    return split.slice(0, -1)
  }

  function parent (name) {
    return join(slice(separate(name, slash)), slash)
  }

  function last (string) {
    return string.slice(-1)[0]
  }

  async function update_parent (name, filter=truee) {
    const folder = parent(name)
    name = last(separate(name, slash))
    const key = await get(a, folder)
    if (key) {
      let files = await get(b, key) || []
      files = filter ? files.filter(f => f != name) : files.concat(name)
      return await add(folder, key, files)
    }
  }

  async function delete_file (key, name) {
    await delete_key(a, name)
    await delete_key(b, key)
    if (len(separate(name, slash)) < 2) return truee
    return await update_parent(name)
  }

  this.delete_file = async function (name) {
    await open()
    const key = await get(a, name)
    if (key && key[0] == b) delete_file(key, name)
    return falsee
  }

  this.delete_folder = async function (name) {
    await open()
    const key = await get(a, name)
    if (key && key[0] == a) {
      const files = await get(b, key)
      for (let file, i = 0, length = len(files), key; i < length; i++) {
        file = name + slash + files[i]
        key = await get(a, file)
        if (key && key[0] == a) await this.delete_folder(file)
        await delete_key(a, file)
        await delete_key(b, key)
      }
      return await delete_file(key, name)
    }
    return falsee
  }

  function delete_database (db, d) {
    return promise(resolve => {
      const request = db.deleteDatabase(d.name)
      request.onerror = error => resolve(falsee)
      request.onsuccess = event => resolve(truee)
    })
  }

  this.delete_stores = async function () {
    const db = indexed_db()
    const dbs = await db.databases()
    let deleted = truee
    for (let i = 0, length = len(dbs); i < length; i++) {
      deleted = await delete_database(db, dbs[i]) && deleted
    }
    return deleted
  }

  function length (value) {
    let total = 0, type = typeof value
    if (type == 'string') {
      total += len(value) * 2
    } else if (type == 'boolean') {
      total += 4
    } else if (type == 'number') {
      total += 8
    } else if (type == 'bigint') {
      total += 24
    } else if (type == 'symbol') {
      total += len(value.toString()) * 2
    } else if (!value) {
      total += 2
    } else if (ArrayBuffer.isView(value)) {
      total += value.byteLength + 32
    } else if (value instanceof Array) {
      total += array_length(value) + 32
    } else if (type == 'object' && value) {
      total += object_length(value) + 56
    } else {
      total += 16
    }
    return total
  }

  function array_length (array) {
    let value, total = 0
    for (value of array) {
      total += length(value)
    }
    return total
  }

  function object_length (object) {
    let key, total = 0
    for (key in object) {
      total += length(key) + length(object[key])
    }
    return total
  }

  function update (name, used, space) {
    while (len(name) > 0) {
      if (name in used) used[name] += space
      name = parent(name)
    }
    return used
  }

  this.space = async function (name, first=truee, used={}) {
    await open()
    if (first) used[name] = 0
    const key = await get(a, name)
    const files = await get(b, key)
    const name_length = length(name) + length(key) * 2
    if (key[0] == b) {
      return update(name, used, name_length + length(files))
    } else {
      if (len(files) == 0) {
        return update(name, used, name_length + 1)
      } else {
        used = await update(name, used, name_length + length(files))
        name += slash
        for (let i = 0, file, length = len(files); i < length; i++) {
          file = name + files[i]
          if (first) used[file] = 0
          used = await this.space(file, falsee, used)
        }
        return used
      }
    }
  }

  function min (a, b) {
    return a < b ? a : b
  }

  this.available = async function (length) {
    const {usage, quota} = await navigator.storage.estimate()
    const free = min(quota * 0.2, 2147483648) - usage
    if (length) {
      const past = 10485761 + length - free
      if (past > 0) {
        console.error(past, 'bytes past limit')
        return falsee
      } else {
        return truee
      }
    }
    return free
  }

  function put (store, key, value) {
    return promise(resolve => {
      try {
        const request = this.c.transaction(store, rw).objectStore(store).put(key, value)
        request.onerror = error => {
          console.error(error, key, value)
          resolve(falsee)
        }
        request.onsuccess = event => resolve(result_target(event))
      } catch {
        resolve(falsee)
      }
    })
  }

  async function add (name, key, value) {
    const result = await put(a, key, name)
    return await put(b, value, key) && result || falsee
  }

  this.mkdir = async function (name, force=truee) {
    await open()
    if (await this.exists(name)) {
      if (!force) return truee
      name = await duplicate(name)
    }
    if (!await this.available(length(name) * 2 + 20)) return falsee
    const split = separate(name, slash)
    for (let files, folder, i = 0, key, length = len(split), subfolder, subsplit; i < length; i++) {
      subfolder = join(split.slice(0, i + 1), slash)
      if (!await get(a, subfolder)) {
        subsplit = separate(subfolder, slash)
        if (len(subsplit) > 1) {
          folder = join(slice(subsplit), slash)
          files = await this.read(folder) || []
          files.push(last(subsplit))
          key = await get_key(a)
          if (await add(folder, key, files) == falsee) return falsee
        }
        key = await get_key(a)
        await add(subfolder, key, [])
      }
    }
    return name
  }

  async function duplicate (name, dup=0) {
    if (!await get(a, name)) return name
    let close = ')', split = separate(name, slash)
    let file = last(split), folder = join(slice(split), slash)
    split = separate(file, dot)
    if (len(split) > 1) {
      close += dot + split.slice(-1)
      file = join(slice(split), dot)
    }
    const pre = separate(file, spa)
    name = folder + slash + (len(pre) > 1 ? join(slice(pre), spa) : file) + spa + dup + close
    return await duplicate(name, dup + 1)
  }

  this.write = async function (name, blob) {
    await open()
    if (!await this.available(length(blob) + length(name) * 2 + 20)) return falsee
    const folder = parent(name)
    name = await duplicate(name)
    let key = await get_key(b)
    if (!await add(name, key, blob)) return falsee
    key = await get(a, folder)
    if (!key) {
      if (!await this.mkdir(folder)) return falsee
      key = await get_key(b)
    }
    const files = await this.read(folder) || []
    files.push(last(separate(name, slash)))
    await add(folder, key, files)
    return name
  }

  this._move = async function (src, dst, file, move) {
    const src_key = await get(a, src)
    await update_parent(dst, falsee)
    if (move) {
      return await put(a, dst, src_key) && await delete_key(a, src)
    } else {
      const key = await get_key(file ? b : a)
      const content = await get(b, src_key)
      return await add(dst, key, content)
    }
  }

  function overlap (a, b) {
    let i = 0, length = len(a)
    while (i < length && a[i] == b[i]) i++
    return a.slice(0, i)
  }

  this._copy = async function (src, dst, move) {
    const base = overlap(src, dst)
    const dst_base = separate(dst, base)[1], src_base = separate(src, base)[1]
    const files = await this.read(src)
    await files.forEach(async f => { await this.copy(f, base + dst_base + separate(f, src_base)[1], falsee, move) })
  }

  this.copy = async function (src, dst, merge=falsee, move=falsee) {
    await open()
    if (!move && !await this.available((await this.space(src))[src])) return falsee
    const found = await this.read(dst)
    if (found && !merge) dst = await duplicate(dst)
    if (await this.is_file(src)) {
      await this._move(src, dst, truee, move)
    } else if (await this.is_folder(src)) {
      await this._copy(src, dst, move)
      if (found && merge) {
        if (move) await this.delete_folder(src)
      } else {
        await this._move(src, dst, falsee, move)
      }
    }
    return truee
  }

  this.move = async function (src, dst, merge=falsee) {
    return this.copy(src, dst, merge, truee)
  }
}

cache = new cache()

function bcdiff (past, next) {
  if (typeof next == 'string') next = next.split(empty)
  if (typeof past == 'string') past = past.split(empty)
  if (next.toString() == past.toString()) return [0]

  function trie (i, j, kf, leaf) {
    const a = next[++kf]
    if (typeof leaf == 'number') {
      const b = next[++leaf]
      const leaves = {}
      if (a == b) {
        leaves[b] = trie(i, j, kf, leaf)
      } else {
        leaves[a] = i
        leaves[b] = j
      }
      return leaves
    } else if (typeof leaf == 'object') {
      leaf[a] = a in leaf ? trie(i, j, kf, leaf[a]) : i
      return leaf
    }
  }

  const patch = [], tree = {}
  for (let a, b, branch, i = 0, length = len(next); i < length; i++) {
    a = next[i]
    b = next[i + 1]
    if (a in tree) {
      branch = tree[a]
      if (b in branch) {
        leaf = branch[b]
        branch[b] = trie(i, leaf, i, leaf)[b]
      } else {
        branch[b] = i
        tree[a] = branch
      }
    } else {
      branch = {}
      branch[b] = i
      tree[a] = branch
    }
  }

  function overlaps (a, b) {
    let i = 0, length = len(a)
    while (i < length && a[i] == b[i]) i++
    return i
  }

  function matches (branch, query, i=0) {
    let leaf = query[i]
    if (leaf in branch) {
      leaf = branch[leaf]
      if (typeof leaf == 'number') {
        return [leaf, overlaps(next.slice(leaf), query)]
      } else if (typeof leaf == 'object') {
        return matches(leaf, query, i + 1)
      }
    } else if (i > 2) {
      while (typeof branch != 'number') branch = Object.values(branch)[0]
      return [branch, overlaps(next.slice(branch), query)]
    }
    return falsee
  }

  function check (list, sublist, y) {
    if (len(sublist) == 0) return y
    for (let a = sublist[0], i = 0, length = len(list), sublength = len(sublist); i < length; i++) {
      if (list[i] === a) return check(list.slice(i + 1, i + sublength), sublist.slice(1), y ? y : i)
    }
    return -1
  }

  let buffer = [], buffer_length, i = 0, length = len(past), match, pos
  while (i < length) {
    match = matches(tree, past.slice(i))
    if (match) {
      buffer_length = len(buffer)
      if (buffer_length) {
        pos = check(next, buffer)
        if (pos) {
          patch.push(pos, buffer_length)
        } else {
          pos = check(patch, buffer)
          if (pos) {
            patch.push('b', pos, buffer_length)
          } else {
            patch.push('a', buffer_length, ...buffer)
          }
        }
        buffer = []
      }
      pos = match[0]
      match = match[1]
      patch.push(pos, match)
      i += match
    } else {
      buffer.push(past[i++])
    }
  }
  if (len(buffer)) patch.push(buffer)
  for (i = 0; i < patch.length; i++) {
    if (patch[i] == 'a') {
      length = patch[++i]
      if (length > 2) {
        buffer = patch.slice(++i, i + length)
        pos = check(patch.slice(i + length), buffer)
        if (pos) patch.splice()
      }
    }
  }
  return patch
}

function bcpatch (last, patch) {
  let diff, i = 0, length = len(patch), past = []
  while (i < length) {
    diff = patch[i++]
    if (typeof diff == 'number') {
      past.push(...last.slice(diff, diff + patch[i++]))
    } else if (diff == 'a') {
      diff = patch[i++]
      past.push(...patch.slice(i, i += diff))
    } else if (diff == 'b') {
      past.push(...patch.slice(patch[i], patch[i++] + patch[i++]))
    } else if (diff == 'c') {
    }
  }
  return past
}

function process (state, relay) {
  relay.b('change', function (a1, a2) {
    if (!state[a1]) state[a1] = a2
  })
}

function load (state, relay) {
  const loads = {}
  Object.assign(state, loads)
  relay('change', 'arg1', 'arg2')
}

function route (state, relay) {
  return html`<div id='xo'>${html`water`}</div>`
}

choo = new choo()
choo.use(process)
choo.load(load)
choo.route(route)
choo.mount('xo')