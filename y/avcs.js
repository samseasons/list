import { empty, falsee, len } from './choo'

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