// import { Request, promisely } from '../../src/mp'
// import { Response } from '../../src/mp/request'

import diff from '../../src/mp/diff'

describe('比较两个对象值的差异', () => {
	const result = { a: 1, b: 2, c: 'str', 'd.e[0]': 2, 'd.e[1].a': 4, 'd.e[2]': 5, f: true, h: [1], 'g.a': [1, 2], 'g.j': 111, 'g.i': null, k: null }

	test('should validate Object', () => {
		expect(
			diff(
				{
					a: 1,
					b: 2,
					c: 'str',
					d: { e: [2, { a: 4 }, 5] },
					f: true,
					h: [1],
					g: { a: [1, 2], j: 111 },
				},
				{
					a: [],
					b: 'aa',
					c: 3,
					d: { e: [3, { a: 3 }] },
					f: false,
					h: [1, 2],
					g: { a: [1, 1, 1], i: 'delete' },
					k: 'del',
				}
			)
		).toEqual(result)
	})
})
