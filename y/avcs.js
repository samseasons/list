import { empty, falsee, len } from 'choo'

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

  function check (list, sublist, j=0) {
    if (len(sublist) == 0) return j
    for (let a = sublist[0], i = 0, length = len(list), sublength = len(sublist); i < length; i++) {
      if (list[i] === a) return check(list.slice(i + 1, i + sublength), sublist.slice(1), j ? j : i)
    }
    return -1
  }

  let buffer = [], i = 0, l, length = len(past), match, p, q = 0, r = []
  while (i < length) {
    match = matches(tree, past.slice(i))
    if (match) {
      l = len(buffer)
      if (l) {
        p = check(next, buffer)
        if (p > -1) {
          patch.push(p, l)
          r.push(q += 2)
        } else {
          patch.push('a', l, ...buffer)
          r.push(q += 2 + len(buffer))
        }
        buffer = []
      }
      p = match[0]
      match = match[1]
      patch.push(p, match)
      r.push(q += 2)
      i += match
    } else {
      buffer.push(past[i++])
    }
  }
  l = len(buffer)
  if (l) {
    patch.push('a', l, ...buffer)
    r.push(q += 2 + len(buffer))
  }
  let b, bs = {}, j, k = [], m
  for (i of r) {
    if (patch[i] == 'a') {
      b = patch.slice(i + 2, i + 2 + patch[i + 1])
      l = len(b)
      k = []
      while ((j = patch.indexOf(b[0], j + 1)) != -1) {
        if (patch.slice(j, j + l).toString() == b.toString()) {
          k.push(j)
        }
      }
      l = -1, m = -1
      for (j of k) {
        if (patch[j - 1] > l || i == j && patch[j - 1] == l) {
          l = patch[j - 1]
          m = j
        }
      }
      if (m >= 0 && m != i + 2) {
        bs[i] = [m, patch[i + 1]]
      }
    }
  }
  let cs = {}, ds = []
  i = 0, j = 0, length = len(patch), r = []
  while (i < length) {
    cs[i] = j
    if (i in bs) {
      buffer = ['b', ...bs[i]]
      ds.push(i)
      i += len(patch.slice(i, i + 2 + patch[i + 1]))
    } else {
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
  for (d of ds) {
    r[cs[d] + 1] = cs[r[cs[d] + 1] - 2] + 2
  }
  return r
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