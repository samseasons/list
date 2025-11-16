import { empty, falsee, len, truee } from 'choo'

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
      leaf[a] = a in leaf ? trie(i, leaf[a], kf, leaf[a]) : i
      return leaf
    }
  }

  const tree = {}
  for (let a, b, branch, i = 0, leaf, length = len(next); i < length; i++) {
    a = next[i]
    b = next[i + 1]
    if (a in tree) {
      branch = tree[a]
      if (b in branch) {
        leaf = branch[b]
        branch[b] = {...trie(i, leaf, i, leaf)[b], ...leaf}
      } else {
        branch[b] = i
      }
    } else {
      branch = {}
      branch[b] = i
    }
    tree[a] = branch
  }

  function overlaps (a, b) {
    let i = 0, length = len(a)
    while (i < length && a[i] == b[i]) i++
    return i
  }

  function brs (branches, bs) {
    for (let branch of branches) {
      if (typeof branch == 'number') {
        bs.push(branch)
      } else {
        bs = brs(Object.values(branch), bs)
      }
    }
    return bs
  }

  function abs (a) {
    return a < 0 ? -a : a
  }

  function matches (branch, stick, i, j=0) {
    let leaf = stick[j]
    if (leaf in branch) {
      leaf = branch[leaf]
      if (typeof leaf == 'number') {
        return [leaf, overlaps(next.slice(leaf), stick)]
      } else if (typeof leaf == 'object') {
        return matches(leaf, stick, i, j + 1)
      }
    } else if (j > 2) {
      const bs = brs(Object.values(branch), [])
      let b, c = -1
      for (b of bs) {
        if (c == -1 || abs(b - i) < c) {
          branch = b
          c = abs(b - i)
        }
      }
      return [branch, overlaps(next.slice(branch), stick)]
    }
    return falsee
  }

  function check (list, sublist, j=0) {
    if (len(sublist) == 0) return j
    for (let a = sublist[0], i = 0, length = len(list), sublength = len(sublist); i < length; i++) {
      if (list[i] === a) return check(list.slice(i + 1, i + sublength), sublist.slice(1), j ? j : i)
    }
    return -1
  }

  function reps (str) {
    let repeats, section
    for (let g, h, i = 0, j, l = len(str), length, longest = 2, repeat, substr, substrs; i < l; i++) {
      for (j = i + 1; j <= l; j++) {
        substr = str.slice(i, j)
        k = j - i
        repeat = 0
        substrs = [...substr, ...substr]
        for (g = 2, h = (len(str) - i + 1) / k; g < h; g++) {
          substrs.push(...substr)
          if (check(str, substr) > -1) {
            repeat = g
          }
        }
        length = repeat * k
        if (length > longest) {
          longest = length
          repeats = repeat
          section = substr
        }
      }
    }
    return [repeats, section]
  }

  function comp (a) {
    const b = reps(a)
    if (falsee) {
      const c = []
      const d = a.indexOf(c)
      const e = len(c)
      let f = []
      if (d > 2) {
        f = [...comp(['c', a[1] + e, a.slice(2, d)])]
      }
      f.push('c', len(b[1]), ...b[1], b[0])
      if (e < len(a) - 2) {
        f.push(...comp(['c', a[1] + e, ...a.slice(d + e)]))
      }
      return f
    }
    a[0] = 'a'
    return a
  }
  
  let buffer = [], i = 0, l, length = len(past), match, p = [], patch = [], pos, q = 0
  while (i < length) {
    match = matches(tree, past.slice(i), i)
    if (match) {
      l = len(buffer)
      if (l) {
        pos = check(next, buffer)
        if (pos >= 0) {
          patch.push(pos, l)
          p.push(q += 2)
        } else {
          patch.push('a', l, ...buffer)
          p.push(q += 2 + l)
        }
        buffer = []
      }
      pos = match[0]
      match = match[1]
      patch.push(pos, match)
      p.push(q += 2)
      i += match
    } else {
      buffer.push(past[i++])
    }
  }
  l = len(buffer)
  if (l) {
    patch.push('a', l, ...buffer)
    p.push(q += 2 + l)
  }
  let as = {}, h, j, k, m = [], o = []
  for (i of p) {
    if (patch[i] == 'a') {
      buffer = patch.slice(i + 2, i + 2 + patch[i + 1])
      j = 0
      l = len(buffer)
      m = []
      while ((j = patch.indexOf(buffer[0], j + 1)) != -1) {
        if (j != i + 2 && patch.slice(j, j + l).toString() == buffer.toString()) m.push(j)
      }
      k = -1, l = -1
      if (len(m) == 0) {
        patch[i] = 'c'
      } else {
        for (j of m) {
          h = j - 2
          if (patch[h] > l || i == j && patch[h] == l) {
            l = patch[h]
            if (h != i) {
              k = j
              if (i in as) {
                as[i].push([k, patch[i + 1]])
              } else {
                as[i] = [[k, patch[i + 1]]]
              }
            }
          }
        }
      }
      if (k >= 0) {
        j = i + 2 + patch[i + 1]
        while (j >= i) o.unshift(j--)
      }
    }
  }
  let a, b, c, d, e
  let bs = {}, cs = {}
  i = 0, j = 0, length = len(patch), p = []
  while (i < length) {
    cs[i] = j + 1
    h = i
    k = j
    while (h-- > 0 && !(h in cs)) cs[h] = k--
    e = falsee
    if (i in as) {
      c = -1, d = falsee
      for (a of as[i]) {
        b = a[0]
        if (o.indexOf(b) == -1 && (c == -1 || abs(b - i) < c)) {
          c = abs(b - i)
          d = a
        }
      }
      if (d) {
        bs[i] = d[0]
        buffer = ['b', ...d]
        e = truee
        i += len(patch.slice(i, i + 2 + patch[i + 1]))
      }
    }
    if (!e) {
      h = patch[i]
      if (h == 'a') {
        buffer = patch.slice(i, i + 2 + patch[i + 1])
        buffer[1] += j + 2
      } else if (h == 'c') {
        buffer = patch.slice(i, i + 2 + patch[i + 1])
        buffer[1] += j + 2
        buffer = comp(buffer)
      } else {
        buffer = [a = h, a + patch[i + 1]]
      }
      i += len(buffer)
    }
    j += len(buffer)
    p.push(...buffer)
  }
  for (b in bs) {
    p[a = cs[b]] = c = cs[bs[b] - 2]
    p[a + 1] += c
  }
  return p
}

