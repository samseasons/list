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

  let buffer = [], i = 0, l, length = len(past), match, patch = [], pos, q = 0, r = []
  while (i < length) {
    match = matches(tree, past.slice(i), i)
    if (match) {
      l = len(buffer)
      if (l) {
        pos = check(next, buffer)
        if (pos >= 0) {
          patch.push(pos, l)
          r.push(q += 2)
        } else {
          patch.push('a', l, ...buffer)
          r.push(q += 2 + l)
        }
        buffer = []
      }
      pos = match[0]
      match = match[1]
      patch.push(pos, match)
      r.push(q += 2)
      i += match
    } else {
      buffer.push(past[i++])
    }
  }
  l = len(buffer)
  if (l) {
    patch.push('a', l, ...buffer)
    r.push(q += 2 + l)
  }
  let bs = {}, h, j, k, m = [], p = []
  for (i of r) {
    if (patch[i] == 'a') {
      buffer = patch.slice(i + 2, i + 2 + patch[i + 1])
      j = 0
      l = len(buffer)
      m = []
      while ((j = patch.indexOf(buffer[0], j + 1)) != -1) {
        if (patch.slice(j, j + l).toString() == buffer.toString()) m.push(j)
      }
      k = -1, l = -1
      for (j of m) {
        h = j - 2
        if (patch[h] > l || i == j && patch[h] == l) {
          l = patch[h]
          if (h != i) {
            k = j
            if (i in bs) {
              bs[i].push([k, patch[i + 1]])
            } else {
              bs[i] = [[k, patch[i + 1]]]
            }
          }
        }
      }
      if (k >= 0) {
        j = i + 2 + patch[i + 1]
        while (j >= i) p.unshift(j--)
      }
    }
  }
  let a, b, c, d, e
  let cs = {}, ds = {}
  i = 0, j = 0, length = len(patch), r = []
  while (i < length) {
    cs[i] = j + 1
    h = i
    l = j
    while (h-- > 0 && !(h in cs)) cs[h] = l--
    e = falsee
    if (i in bs) {
      c = -1, d = falsee
      for (a of bs[i]) {
        b = a[0]
        if (p.indexOf(b) == -1 && (c == -1 || abs(b - i) < c)) {
          c = abs(b - i)
          d = a
        }
      }
      if (d) {
        buffer = ['b', ...d]
        ds[i] = d[0]
        e = truee
        i += len(patch.slice(i, i + 2 + patch[i + 1]))
      }
    }
    if (!e) {
      if (patch[i] == 'a') {
        buffer = patch.slice(i, i + 2 + patch[i + 1])
      } else {
        buffer = patch.slice(i, i + 2)
      }
      i += len(buffer)
    }
    j += len(buffer)
    r.push(...buffer)
  }
  for (d in ds) {
    r[cs[d]] = cs[ds[d] - 2]
  }
  return r
}

function bcpatch (last, patch) {
  let a, b, c, i = 0, l = len(patch), past = []
  if (l == 1) return [...last.slice(patch[0])]
  while (i < l) {
    a = patch[i++]
    if (typeof a == 'number') {
      past.push(...last.slice(a, a + patch[i++]))
    } else if (a == 'a') {
      a = patch[i++]
      past.push(...patch.slice(i, i += a))
    } else if (a == 'b') {
      a = patch[i++]
      past.push(...patch.slice(a, a + patch[i++]))
    } else if (a == 'c') {
      a = patch[i++]
      b = patch.slice(i, i += a)
      past.push(...Array(patch[i++]).fill().map((d, c) => b[c % a]))
    } else if (a == 'd') {
      a = patch[i++]
      b = patch.slice(i, i += a)
      c = patch[i++]
      past.push(...last.slice(c, c + patch[i++]).map((d, c) => b[c % a] + d))
    }
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
    let b = 0, c = a.length, d = []
    while (b < c) {
      d.push(a[b++] ^ a[b++] << 1 ^ a[b++] << 2 ^ a[b++] << 3 ^ a[b++] << 4 ^ a[b++] << 5 ^ a[b++] << 6 ^ a[b++] << 7)
    }
    return uint8(d)
  }

  function bytebytes (a) {
    let b = 0, c = a.length, d = [], e, f = 255, g = 0, h = 1
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
    let b = 0, c = a.length, d = [], e, f = 255
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

  function lend (a) {
    let b, c = []
    while (a.length > 0) {
      b = [...a.slice(0, 4)]
      while (b[b.length - 1] == 0) b.pop()
      c.push(b)
      a = a.slice(4)
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
    lens = lend(bytenums([len(bits), len(nums)]))
    strs = base(strs.join(''))
    const lent = len(lens[0]) + 4 * len(lens[1])
    return uint8([lent, ...lens, ...bits, ...nums, ...strs])
  }

  function bitbytes (a) {
    let b = 0, c = a.length, d = [], e, f = 1
    while (b < c) {
      e = a[b++]
      d.push(e & f, e >> 1 & f, e >> 2 & f, e >> 3 & f, e >> 4 & f, e >> 5 & f, e >> 6 & f, e >> 7 & f)
    }
    return d
  }

  function bytesbytes (a) {
    let b = 1, c = a.length, d = [], e, f, g = a[0]
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
    let b = 0, c = a.length, d = []
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
    return typeof last == 'string' ? past.join('') : past
  }

}