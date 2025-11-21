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
    for (let a = sublist[0], i = 0, l = len(list), m = len(sublist); i < l; i++) {
      if (list[i] === a) return check(list.slice(i + 1, i + m), sublist.slice(1), j ? j : i)
    }
    return -1
  }

  function reps (a) {
    let length, longest = 2, pos, repeats = 0, section
    for (let b, c, d, e, g, h, i = 0, j, k, l = len(a), m, r; i < l; i++) {
      for (j = i + 1; j <= l; j++) {
        b = a.slice(i, j)
        c = [...b]
        k = j - i
        r = 0
        for (g = 2, h = (l - i + 1) / k; g < h; g++) {
          c.push(...b)
          d = check(a, c)
          if (d < 0) {
            break
          }
          e = d
          r = g
        }
        m = r * k
        if (m > longest || (m == longest && r > repeats)) {
          length = k
          longest = m
          pos = e
          repeats = r
          section = b
        }
      }
    }
    return [length, section, repeats, pos, longest]
  }

  function comp (a, b) {
    let c = reps(a)
    let d = c[4]
    if (d >= 3) {
      const e = ['c', c[0] + b + 2, ...c[1], c[2]]
      c = c[3]
      if (c >= 3) {
        a[1] = c - 2
        e.unshift(...comp(a.slice(0, c), b))
      }
      c += d
      d = len(a)
      if (c < d) {
        e.push(...comp(['c', d - c, ...a.slice(c)], b))
      }
      return e
    }
    a[0] = 'a'
    a[1] += b + 2
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
  let a, as = {}, h, j, k, m = [], o = []
  for (i of p) {
    if (patch[i] == 'a') {
      a = i + 2
      buffer = patch.slice(a, a + patch[i + 1])
      j = 0
      l = len(buffer)
      m = []
      while ((j = patch.indexOf(buffer[0], j + 1)) != -1) {
        if (j != a && patch.slice(j, j + l).toString() == buffer.toString()) m.push(j)
      }
      k = -1
      if (len(m) == 0) {
        patch[i] = 'c'
      } else {
        for (j of m) {
          h = j - 2
          l = -1
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
        j = a + patch[i + 1]
        while (j >= i) o.unshift(j--)
      }
    }
  }
  let b, c, d, e
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
        c = d[0] - 3
        e = truee
        if (patch[c] == 'a') {
          bs[i] = d[0]
          buffer = ['b', ...d]
        } else {
          buffer = ['f', 0, patch[i + 1], c]
        }
        i += len(patch.slice(i, i + 2 + patch[i + 1]))
      }
    }
    if (!e) {
      h = patch[i]
      if (h == 'a') {
        buffer = patch.slice(i, i += 2 + patch[i + 1])
        buffer[1] += j + 2
      } else if (h == 'c') {
        buffer = patch.slice(i, i += 2 + patch[i + 1])
        buffer = comp(buffer, j)
      } else {
        buffer = [a = h, a + patch[i + 1]]
        i += len(buffer)
      }
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
      b = a - i
      b = p.slice(i, i = a, a = b)
      return Array(p[i++]).fill().map((i, c) => b[c % a])
    } else if (a == 'd') {
      a = p[i++]
      b = a - i
      b = p.slice(i, i = a, a = b)
      return last.slice(p[i++], p[i++]).map((c, d) => b[d % a] + c)
    } else if (a == 'e') {
      a = p[i++]
      b = a - i
      b = p.slice(i, i = a, a = b)
      c = last.slice(c = p[i++], d = p[i++], d -= c)
      return Array(p[i++]).fill().map((i, e) => b[e % a] + c[e % d])
    } else if (a == 'f') {
      a = i + 2
      i = p[a]
      b = bc(p[i++])
      i = a + 1
      return b.slice(p[i - 3], p[i - 2])
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
    for (let b = 0, l = len(nums) + len(strs); b < l; b++) {
      patch.push(bits[b] == 0 ? nums[i++] : strs[j++])
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