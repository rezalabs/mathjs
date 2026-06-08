import assert from 'assert'
import math from '../../../../src/defaultInstance.js'
const FibonacciHeap = math.FibonacciHeap

describe('FibonacciHeap', function () {
  describe('constructor', function () {
    it('should create heap', function () {
      const h = new FibonacciHeap()
      assert.strictEqual(h.size(), 0)
      assert.strictEqual(h.isEmpty(), true)
    })

    it('should have a property isFibonacciHeap', function () {
      const a = new FibonacciHeap()
      assert.strictEqual(a.isFibonacciHeap, true)
    })

    it('should have a property type', function () {
      const a = new FibonacciHeap()
      assert.strictEqual(a.type, 'FibonacciHeap')
    })

    it('should throw an error when called without new keyword', function () {
      assert.throws(function () { FibonacciHeap() }, /Constructor must be called with the new operator/)
    })
  })

  describe('insert', function () {
    it('should insert node when heap is empty', function () {
      const h = new FibonacciHeap()
      h.insert(1, 'v1')
      assert.strictEqual(h.size(), 1)
      assert.strictEqual(h.isEmpty(), false)
      // verify via extractMinimum
      const n = h.extractMinimum()
      assert.strictEqual(n.key, 1)
      assert.strictEqual(n.value, 'v1')
    })

    it('should insert two nodes and extract them in ascending order', function () {
      const h = new FibonacciHeap()
      h.insert(1, 'v1')
      h.insert(10, 'v10')
      assert.strictEqual(h.size(), 2)
      const n1 = h.extractMinimum()
      assert.strictEqual(n1.key, 1)
      assert.strictEqual(n1.value, 'v1')
      const n2 = h.extractMinimum()
      assert.strictEqual(n2.key, 10)
      assert.strictEqual(n2.value, 'v10')
    })

    it('should insert two nodes when heap is empty, reverse order', function () {
      const h = new FibonacciHeap()
      h.insert(10, 'v10')
      h.insert(1, 'v1')
      assert.strictEqual(h.size(), 2)
      const n1 = h.extractMinimum()
      assert.strictEqual(n1.key, 1)
      assert.strictEqual(n1.value, 'v1')
      const n2 = h.extractMinimum()
      assert.strictEqual(n2.key, 10)
      assert.strictEqual(n2.value, 'v10')
    })
  })

  describe('extractMinimum', function () {
    it('should extract node from heap, one node', function () {
      const h = new FibonacciHeap()
      h.insert(1, 'v1')
      const n = h.extractMinimum()
      assert.strictEqual(n.key, 1)
      assert.strictEqual(n.value, 'v1')
      assert.strictEqual(h.size(), 0)
      assert.strictEqual(h.isEmpty(), true)
    })

    it('should extract node from heap, two nodes', function () {
      const h = new FibonacciHeap()
      h.insert(1, 'v1')
      h.insert(10, 'v10')
      const n1 = h.extractMinimum()
      assert.strictEqual(n1.key, 1)
      assert.strictEqual(n1.value, 'v1')
      assert.strictEqual(h.size(), 1)
      // the remaining node should be extractable
      const n2 = h.extractMinimum()
      assert.strictEqual(n2.key, 10)
      assert.strictEqual(n2.value, 'v10')
    })

    it('should extract nodes in ascending order', function () {
      const h = new FibonacciHeap()
      h.insert(5, 'v5')
      h.insert(4, 'v4')
      h.insert(1, 'v1')
      h.insert(3, 'v3')
      h.insert(2, 'v2')
      // extract all nodes and verify ascending order
      const expected = [
        { key: 1, value: 'v1' },
        { key: 2, value: 'v2' },
        { key: 3, value: 'v3' },
        { key: 4, value: 'v4' },
        { key: 5, value: 'v5' }
      ]
      for (const exp of expected) {
        const n = h.extractMinimum()
        assert.strictEqual(n.key, exp.key)
        assert.strictEqual(n.value, exp.value)
      }
      assert.strictEqual(h.size(), 0)
      assert.strictEqual(h.isEmpty(), true)
    })
  })

  describe('remove', function () {
    it('should remove node, one node', function () {
      const h = new FibonacciHeap()
      const n = h.insert(1, 'v1')
      h.remove(n)
      assert.strictEqual(h.size(), 0)
      assert.strictEqual(h.isEmpty(), true)
    })

    it('should remove node with smaller key', function () {
      const h = new FibonacciHeap()
      h.insert(20, 'v20')
      const n = h.insert(1, 'v1')
      h.insert(10, 'v10')
      h.insert(5, 'v5')
      h.insert(4, 'v4')
      h.remove(n)
      assert.strictEqual(h.size(), 4)
      // remaining nodes should extract in ascending order: 4, 5, 10, 20
      const expected = [
        { key: 4, value: 'v4' },
        { key: 5, value: 'v5' },
        { key: 10, value: 'v10' },
        { key: 20, value: 'v20' }
      ]
      for (const exp of expected) {
        const node = h.extractMinimum()
        assert.strictEqual(node.key, exp.key)
        assert.strictEqual(node.value, exp.value)
      }
    })

    it('should remove node with largest key', function () {
      const h = new FibonacciHeap()
      h.insert(1, 'v1')
      h.insert(10, 'v10')
      const n = h.insert(20, 'v20')
      h.insert(5, 'v5')
      h.insert(4, 'v4')
      h.remove(n)
      assert.strictEqual(h.size(), 4)
      // remaining nodes should extract in ascending order: 1, 4, 5, 10
      const expected = [
        { key: 1, value: 'v1' },
        { key: 4, value: 'v4' },
        { key: 5, value: 'v5' },
        { key: 10, value: 'v10' }
      ]
      for (const exp of expected) {
        const node = h.extractMinimum()
        assert.strictEqual(node.key, exp.key)
        assert.strictEqual(node.value, exp.value)
      }
    })
  })

  it('should check whether empty', function () {
    const h = new FibonacciHeap()
    assert.strictEqual(h.isEmpty(), true)
    assert.strictEqual(h.size(), 0)

    h.insert(1, 'v1')
    h.insert(10, 'v10')
    assert.strictEqual(h.isEmpty(), false)
    assert.strictEqual(h.size(), 2)

    h.clear()
    assert.strictEqual(h.isEmpty(), true)
    assert.strictEqual(h.size(), 0)
  })
})
