export const empty = '', falsee = false, truee = true

export function len (a) {
  return a.length
}

export function choo () {
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

  function morph_attribute (next, past, name) {
    if (next[name] != past[name]) {
      past[name] = next[name]
      next[name] ? set_attribute(past, name, empty) : remove_attribute(past, name)
    }
  }

  function has_attribute_ns (node, name, value) {
    return node.hasAttributeNS(name, value)
  }

  function morph_input (next, past) {
    const next_value = value(next), past_value = value(past)
    morph_attribute(next, past, 'checked')
    morph_attribute(next, past, 'disabled')
    if (next_value != past_value || past.type == 'range') set_attribute(past, v, next_value)
    if (next_value == empty || !has_attribute_ns(next, empty, v)) remove_attribute(past, v)
  }

  function node_value (node) {
    return node.nodeValue
  }

  function morph_textarea (next, past) {
    next = value(next)
    if (next != value(past)) {
      past.value = next
      const child = past.firstChild
      if (child && node_value(child) != next && !(next == empty && node_value(child) == past.placeholder)) {
        child.nodeValue = next
      }
    }
  }
  

  function replace_attributes (next, past) {
    let attr, attrs = next.attributes, i, name, namespace, val
    for (i = len(attrs); i--;) {
      attr = attrs[i]
      name = attr.name
      namespace = attr.namespaceURI
      val = value(attr)
      if (namespace) {
        name = attr.localName || name
        if (past.getAttributeNS(namespace, name) != val) past.setAttributeNS(namespace, name, val)
      } else {
        if (past.hasAttribute(name)) {
          if (past.getAttribute(name) != val) {
            val == empty ? remove_attribute(past, name) : set_attribute(past, name, val)
          }
        } else {
          set_attribute(past, name, val)
        }
      }
    }
    attrs = past.attributes
    for (i = len(attrs); i--;) {
      attr = attrs[i]
      if (attr.specified) {
        name = attr.name
        namespace = attr.namespaceURI
        if (namespace) {
          name = attr.localName || name
          if (!has_attribute_ns(next, namespace, name)) past.removeAttributeNS(namespace, name)
        } else if (!has_attribute_ns(next, empty, name)) {
          remove_attribute(past, name)
        }
      }
    }
  }

  function morph (next, past) {
    const next_type = next.nodeType, next_name = next.nodeName, next_value = node_value(next)
    if (next_type == 1) {
      replace_attributes(next, past)
    } else if (next_type == 3 || next_type == 8) {
      past.nodeValue = next_value
    }
    if (next_name == 'INPUT') {
      morph_input(next, past)
    } else if (next_name == 'OPTION') {
      morph_attribute(next, past, 'selected')
    } else if (next_name == 'TEXTAREA') {
      morph_textarea(next, past)
    }
    events.forEach(event => past[event] = next[event] ? next[event] : empty)
  }

  function same (a, b) {
    return a == b ? truee : a.id ? a.id == b.id : a.type == 3 ? node_value(a) == node_value(b) : falsee
  }

  function update (next, past) {
    for (let i = 0, j = 0, k, length, match, morphed, nexts, pasts; ; i++) {
      nexts = next.childNodes[i - j]
      past.a = past.childNodes
      pasts = past.a[i]
      if (!nexts && !pasts) {
        break
      } else if (!nexts) {
        past.removeChild(pasts)
        i--
      } else if (!pasts) {
        past.appendChild(nexts)
        j++
      } else if (same(nexts, pasts) || !nexts.id && !pasts.id) {
        morphed = walk(nexts, pasts)
        if (morphed != pasts) {
          past.replaceChild(morphed, pasts)
          j++
        }
      } else {
        match = falsee
        for (k = i, length = len(past.a); k < length; k++) {
          if (same(past.a[k], nexts)) {
            match = past.a[k]
            break
          }
        }
        if (match) {
          nexts = walk(nexts, match)
          if (match != nexts) j++
        } else {
          j++
        }
        past.insertBefore(nexts, pasts)
      }
    }
  }

  function walk (next, past) {
    if (next.f) {
      past = next.f
      next = next.d(next.e, next.b)
    }
    if (!past) {
      return next
    } else if (!next) {
      return
    } else if (next == past) {
      return past
    } else if (next.tagName != past.tagName) {
      return next
    }
    morph(next, past)
    update(next, past)
    return past
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
        let i, length, listener
        for (i = 1, length = len(arguments); i < length; i++) {
          data.push(arguments[i])
        }
        for (i = 0, length = len(event); i < length; i++) {
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
      attr_value_w = 7, attr_value = 8, attr_sq = 9, attr_dq = 10, attr_eq = 11, attr_break = 12, comment = 13
  const comment_tag = '!--', dq = '"', eq = '=', func = 'function', obj = 'object', p = ' ', slash = '/', sq = "'",
      string = 'string'
  const end_hyphen = /-$/, forward_slash = /^\//, lead_line = /^\n[\s]+/, lead_space = /^[\s]+/,
      multi_space = /[\n\s]+/g, not_whitespace = /[^\s"'=/]/, single_char = /\S/, start_comment = /^!--$/,
      trail_line = /\n[\s]+$/, trail_space = /[\s]+$/, whitespace = /\s/,  whitespace_only = /^\s*$/,
      word_hyphen = /[\w-]/, xmlns = /^xmlns($|:)/i
  const bool_tags = ['autofocus', 'checked', 'defaultchecked', 'disabled', 'formnovalidate', 'indeterminate',
    'readonly', 'required', 'selected', 'willvalidate'], code_tags = ['code', 'pre'], text_tags = ['a', 'amp', 'abbr',
    'b', 'bdi', 'bdo', 'br', 'cite', 'data', 'dfn', 'em', 'i', 'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's',
    'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr']
  const closes = RegExp('^(' + ['area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed', 'frame', 'hr',
    'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!--'].join('|')
    + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')

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

  function clean_branch (branch, el, name) {
    if (index(code_tags, name) == -1) {
      if (index(text_tags, name) == -1) {
        const v = r(r(r(r(branch.nodeValue, lead_line, empty), multi_space, p), trail_line, empty), trail_space, empty)
        v == empty ? el.removeChild(branch) : branch.nodeValue = v
      } else {
        branch.nodeValue = r(r(r(r(r(branch.nodeValue, lead_line, i ? p : empty), lead_space, p), multi_space, p),
          trail_line, empty), trail_space, empty)
      }
    }
    return falsee
  }

  function append_branch (branches, el, name) {
    if (!is_array(branches)) return
    for (let branch, had = falsee, i = 0, length = len(branches), node; i < length; i++) {
      node = branches[i]
      if (is_array(node)) {
        append_branch(node, el, name)
        continue
      }
      if (typeof node == 'boolean' || node instanceof Date || typeof node == func || typeof node == 'number' ||
        node instanceof RegExp) node = node.toString()
      branch = el.childNodes[len(el.childNodes) - 1]
      if (typeof node == string) {
        had = truee
        if (branch && node_name(branch) == '#text') {
          branch.nodeValue += node
        } else {
          branch = create_text_node(node)
          append_child(el, branch)
        }
        if (i == length - 1) had = clean_branch(branch, el, name)
      } else if (node && node.nodeType) {
        if (had) had = clean_branch(branch, el, name)
        append_child(el, node)
        name = lower(node_name(node))
      }
    }
  }

  function create (tag, props, branches) {
    let el
    const ns = props.namespace
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
        if (key == 'classname') {
          key = prop = 'class'
        } else if (prop == 'htmlFor') {
          prop = 'for'
        }
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
    append_branch(branches, el, name)
    return el
  }

  function concat (a, b) {
    return String(a) + String(b)
  }

  function string_func (x) {
    return typeof x == func || typeof x == obj || typeof x == string ? x : !x ? empty : concat(empty, x)
  }

  this.html = function (strings) {
    let closed = falsee, state = text_attr, text = empty

    function parse (string) {
      const result = []
      if (state == attr_value_w) state = attr
      for (let char, i = 0, length = len(string); i < length; i++) {
        char = string.charAt(i)
        if (state == text_attr && char == '<') {
          if (len(text)) result.push([text_attr, text])
          state = open_attr
          text = empty
        } else if (char == '>' && !(state == attr_sq || state == attr_dq) && state != comment) {
          if (state == open_attr && len(text)) {
            result.push([open_attr, text])
          } else if (state == attr_key) {
            result.push([attr_key, text])
          } else if (state == attr_value && len(text)) {
            result.push([attr_value, text])
          }
          result.push([close_attr, closed])
          closed = falsee
          state = text_attr
          text = empty
        } else if (state == comment && test(end_hyphen, text) && char == '-') {
          if (comments) result.push([attr_value, text.substr(0, len(text) - 1)])
          closed = truee
          state = text_attr
          text = empty
        } else if (state == open_attr && test(start_comment, text)) {
          if (comments) result.push([open_attr, text], [attr_key, 'comment'], [attr_eq])
          state = comment
          text = char
        } else if (state == open_attr && char == slash && len(text)) {
          closed = truee
        } else if (state == open_attr && test(whitespace, char)) {
          if (len(text)) result.push([open_attr, text])
          state = attr
          text = empty
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
          state = attr_key_w
          text = empty
        } else if (state == attr_key && char == eq) {
          result.push([attr_key, text], [attr_eq])
          state = attr_value_w
          text = empty
        } else if (state == attr_key && char == slash) {
          closed = truee
          state = attr
          text = empty
        } else if (state == attr_key) {
          text += char
        } else if ((state == attr || state == attr_key_w) && char == eq) {
          result.push([attr_eq])
          state = attr_value_w
        } else if ((state == attr || state == attr_key_w) && !test(whitespace, char)) {
          result.push([attr_break])
          if (test(word_hyphen, char)) {
            state = attr_key
            text += char
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
          state = attr
          text = empty
        } else if (state == attr_value_w && !test(whitespace, char)) {
          i--
          state = attr_value
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

    let arg, frag = [empty, {}, []], fragment, fragments, i, j, key, length, part, past, stacks, stat
    const arglen = len(arguments), parts = [], stack = [[frag, -1]]
    for (i = 0, length = len(strings); i < length; i++) {
      if (i < arglen - 1) {
        arg = arguments[i + 1]
        part = parse(strings[i])
        stat = parseInt(state)
        if (stat == attr_dq || stat == attr_sq || stat == attr_value_w) {
          stat = attr_value
        } else if (stat == attr) {
          stat = attr_key
        }
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
      fragments = stack[len(stack) - 1][0]
      part = parts[i]
      state = part[0]
      if (state == open_attr && test(forward_slash, part[1])) {
        stacks = len(stack)
        if (stacks > 1) {
          j = stack[stacks - 1][1]
          stack.pop()
          stack[len(stack) - 1][0][2][j] = create(fragments[0], fragments[1], len(fragments[2]) && fragments[2])
        }
      } else if (state == open_attr) {
        fragment = [part[1], {}, []]
        fragments[2].push(fragment)
        stack.push([fragment, len(fragments[2]) - 1])
      } else if (state == attr_key || (state == var_attr && part[1] == attr_key)) {
        key = empty
        for (length = len(parts); i < length; i++) {
          part = parts[i]
          if (part[0] == attr_key) {
            key = concat(key, part[1])
          } else if (part[0] == var_attr && part[1] == attr_key) {
            if (typeof part[2] == obj && !key) {
              for (past in part[2]) {
                if (own(part[2], past) && !fragments[1][past]) fragments[1][past] = part[2][past]
              }
            } else {
              key = concat(key, part[2])
            }
          } else {
            break
          }
        }
        if (part[0] == attr_eq) i++
        for (j = i; i < length; i++) {
          part = parts[i]
          if (part[0] == attr_key || part[0] == attr_value) {
            if (!fragments[1][key]) {
              fragments[1][key] = string_func(part[1])
            } else if (part[1] != empty) {
              fragments[1][key] = concat(fragments[1][key], part[1])
            }
          } else if (part[0] == var_attr && (part[1] == attr_key || part[1] == attr_value)) {
            if (!fragments[1][key]) {
              fragments[1][key] = string_func(part[2])
            } else if (part[2] != empty) {
              fragments[1][key] = concat(fragments[1][key], part[2])
            }
          } else {
            if (key && !fragments[1][key] && i == j && (part[0] == attr_break || part[0] == close_attr)) {
              fragments[1][key] = lower(key)
            }
            if (part[0] == close_attr) i--
            break
          }
        }
      } else if (state == attr_key) {
        fragments[1][part[1]] = truee
      } else if (state == var_attr && part[1] == attr_key) {
        fragments[1][part[2]] = truee
      } else if (state == close_attr) {
        if (part[1] || test(closes, fragments[0])) {
          stacks = len(stack)
          if (stacks) {
            j = stack[stacks - 1][1]
            stack.pop()
            stack[len(stack) - 1][0][2][j] = create(fragments[0], fragments[1], len(fragments[2]) && fragments[2])
          }
        }
      } else if (state == var_attr && part[1] == text_attr) {
        if (!!part[2]) concat(empty, part[2])
        is_array(part[2]) ? fragments[2].push(...part[2]) : fragments[2].push(part[2])
      } else if (state == text_attr) {
        fragments[2].push(part[1])
      }
    }
    frag = frag[2]
    if (len(frag) > 1 && test(whitespace_only, frag[0])) frag.shift()
    if (len(frag) > 2 || (len(frag) == 2 && test(single_char, frag[1]))) {
      fragment = document.createDocumentFragment()
      for (i = 0, length = len(frag); i < length; i++) {
        if (typeof frag[i] == string) frag[i] = create_text_node(frag[i])
        append_child(fragment, frag[i])
      }
      return fragment
    }
    frag = frag[0]
    if (is_array(frag) && typeof frag[0] == string && is_array(frag[2])) return create(frag[0], frag[1], frag[2])
    return frag
  }

}

export var html = new html().html

function cache () {
  const a = 'a', b = 'b', dot = '.', rw = 'readwrite', slash = '/', spa = ' ('

  window.IDBKeyRange ||= window.msIDBKeyRange || window.webkitIDBKeyRange
  window.IDBTransaction ||= window.msIDBTransaction || window.webkitIDBTransaction || { READ_WRITE: rw }

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

  function bytes (a) {
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

  function base (a) {
    return new TextEncoder().encode(a)
  }

  function sabe (a) {
    return new TextDecoder().decode(a)
  }

  this.encrypt = function (patch) {
    patch = base(JSON.stringify(patch))
    const length = len(patch)
    const rand = random(length)
    for (let i = 0; i < length; i++) {
      patch[i] ^= rand[i]
    }
    return [string(patch), string(rand)]
  }

  this.decrypt = function (patch, rand) {
    patch = bytes(patch)
    rand = bytes(rand)
    for (let i = 0, length = len(patch); i < length; i++) {
      patch[i] ^= rand[i]
    }
    return JSON.parse(sabe(patch))
  }

  async function get_key (key) {
    key = key[0] + random_string(4)
    return await get(b, key) ? await get_key(key) : key
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

  function join (list, separator) {
    return list.join(separator)
  }

  function last (list) {
    return list.slice(-1)[0]
  }

  function slice (string) {
    return string.slice(0, -1)
  }

  function split (string, separator) {
    return string.split(separator)
  }

  function parent (string) {
    return join(slice(split(string, slash)), slash)
  }

  async function update_parent (name, filter=truee) {
    const folder = parent(name)
    name = last(split(name, slash))
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
    if (len(split(name, slash)) < 2) return truee
    return await update_parent(name)
  }

  this.delete_file = async function (name) {
    await open()
    const key = await get(a, name)
    return (key && key[0] == b) ? await delete_file(key, name) : falsee
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

  function delete_database (d) {
    return promise(resolve => {
      const request = this.c.deleteDatabase(d)
      request.onerror = error => resolve(falsee)
      request.onsuccess = event => resolve(truee)
    })
  }

  this.delete_stores = async function () {
    await open()
    await this.c.transaction(a, rw).objectStore(a).clear()
    await this.c.transaction(b, rw).objectStore(b).clear()
    const dbs = await this.c.databases()
    let deleted = truee
    for (let i = 0, length = len(dbs); i < length; i++) {
      deleted = await delete_database(dbs[i].name) && deleted
    }
    return deleted
  }

  function length (value) {
    const type = typeof value
    if (type == 'boolean') {
      return 4
    } else if (type == 'number') {
      return 8
    } else if (type == 'bigint') {
      return 24
    } else if (type == 'string') {
      return len(value) * 2
    } else if (type == 'function') {
      return len(value.toString()) * 2
    } else if (type == 'symbol') {
      return len(value.toString()) * 2
    } else if (ArrayBuffer.isView(value)) {
      return value.byteLength + 32
    } else if (value instanceof Array) {
      return array_length(value) + 32
    } else if (type == 'object') {
      return object_length(value) + 56
    } else if (!value) {
      return 4
    } else {
      return 64
    }
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
    const l = length(name) + length(key) * 2
    if (key[0] == b) {
      return update(name, used, l + length(files))
    } else {
      if (len(files) == 0) {
        return update(name, used, l + 1)
      } else {
        used = update(name, used, l + length(files))
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

  this.available = async function (length) {
    const {usage, quota} = await navigator.storage.estimate()
    const free = quota / 10 - usage
    if (length) {
      const past = length - free
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
        const request = this.c.transaction(store, rw).objectStore(store).put(value, key)
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
    const result = await put(a, name, key)
    return await put(b, key, value) && result || falsee
  }

  this.mkdir = async function (name, force=falsee) {
    await open()
    if (await this.exists(name)) {
      if (!force) return truee
      name = await duplicate(name)
    }
    if (!await this.available(length(name) * 2 + 20)) return falsee
    const names = split(name, slash)
    for (let files, folder, i = 0, key, length = len(names), subfolder, subsplit; i < length; i++) {
      subfolder = join(names.slice(0, i + 1), slash)
      if (!await get(a, subfolder)) {
        subsplit = split(subfolder, slash)
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
    let close = ')', names = split(name, slash)
    let file = last(names), folder = join(slice(names), slash)
    names = split(file, dot)
    if (len(names) > 1) {
      close += dot + names.slice(-1)
      file = join(slice(names), dot)
    }
    const pre = split(file, spa)
    name = folder + slash + (len(pre) > 1 ? join(slice(pre), spa) : file) + spa + dup + close
    return await duplicate(name, dup + 1)
  }

  this.write = async function (name, blob, keep=falsee) {
    await open()
    if (!await this.available(length(blob) + length(name) * 2 + 20)) return falsee
    const exists = await this.exists(name)
    if (exists) {
      if (keep) {
        name = await duplicate(name)
      } else {
        return await put(b, exists, blob)
      }
    }
    let key = await get_key(b)
    if (!await add(name, key, blob)) return falsee
    const folder = parent(name)
    key = await get(a, folder)
    if (!key) {
      if (!await this.mkdir(folder)) return falsee
      key = await get_key(b)
    }
    const files = await this.read(folder) || []
    files.push(last(split(name, slash)))
    await add(folder, key, files)
    return name
  }

  this._move = async function (src, dst, file, move) {
    const src_key = await get(a, src)
    await update_parent(dst, falsee)
    if (move) {
      return await put(a, src_key, dst) && await delete_key(a, src)
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
    const dst_base = split(dst, base)[1]
    const src_base = split(src, base)[1]
    const files = await this.read(src)
    await files.forEach(async f => { await this.copy(f, base + dst_base + split(f, src_base)[1], falsee, move) })
  }

  this.copy = async function (src, dst, merge=falsee, move=falsee) {
    await open()
    if (!move && !await this.available((await this.space(src))[src] + 20)) return falsee
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
    return await this.copy(src, dst, merge, truee)
  }

}

export var cache = new cache()