function bcpatch (last, p) {
  let b, c, d, i = 0, l = len(p), past = []
  if (l == 1) return [...last.slice(p[0])]

  function bc (a) {
    if (typeof a == 'number') {
      return last.slice(a, p[i++])
    } else if (a == 'a') {
      a = p[i++]
      return p.slice(i, i = a)
    } else if (a == 'b') {
      return p.slice(p[i++], p[i++])
    } else if (a == 'c') {
      a = p[i++]
      b = p.slice(i, i = a)
      return Array(p[i++]).fill().map((i, c) => b[c % a])
    } else if (a == 'd') {
      a = p.slice(p[i++], p[i++])
      b = len(a)
      return last.slice(p[i++], p[i++]).map((c, d) => a[d % b] + c)
    } else if (a == 'e') {
      a = p.slice(p[i++], p[i++])
      b = len(a)
      c = last.slice(p[i++], p[i++])
      d = len(c)
      return Array(p[i++]).fill().map((i, e) => a[e % b] + c[e % d])
    } else if (a == 'f') {
      a = p[i++]
      b = p[i++]
      return bc(p[i++]).slice(a, b)
    }
    return []
  }

  while (i < l) {
    past.push(...bc(p[i++]))
  }
  return past
}

function avcs () {

  function uint8 (a) {
    return new Uint8Array(a)
  }

  function uint32 (a) {
    return new Uint32Array(a)
  }

  function uint32_t (a) {
    return uint32([a])[0]
  }

  function bytebits (a) {
    let b = 0, c = len(a), d = []
    while (b < c) {
      d.push(a[b++] ^ a[b++] << 1 ^ a[b++] << 2 ^ a[b++] << 3 ^ a[b++] << 4 ^ a[b++] << 5 ^ a[b++] << 6 ^ a[b++] << 7)
    }
    return uint8(d)
  }

  function bytebytes (a) {
    let b = 0, c = len(a), d = [], e, f = 255, g = 0, h = 1
    while (b < c) {
      e = a[b++]
      if (e > g) g = e
      d.push(e & f, e >> 8 & f, e >> 16 & f, e >> 24 & f)
    }
    while (uint32_t(g /= 256) > 0) h++
    d = d.filter((a, b) => b % 4 < h)
    if (len(d)) d.unshift(h)
    return uint8(d)
  }

  function bytenums (a) {
    let b = 0, c = len(a), d = [], e, f = 255
    while (b < c) {
      e = a[b++]
      d.push(e & f, e >> 8 & f, e >> 16 & f, e >> 24 & f)
    }
    return uint8(d)
  }

  function base (a) {
    return new TextEncoder().encode(a)
  }

  function sabe (a) {
    return new TextDecoder().decode(a)
  }

  function lengths (a) {
    let b, c = []
    while (len(a) > 0) {
      b = [...a.slice(0, 4)]
      a = a.slice(4)
      while (b[len(b) - 1] == 0) b.pop()
      c.push(b)
    }
    return c
  }

  this.encode = function (patch) {
    let bits = [], lens = [], nums = [], strs = []
    for (let i = 0, length = len(patch), p; i < length; i++) {
      p = patch[i]
      if (typeof p == 'number') {
        bits.push(0)
        nums.push(p)
      } else if (typeof p == 'string') {
        bits.push(1)
        strs.push(p)
      }
    }
    bits = bytebits(bits)
    nums = bytebytes(uint32(nums))
    lens = lengths(bytenums([len(bits), len(nums)]))
    strs = base(strs.join(empty))
    const leng = len(lens[0]) + 4 * len(lens[1])
    return uint8([leng, ...lens, ...bits, ...nums, ...strs])
  }

  function bitbytes (a) {
    let b = 0, c = len(a), d = [], e, f = 1
    while (b < c) {
      e = a[b++]
      d.push(e & f, e >> 1 & f, e >> 2 & f, e >> 3 & f, e >> 4 & f, e >> 5 & f, e >> 6 & f, e >> 7 & f)
    }
    return d
  }

  function bytesbytes (a) {
    let b = 1, c = len(a), d = [], e, f, g = a[0]
    while (b < c) {
      e = 0, f = 0
      while (f < g) {
        e ^= a[b++] << f++ * 8
      }
      d.push(e)
    }
    return uint32(d)
  }

  function numbytes (a) {
    let b = 0, c = len(a), d = []
    while (b < c) {
      d.push(a[b++] ^ a[b++] << 8 ^ a[b++] << 16 ^ a[b++] << 24)
    }
    return uint32(d)
  }

  this.decode = function (bytes) {
    let b = 0
    let len0 = bytes[b++]
    let len1 = len0 % 4
    len0 = uint32_t(len0 / 4)
    len0 = numbytes([...bytes.slice(b, b += len0), ...uint8(4 - len0)])[0]
    len1 = numbytes([...bytes.slice(b, b += len1), ...uint8(4 - len1)])[0]
    const bits = bitbytes(bytes.slice(b, b += len0))
    const nums = bytesbytes(bytes.slice(b, b += len1))
    const strs = sabe(bytes.slice(b))
    const patch = []
    let i = 0, j = 0
    for (b of bits) {
      patch.push(b == 0 ? nums[i++] : strs[j++])
    }
    return patch
  }

  function random (bytes=1) {
    return crypto.getRandomValues(uint8(bytes))
  }

  function string (a) {
    return btoa(String.fromCharCode(...a))
  }

  this.encrypt = function (patch) {
    const length = len(patch)
    const rand = random(length)
    for (let i = 0; i < length; i++) {
      patch[i] ^= rand[i]
    }
    return [string(patch), string(rand)]
  }

  function bytes (a) {
    return Uint8Array.from(atob(a), a => a.charCodeAt())
  }

  this.decrypt = function (patch, rand) {
    patch = bytes(patch)
    rand = bytes(rand)
    for (let i = 0, length = len(patch); i < length; i++) {
      patch[i] ^= rand[i]
    }
    return patch
  }

  this.diff = function (past, next, bytes=truee, encrypt=falsee) {
    let patch = bcdiff(past, next)
    if (bytes || encrypt) patch = this.encode(patch)
    return encrypt ? this.encrypt(patch) : patch
  }

  this.patch = function (last, patch, bytes=truee, encrypt=falsee) {
    if (encrypt) patch = this.decrypt(patch, encrypt)
    if (bytes || encrypt) patch = this.decode(patch)
    const past = bcpatch(last, patch)
    return typeof last == 'string' ? past.join(empty) : past
  }

}