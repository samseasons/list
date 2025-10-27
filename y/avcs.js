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
          patch.push(-1, l, ...buffer)
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
    patch.push(-1, l, ...buffer)
    r.push(q += 2 + l)
  }
  let bs = {}, h, j, k, m = [], p = []
  for (i of r) {
    if (patch[i] == -1) {
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
  let cs = {}, ds = {}, e
  i = 0, j = 0, length = len(patch), r = []
  while (i < length) {
    cs[i] = j + 1
    h = i
    l = j
    while (h-- > 0 && !(h in cs)) cs[h] = l--
    e = falsee
    if (i in bs) {
      let a, b, c = -1, d = falsee
      for (a of bs[i]) {
        b = a[0]
        if (p.indexOf(b) == -1 && (c == -1 || abs(b - i) < c)) {
          c = abs(b - i)
          d = a
        }
      }
      if (d) {
        buffer = [-2, ...d]
        ds[i] = d[0]
        e = truee
        i += len(patch.slice(i, i + 2 + patch[i + 1]))
      }
    }
    if (!e) {
      if (patch[i] == -1) {
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
  let b, c, d, i = 0, l = len(patch), past = []
  if (l == 1) return [...last.slice(patch[0])]
  while (i < l) {
    b = patch[i++]
    if (b >= 0) {
      past.push(...last.slice(b, b + patch[i++]))
    } else if (b == -1) {
      b = patch[i++]
      past.push(...patch.slice(i, i += b))
    } else if (b == -2) {
      b = patch[i++]
      past.push(...patch.slice(b, b + patch[i++]))
    } else if (b == -3) {
      b = patch[i++]
      c = patch.slice(i, b + i)
      d = patch[i++]
      past.push(...last.slice(d, d + patch[i++]).map((a, e) => a + c[e % b]))
    } else if (b == -4) {
      b = patch[i++]
      c = patch.slice(i, b + i)
      d = patch[i++]
      past.push(...Array(d).fill().map((a, e) => c[e % b]))
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

  function bytebits (bits) {
    const bytes = []
    for (let byte = 0, h, i = 0, l = len(bits); i < l; i++) {
      h = i % 8
      byte += bits[i] * 2 ** h
      if (h == 7 || i == l - 1) {
        bytes.push(byte)
        byte = 0
      }
    }
    return bytes
  }

  function bytenums (a) {
    let b = 0, c = a.length, d = [], e, f = 255
    while (b < c) {
      e = a[b++]
      d.push(e & f, e >> 8 & f, e >> 16 & f, e >> 24 & f)
    }
    return uint8(d)
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

  function bytes (a) {
    return Uint8Array.from(atob(a), a => a.charCodeAt())
  }

  async function encode (patch) {
    let i = 0, length = len(patch), p
    let bits = [], lens = [], nums = [], strs = []
    while (i < length) {
      p = patch[i++]
      if (typeof p == 'number') {
        bits.push(0)
        nums.push(p)
      } else if (typeof p == 'string') {
        bits.push(1)
        strs.push(p)
      }
    }
    bits = bytebits(bits)
    nums = bytenums(uint32(nums))
    lens = bytenums([len(bits), len(nums)])
    strs = bytes(await base(JSON.stringify(strs.join(''))))
    return uint8([...lens, ...bits, ...nums, ...strs])
  }

  function bitbytes (bytes) {
    const bits = []
    for (let byte, i = 0, l = len(bytes); i < l; i++) {
      byte = bytes[i]
      for (let j = 0; j < 8; j++) {
        bits.push(byte % 2)
        byte = uint32([byte / 2])[0]
      }
    }
    return bits
  }

  function numbytes (a) {
    let b = 0, c = a.length, d = []
    while (b < c) {
      d.push(a[b++] ^ a[b++] << 8 ^ a[b++] << 16 ^ a[b++] << 24 >> 0)
    }
    return uint32(d)
  }

  async function decode (bytes) {
    const len0 = numbytes(bytes.slice(0, 4))
    bytes = bytes.slice(4)
    const len1 = numbytes(bytes.slice(0, 4))
    bytes = bytes.slice(4)
    const bits = bitbytes(bytes.slice(0, len0))
    bytes = bytes.slice(len0)
    const nums = new Int32Array(numbytes(bytes.slice(0, len1)))
    const strs = JSON.parse(await sabe(bytes.slice(len1)))
    const patch = []
    let bit, i = 0, j = 0
    for (bit of bits) {
      patch.push(bit == 0 ? nums[i++] : strs[j++])
    }
    return patch
  }

  function random (bytes=1) {
    return crypto.getRandomValues(uint8(bytes))
  }

  function string (a) {
    return btoa(String.fromCharCode(...a))
  }

  this.encrypt = async function (patch) {
    patch = bytes(await base(JSON.stringify(patch)))
    const length = len(patch)
    const rand = random(length)
    for (let i = 0; i < length; i++) {
      patch[i] ^= rand[i]
    }
    return [string(patch), string(rand)]
  }

  this.decrypt = async function (patch, rand) {
    patch = bytes(patch)
    rand = bytes(rand)
    for (let i = 0, length = len(patch); i < length; i++) {
      patch[i] ^= rand[i]
    }
    return JSON.parse(await sabe(patch))
  }

  this.diff = async function (past, next, bytes=truee, encrypt=falsee) {
    let patch = bcdiff(past, next)
    if (bytes) patch = await encode(patch)
    return encrypt ? this.encrypt(patch) : patch
  }

  this.patch = async function (last, patch, bytes=truee, encrypt=falsee) {
    if (encrypt) patch = this.decrypt(patch, encrypt)
    if (bytes) patch = await decode(patch)
    const past = bcpatch(last, patch)
    return typeof past == 'object' ? past.join('') : past
  }

}