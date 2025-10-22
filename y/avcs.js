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
  let cs = {}, ds = {}
  i = 0, j = 0, length = len(patch), r = []
  while (i < length) {
    cs[i] = j + 1
    h = i
    l = j
    while (h-- > 0 && !(h in cs)) cs[h] = l--
    let found = falsee
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
        buffer = ['b', ...d]
        ds[i] = d[0]
        found = truee
        i += len(patch.slice(i, i + 2 + patch[i + 1]))
      }
    }
    if (!found) {
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
  let a, b, c, diff, i = 0, length = len(patch), past = []
  if (length == 1) return [...last.slice(patch[0])]
  while (i < length) {
    diff = patch[i++]
    if (typeof diff == 'number') {
      past.push(...last.slice(diff, diff + patch[i++]))
    } else if (diff == 'a') {
      diff = patch[i++]
      past.push(...patch.slice(i, i += diff))
    } else if (diff == 'b') {
      diff = patch[i++]
      past.push(...patch.slice(diff, diff + patch[i++]))
    } else if (diff == 'c') {
      a = patch[i++]
      b = patch[i++]
      c = patch[i++]
      diff = patch[i++]
      past.push(...last.slice(diff, diff + patch[i++]).map((d, e) => d + (e % 3 == 0 ? a : e % 3 == 1 ? b : c)))
    }
  }
  return past
}