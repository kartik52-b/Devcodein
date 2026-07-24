export const challenges = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    xp: 120,
    functionName: 'twoSum',
    description:
      'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume each input has exactly one solution.',
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' }
    ],
    starterCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    hints: [
      'Use a hash map to track values you have already seen.',
      'For each number, check whether its complement (target - num) exists in the map.',
      'Store each number with its index so you can return both indices in one pass.'
    ],
    solution:
      'Iterate once through the array while storing each value and its index in a hash map. Before storing, check if the complement already exists. This yields O(n) time and O(n) space.',
    discussion: [
      { author: 'Maya K.', message: 'The hash map approach avoids the O(n²) brute force nested loop.', time: '2h ago' },
      { author: 'Jordan L.', message: 'Watch out for duplicate values — the map handles them naturally by overwriting indices.', time: '5h ago' }
    ],
    testCases: [
      { label: 'Basic case', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { label: 'Middle pair', args: [[3, 2, 4], 6], expected: [1, 2] },
      { label: 'Duplicate values', args: [[3, 3], 6], expected: [0, 1] }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Medium',
    category: 'Stacks',
    xp: 180,
    functionName: 'isValid',
    description:
      'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if open brackets are closed by the same type in the correct order.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    starterCode: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (char in map) {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
    hints: [
      'Push opening brackets onto a stack as you scan the string.',
      'When you see a closing bracket, the top of the stack must be its matching opener.',
      'If the stack is empty at the end, every bracket was matched correctly.'
    ],
    solution:
      'Use a stack to track unmatched open brackets. On a closer, pop and verify the pair. Any mismatch or leftover stack items means the string is invalid.',
    discussion: [
      { author: 'Priya S.', message: 'A hash map for bracket pairs keeps the matching logic clean.', time: '1d ago' },
      { author: 'Chris W.', message: 'Edge case: an empty string should return true.', time: '2d ago' }
    ],
    testCases: [
      { label: 'Simple pair', args: ['()'], expected: true },
      { label: 'Mixed brackets', args: ['()[]{}'], expected: true },
      { label: 'Wrong closer', args: ['(]'], expected: false },
      { label: 'Nested valid', args: ['([{}])'], expected: true }
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Searching',
    xp: 140,
    functionName: 'binarySearch',
    description:
      'Given a sorted array of integers nums and an integer target, write a function to search target in nums. If target exists, return its index; otherwise return -1. You must write an algorithm with O(log n) runtime complexity.',
    examples: [
      { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4' },
      { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2', output: '-1' }
    ],
    starterCode: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    hints: [
      'Maintain left and right pointers that bound the search space.',
      'Compare the middle element to the target and discard half the array each step.',
      'Use mid = left + Math.floor((right - left) / 2) to avoid overflow in other languages.'
    ],
    solution:
      'Repeatedly halve the search interval by comparing nums[mid] to target. Move left or right until found or the interval is empty.',
    discussion: [
      { author: 'Elena R.', message: 'Classic divide-and-conquer — the sorted precondition is essential.', time: '3h ago' },
      { author: 'Sam T.', message: 'Off-by-one errors with left <= right vs left < right trip people up.', time: '6h ago' }
    ],
    testCases: [
      { label: 'Target found', args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { label: 'Target missing', args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { label: 'Single element hit', args: [[5], 5], expected: 0 },
      { label: 'Single element miss', args: [[5], 3], expected: -1 }
    ]
  },
  {
    id: 'max-depth-tree',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Hard',
    category: 'Trees',
    xp: 260,
    functionName: 'maxDepth',
    description:
      'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root down to the farthest leaf node.',
    examples: [
      { input: 'root = [3, 9, 20, null, null, 15, 7]', output: '3' },
      { input: 'root = [1, null, 2]', output: '2' }
    ],
    starterCode: `function TreeNode(val, left, right) {
  this.val = val ?? 0;
  this.left = left ?? null;
  this.right = right ?? null;
}

function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
    hints: [
      'The depth of an empty tree is 0.',
      'For a non-empty node, depth is 1 plus the max of its subtrees.',
      'DFS recursion is the most straightforward approach here.'
    ],
    solution:
      'Recursively compute left and right subtree depths. The answer at each node is 1 + max(leftDepth, rightDepth). Base case: null node returns 0.',
    discussion: [
      { author: 'Devon H.', message: 'BFS level-order traversal also works if you prefer iterative solutions.', time: '4h ago' },
      { author: 'Lina M.', message: 'Remember to handle null children — they contribute 0 to the depth.', time: '1d ago' }
    ],
    testCases: [
      {
        label: 'Balanced tree',
        args: [{ val: 3, left: { val: 9 }, right: { val: 20, left: { val: 15 }, right: { val: 7 } } }],
        expected: 3
      },
      { label: 'Skewed tree', args: [{ val: 1, right: { val: 2 } }], expected: 2 },
      { label: 'Empty tree', args: [null], expected: 0 }
    ]
  }
];

export const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

export const categories = ['All', ...new Set(challenges.map((c) => c.category))];
