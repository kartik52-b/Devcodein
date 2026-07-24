import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const algorithms = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    type: 'Sort',
    complexity: { best: 'O(N)', avg: 'O(N²)', worst: 'O(N²)', space: 'O(1)' },
    desc: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Small values "bubble" to the top.'
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    type: 'Sort',
    complexity: { best: 'O(N log N)', avg: 'O(N log N)', worst: 'O(N²)', space: 'O(log N)' },
    desc: 'Selects a "pivot" element and partitions the other elements into two sub-arrays, according to whether they are less than or greater than the pivot.'
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    type: 'Sort',
    complexity: { best: 'O(N log N)', avg: 'O(N log N)', worst: 'O(N log N)', space: 'O(N)' },
    desc: 'A divide-and-conquer algorithm that divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.'
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    type: 'Sort',
    complexity: { best: 'O(N²)', avg: 'O(N²)', worst: 'O(N²)', space: 'O(1)' },
    desc: 'Divides the input list into two parts: a sorted sublist at the left and an unsorted sublist at the right. Repeatedly finds the minimum element and swaps it.'
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    type: 'Sort',
    complexity: { best: 'O(N)', avg: 'O(N²)', worst: 'O(N²)', space: 'O(1)' },
    desc: 'Builds the final sorted array one item at a time by inserting elements into their correct position within the already-sorted part.'
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    type: 'Sort',
    complexity: { best: 'O(N log N)', avg: 'O(N log N)', worst: 'O(N log N)', space: 'O(1)' },
    desc: 'Visualizes sorting by building a max-heap structure first, then repeatedly extracting the maximum element from the heap and restoring the heap property.'
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    type: 'Search',
    complexity: { best: 'O(1)', avg: 'O(log N)', worst: 'O(log N)', space: 'O(1)' },
    desc: 'Quickly searches a sorted array by repeatedly dividing the search interval in half. The search range narrows until the target is found.'
  },
  {
    id: 'dfs',
    name: 'DFS (Depth-First Search)',
    type: 'Graph',
    complexity: { best: 'O(V + E)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    desc: 'Traverses tree/graph nodes by exploring as deep as possible along each branch before backtracking. Leverages an implicit recursion stack.'
  },
  {
    id: 'bfs',
    name: 'BFS (Breadth-First Search)',
    type: 'Graph',
    complexity: { best: 'O(V + E)', avg: 'O(V + E)', worst: 'O(V + E)', space: 'O(V)' },
    desc: 'Traverses tree/graph nodes level-by-level outwards from the start node. Uses a FIFO queue to track the frontier nodes.'
  }
];

const baseArray = [45, 12, 85, 32, 60, 22, 9, 70];
const sortedBaseArray = [9, 12, 22, 32, 45, 60, 70, 85];

function AlgorithmVisualizerPage() {
  const [selectedAlgo, setSelectedAlgo] = useState('bubble-sort');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  
  const [frames, setFrames] = useState([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);

  const currentAlgo = algorithms.find(a => a.id === selectedAlgo) || algorithms[0];
  const timerRef = useRef(null);

  // Generate frames whenever selected algorithm changes
  useEffect(() => {
    stopPlayback();
    generateFrames(selectedAlgo);
  }, [selectedAlgo]);

  // Effect to manage automated play timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const interval = 1000 / playSpeed;
    timerRef.current = setInterval(() => {
      setCurrentFrameIdx((prev) => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, frames, playSpeed]);

  const stopPlayback = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    stopPlayback();
    setCurrentFrameIdx(0);
  };

  const stepForward = () => {
    stopPlayback();
    if (currentFrameIdx < frames.length - 1) {
      setCurrentFrameIdx(prev => prev + 1);
    }
  };

  const stepBackward = () => {
    stopPlayback();
    if (currentFrameIdx > 0) {
      setCurrentFrameIdx(prev => prev - 1);
    }
  };

  // Generation functions for all 9 algorithms
  const generateFrames = (algoId) => {
    const list = [...baseArray];
    const generated = [];

    // Push initial state
    if (algoId === 'binary-search') {
      const sortedList = [...sortedBaseArray];
      generated.push({
        array: sortedList,
        low: 0,
        high: sortedList.length - 1,
        mid: -1,
        found: false,
        comparedIdx: -1,
        explanation: 'Initial sorted array. Target to search: 60.',
        stepLabel: 'Setup search interval'
      });

      let low = 0;
      let high = sortedList.length - 1;
      let target = 60;
      let found = false;

      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        generated.push({
          array: sortedList,
          low,
          high,
          mid,
          found: false,
          explanation: `Calculate midpoint: index ${mid} (value ${sortedList[mid]}). Compare with target 60.`,
          stepLabel: `Mid calculated at idx ${mid}`
        });

        if (sortedList[mid] === target) {
          found = true;
          generated.push({
            array: sortedList,
            low,
            high,
            mid,
            found: true,
            explanation: `Match found! Value 60 exists at index ${mid}.`,
            stepLabel: 'Target Found!'
          });
          break;
        } else if (sortedList[mid] < target) {
          low = mid + 1;
          generated.push({
            array: sortedList,
            low,
            high,
            mid,
            found: false,
            explanation: `Value ${sortedList[mid]} is less than target 60. Shift left boundary (low) to index ${low}.`,
            stepLabel: `Low shifted to ${low}`
          });
        } else {
          high = mid - 1;
          generated.push({
            array: sortedList,
            low,
            high,
            mid,
            found: false,
            explanation: `Value ${sortedList[mid]} is greater than target 60. Shift right boundary (high) to index ${high}.`,
            stepLabel: `High shifted to ${high}`
          });
        }
      }

      if (!found) {
        generated.push({
          array: sortedList,
          low,
          high,
          mid: -1,
          found: false,
          explanation: 'Target 60 does not exist in array (low crossed high).',
          stepLabel: 'Search Exhausted'
        });
      }
    } else if (algoId === 'dfs' || algoId === 'bfs') {
      // Tree/Graph Node layout
      // DFS/BFS traversal animation frames
      generated.push({
        visited: [],
        frontier: [50],
        active: null,
        explanation: 'Initialize traversal at root node 50.',
        stepLabel: 'Root Initialization'
      });

      if (algoId === 'dfs') {
        // Pre-order sequence: 50 -> 20 -> 10 -> 30 -> 80 -> 70 -> 90
        const seq = [50, 20, 10, 30, 80, 70, 90];
        const stackStates = [
          [50], 
          [80, 20], 
          [80, 30, 10], 
          [80, 30], 
          [80], 
          [90, 70], 
          [90],
          []
        ];
        
        for (let i = 0; i < seq.length; i++) {
          generated.push({
            visited: seq.slice(0, i + 1),
            frontier: stackStates[i + 1] || [],
            active: seq[i],
            explanation: `DFS visits node ${seq[i]} and pushes its children to the recursion Stack.`,
            stepLabel: `Visit node ${seq[i]}`
          });
        }
      } else {
        // BFS order sequence: 50 -> 20 -> 80 -> 10 -> 30 -> 70 -> 90
        const seq = [50, 20, 80, 10, 30, 70, 90];
        const queueStates = [
          [50],
          [20, 80],
          [80, 10, 30],
          [10, 30, 70, 90],
          [30, 70, 90],
          [70, 90],
          [90],
          []
        ];

        for (let i = 0; i < seq.length; i++) {
          generated.push({
            visited: seq.slice(0, i + 1),
            frontier: queueStates[i + 1] || [],
            active: seq[i],
            explanation: `BFS visits node ${seq[i]} level-by-level, queueing its unvisited neighbors.`,
            stepLabel: `Visit node ${seq[i]}`
          });
        }
      }
    } else {
      // Sorting algorithms
      generated.push({
        array: [...list],
        compared: [],
        swapped: [],
        pivot: -1,
        sorted: [],
        explanation: 'Initial unsorted array. Prepare sorting indexes.',
        stepLabel: 'Unsorted state'
      });

      if (algoId === 'bubble-sort') {
        const arr = [...list];
        const n = arr.length;
        const sorted = [];

        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            generated.push({
              array: [...arr],
              compared: [j, j + 1],
              swapped: [],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Compare adjacent elements at index ${j} (${arr[j]}) and index ${j+1} (${arr[j+1]}).`,
              stepLabel: `Compare index ${j} & ${j+1}`
            });

            if (arr[j] > arr[j + 1]) {
              // Swap
              const temp = arr[j];
              arr[j] = arr[j + 1];
              arr[j + 1] = temp;
              generated.push({
                array: [...arr],
                compared: [j, j + 1],
                swapped: [j, j + 1],
                pivot: -1,
                sorted: [...sorted],
                explanation: `Swap elements: ${arr[j+1]} is larger than ${arr[j]}.`,
                stepLabel: `Swap index ${j} & ${j+1}`
              });
            }
          }
          sorted.push(n - i - 1);
          generated.push({
            array: [...arr],
            compared: [],
            swapped: [],
            pivot: -1,
            sorted: [...sorted],
            explanation: `Element at index ${n-i-1} (${arr[n-i-1]}) is now placed in its sorted position.`,
            stepLabel: `Index ${n-i-1} Sorted`
          });
        }
        // Last element sorted
        sorted.push(0);
        generated.push({
          array: [...arr],
          compared: [],
          swapped: [],
          pivot: -1,
          sorted: [...sorted],
          explanation: 'Sorting complete! Array is sorted.',
          stepLabel: 'Sorted state'
        });
      } else if (algoId === 'selection-sort') {
        const arr = [...list];
        const n = arr.length;
        const sorted = [];

        for (let i = 0; i < n; i++) {
          let minIdx = i;
          generated.push({
            array: [...arr],
            compared: [i],
            swapped: [],
            pivot: minIdx,
            sorted: [...sorted],
            explanation: `Assume minimum element is at index ${i} (${arr[i]}). Scan remaining array.`,
            stepLabel: `Init min index ${i}`
          });

          for (let j = i + 1; j < n; j++) {
            generated.push({
              array: [...arr],
              compared: [j],
              swapped: [],
              pivot: minIdx,
              sorted: [...sorted],
              explanation: `Scan: Compare element at index ${j} (${arr[j]}) with current minimum (${arr[minIdx]}).`,
              stepLabel: `Compare index ${j}`
            });

            if (arr[j] < arr[minIdx]) {
              minIdx = j;
              generated.push({
                array: [...arr],
                compared: [j],
                swapped: [],
                pivot: minIdx,
                sorted: [...sorted],
                explanation: `Found smaller element. Update minimum pointer to index ${j} (value ${arr[j]}).`,
                stepLabel: `New min index ${j}`
              });
            }
          }

          if (minIdx !== i) {
            const temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
            generated.push({
              array: [...arr],
              compared: [i, minIdx],
              swapped: [i, minIdx],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Swap elements at index ${i} and index ${minIdx} to place minimum at sorted boundary.`,
              stepLabel: `Swap index ${i} & ${minIdx}`
            });
          }
          sorted.push(i);
          generated.push({
            array: [...arr],
            compared: [],
            swapped: [],
            pivot: -1,
            sorted: [...sorted],
            explanation: `Index ${i} (${arr[i]}) is now fully sorted.`,
            stepLabel: `Index ${i} Sorted`
          });
        }
      } else if (algoId === 'insertion-sort') {
        const arr = [...list];
        const n = arr.length;
        const sorted = [0];

        for (let i = 1; i < n; i++) {
          let key = arr[i];
          let j = i - 1;
          generated.push({
            array: [...arr],
            compared: [i],
            swapped: [],
            pivot: i,
            sorted: [...sorted],
            explanation: `Pick key element at index ${i} (value ${key}). Search sorted portion to insert.`,
            stepLabel: `Key element ${key}`
          });

          while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            generated.push({
              array: [...arr],
              compared: [j],
              swapped: [j, j + 1],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Shift element at index ${j} (${arr[j]}) to index ${j+1} since it is larger than key (${key}).`,
              stepLabel: `Shift element ${arr[j]}`
            });
            j--;
          }
          arr[j + 1] = key;
          sorted.push(i);
          generated.push({
            array: [...arr],
            compared: [],
            swapped: [j + 1],
            pivot: -1,
            sorted: [...sorted],
            explanation: `Insert key element (${key}) at index ${j + 1}.`,
            stepLabel: `Inserted key at index ${j+1}`
          });
        }
        // Complete
        generated.push({
          array: [...arr],
          compared: [],
          swapped: [],
          pivot: -1,
          sorted: Array.from({length: n}, (_, k) => k),
          explanation: 'Sorting complete!',
          stepLabel: 'Sorted state'
        });
      } else if (algoId === 'quick-sort') {
        const arr = [...list];
        const n = arr.length;
        const sorted = [];

        const quicksortHelper = (low, high) => {
          if (low < high) {
            // Partition
            let pivotVal = arr[high];
            generated.push({
              array: [...arr],
              compared: [],
              swapped: [],
              pivot: high,
              sorted: [...sorted],
              explanation: `Partition range [${low}, ${high}]. Select pivot at high index ${high} (value ${pivotVal}).`,
              stepLabel: `Choose pivot ${pivotVal}`
            });

            let i = low - 1;
            for (let j = low; j < high; j++) {
              generated.push({
                array: [...arr],
                compared: [j],
                swapped: [],
                pivot: high,
                sorted: [...sorted],
                explanation: `Compare index ${j} (${arr[j]}) with pivot (${pivotVal}).`,
                stepLabel: `Compare idx ${j}`
              });

              if (arr[j] < pivotVal) {
                i++;
                const temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                generated.push({
                  array: [...arr],
                  compared: [i, j],
                  swapped: [i, j],
                  pivot: high,
                  sorted: [...sorted],
                  explanation: `Value at index ${j} is smaller than pivot. Increment boundary pointer to index ${i} and swap.`,
                  stepLabel: `Swap idx ${i} & ${j}`
                });
              }
            }
            // Swap pivot element into its boundary
            const temp = arr[i + 1];
            arr[i + 1] = arr[high];
            arr[high] = temp;
            
            const pIdx = i + 1;
            sorted.push(pIdx);
            
            generated.push({
              array: [...arr],
              compared: [pIdx, high],
              swapped: [pIdx, high],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Swap pivot element into its final sorted index position: ${pIdx}.`,
              stepLabel: `Placed pivot at idx ${pIdx}`
            });

            quicksortHelper(low, pIdx - 1);
            quicksortHelper(pIdx + 1, high);
          } else if (low === high) {
            sorted.push(low);
          }
        };

        quicksortHelper(0, n - 1);
        generated.push({
          array: [...arr],
          compared: [],
          swapped: [],
          pivot: -1,
          sorted: Array.from({length: n}, (_, k) => k),
          explanation: 'Sorting complete!',
          stepLabel: 'Sorted state'
        });
      } else if (algoId === 'merge-sort') {
        const arr = [...list];
        const n = arr.length;
        const sorted = [];

        // For merge sort, we log splits and merges step-by-step
        const merge = (low, mid, high) => {
          let left = arr.slice(low, mid + 1);
          let right = arr.slice(mid + 1, high + 1);
          let i = 0, j = 0, k = low;

          generated.push({
            array: [...arr],
            compared: [],
            swapped: [],
            pivot: -1,
            sorted: [...sorted],
            explanation: `Merging left sub-array [${low}...${mid}] and right sub-array [${mid+1}...${high}].`,
            stepLabel: `Merge range [${low}, ${high}]`
          });

          while (i < left.length && j < right.length) {
            generated.push({
              array: [...arr],
              compared: [low + i, mid + 1 + j],
              swapped: [],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Compare elements at index ${low+i} (${left[i]}) and index ${mid+1+j} (${right[j]}).`,
              stepLabel: `Compare elements`
            });

            if (left[i] <= right[j]) {
              arr[k] = left[i];
              i++;
            } else {
              arr[k] = right[j];
              j++;
            }
            generated.push({
              array: [...arr],
              compared: [k],
              swapped: [k],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Place smaller element (${arr[k]}) back into array at index ${k}.`,
              stepLabel: `Write element to index ${k}`
            });
            k++;
          }

          while (i < left.length) {
            arr[k] = left[i];
            generated.push({
              array: [...arr],
              compared: [k],
              swapped: [k],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Copy remaining left element (${arr[k]}) to index ${k}.`,
              stepLabel: `Copy remaining element`
            });
            i++;
            k++;
          }

          while (j < right.length) {
            arr[k] = right[j];
            generated.push({
              array: [...arr],
              compared: [k],
              swapped: [k],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Copy remaining right element (${arr[k]}) to index ${k}.`,
              stepLabel: `Copy remaining element`
            });
            j++;
            k++;
          }
        };

        const mergesortHelper = (low, high) => {
          if (low < high) {
            let mid = Math.floor((low + high) / 2);
            generated.push({
              array: [...arr],
              compared: [],
              swapped: [],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Split sub-array at index ${mid}. Recurse on range [${low}...${mid}] and [${mid+1}...${high}].`,
              stepLabel: `Split range [${low}, ${high}]`
            });
            mergesortHelper(low, mid);
            mergesortHelper(mid + 1, high);
            merge(low, mid, high);
          }
        };

        mergesortHelper(0, n - 1);
        generated.push({
          array: [...arr],
          compared: [],
          swapped: [],
          pivot: -1,
          sorted: Array.from({length: n}, (_, k) => k),
          explanation: 'Sorting complete!',
          stepLabel: 'Sorted state'
        });
      } else if (algoId === 'heap-sort') {
        const arr = [...list];
        const n = arr.length;
        const sorted = [];

        const heapify = (size, i) => {
          let largest = i;
          let left = 2 * i + 1;
          let right = 2 * i + 2;

          generated.push({
            array: [...arr],
            compared: [i],
            swapped: [],
            pivot: i,
            sorted: [...sorted],
            explanation: `Heapify check node at index ${i} (value ${arr[i]}).`,
            stepLabel: `Heapify index ${i}`
          });

          if (left < size) {
            generated.push({
              array: [...arr],
              compared: [left, largest],
              swapped: [],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Compare node ${largest} with left child node ${left} (${arr[left]}).`,
              stepLabel: `Compare with left child`
            });
            if (arr[left] > arr[largest]) {
              largest = left;
            }
          }

          if (right < size) {
            generated.push({
              array: [...arr],
              compared: [right, largest],
              swapped: [],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Compare node ${largest} with right child node ${right} (${arr[right]}).`,
              stepLabel: `Compare with right child`
            });
            if (arr[right] > arr[largest]) {
              largest = right;
            }
          }

          if (largest !== i) {
            const temp = arr[i];
            arr[i] = arr[largest];
            arr[largest] = temp;
            generated.push({
              array: [...arr],
              compared: [i, largest],
              swapped: [i, largest],
              pivot: -1,
              sorted: [...sorted],
              explanation: `Violated max-heap property. Swap parent (${arr[largest]}) with child node (${arr[i]}).`,
              stepLabel: `Swap idx ${i} & ${largest}`
            });
            heapify(size, largest);
          }
        };

        // Build heap
        generated.push({
          array: [...arr],
          compared: [],
          swapped: [],
          pivot: -1,
          sorted: [...sorted],
          explanation: 'Step 1: Convert the array representation into a binary Max-Heap structure.',
          stepLabel: 'Build Max-Heap'
        });

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
          heapify(n, i);
        }

        // Heap sort loop
        for (let i = n - 1; i > 0; i--) {
          const temp = arr[0];
          arr[0] = arr[i];
          arr[i] = temp;
          sorted.push(i);

          generated.push({
            array: [...arr],
            compared: [0, i],
            swapped: [0, i],
            pivot: -1,
            sorted: [...sorted],
            explanation: `Extract maximum element from heap root (index 0) and swap with last unsorted node at index ${i}.`,
            stepLabel: `Extract max element`
          });

          heapify(i, 0);
        }
        sorted.push(0);
        generated.push({
          array: [...arr],
          compared: [],
          swapped: [],
          pivot: -1,
          sorted: [...sorted],
          explanation: 'Sorting complete!',
          stepLabel: 'Sorted state'
        });
      }
    }

    setFrames(generated);
    setCurrentFrameIdx(0);
  };

  const activeFrame = frames[currentFrameIdx] || {
    array: baseArray,
    compared: [],
    swapped: [],
    pivot: -1,
    sorted: [],
    explanation: 'Setting up...',
    stepLabel: 'Setup'
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-6 lg:px-8 text-slate-100 max-w-7xl mx-auto">
      
      {/* Background glow animations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[15%] right-[10%] w-[38rem] h-[38rem] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[5%] w-[42rem] h-[42rem] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />
      </div>

      {/* Header Block */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 lg:p-10 mb-8 shadow-2xl relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs md:text-sm text-cyan-300 mb-4">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Dynamic Execution Visualizer Suite
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              Algorithm Visualizer
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-400 leading-relaxed">
              Step through sorting indices, search splits, and binary trees node-by-node. Trace algorithms using an interactive step-by-step timeline and study asymptotic complexities.
            </p>
          </div>
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-medium text-slate-200 transition-all duration-200 backdrop-blur shadow-lg hover:border-white/20 active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Main Visualizer Workspace */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] mb-8">
        
        {/* Left Side: Canvas & Controls */}
        <div className="glass rounded-[2rem] border border-white/10 p-5 md:p-6 shadow-xl flex flex-col justify-between">
          <div>
            
            {/* Top row controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block">Algorithm Mode</span>
                <div className="relative mt-1">
                  <select
                    value={selectedAlgo}
                    onChange={(e) => setSelectedAlgo(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2 text-sm font-semibold pr-10 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                  >
                    {algorithms.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* Speed Slider Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Play Speed</span>
                <select 
                  value={playSpeed} 
                  onChange={e => setPlaySpeed(Number(e.target.value))}
                  className="bg-slate-900 border border-white/10 text-slate-350 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1.0x (normal)</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2.0x (fast)</option>
                </select>
              </div>
            </div>

            {/* Animation Canvas Screen */}
            <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-6 min-h-[250px] flex items-center justify-center relative overflow-hidden mb-6">
              
              {/* Rendering Sort/Search bars */}
              {(currentAlgo.type === 'Sort' || currentAlgo.id === 'binary-search') && (
                <div className="flex items-end justify-center gap-2 h-44 w-full p-2 max-w-md">
                  {activeFrame.array?.map((val, idx) => {
                    const isCompared = activeFrame.compared?.includes(idx) || (currentAlgo.id === 'binary-search' && idx === activeFrame.mid);
                    const isSwapped = activeFrame.swapped?.includes(idx) || (currentAlgo.id === 'binary-search' && activeFrame.found && idx === activeFrame.mid);
                    const isSorted = activeFrame.sorted?.includes(idx);
                    const isPivot = activeFrame.pivot === idx;
                    
                    let barColor = 'from-indigo-500 via-violet-500 to-fuchsia-500';
                    let labelColor = 'text-slate-400';
                    let borderClass = 'border-transparent';

                    if (isCompared) {
                      barColor = 'from-yellow-400 to-amber-500';
                      borderClass = 'border-yellow-300';
                    }
                    if (isSwapped) {
                      barColor = 'from-emerald-400 to-teal-500';
                      borderClass = 'border-emerald-300';
                    }
                    if (isSorted) {
                      barColor = 'from-emerald-600/60 to-emerald-500/50';
                      labelColor = 'text-emerald-400';
                    }
                    if (isPivot) {
                      barColor = 'from-rose-500 to-pink-500';
                      borderClass = 'border-rose-300';
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 transition-all duration-200">
                        {/* Binary Search Pointers label */}
                        {currentAlgo.id === 'binary-search' && (
                          <div className="h-6 flex flex-col justify-end text-[8px] font-mono leading-none">
                            {idx === activeFrame.low && <span className="text-cyan-400 block font-bold">Low</span>}
                            {idx === activeFrame.mid && <span className="text-yellow-400 block font-bold">Mid</span>}
                            {idx === activeFrame.high && <span className="text-pink-400 block font-bold">High</span>}
                          </div>
                        )}
                        <div 
                          className={`w-full rounded-t-lg bg-gradient-to-t ${barColor} border ${borderClass} shadow-md transition-all duration-300`} 
                          style={{ height: `${(val / 90) * 110}px`, minHeight: '12px' }} 
                        />
                        <span className={`text-[10px] font-mono font-bold mt-1 ${labelColor}`}>{val}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rendering Graph Tree DFS/BFS */}
              {currentAlgo.type === 'Graph' && (
                <div className="flex flex-col items-center w-full">
                  <svg className="w-full h-44 max-w-sm" viewBox="0 0 220 120">
                    <line x1="110" y1="20" x2="70" y2="55" stroke="#334155" strokeWidth="2" />
                    <line x1="110" y1="20" x2="150" y2="55" stroke="#334155" strokeWidth="2" />
                    <line x1="70" y1="55" x2="45" y2="95" stroke="#334155" strokeWidth="1.5" />
                    <line x1="70" y1="55" x2="95" y2="95" stroke="#334155" strokeWidth="1.5" />
                    <line x1="150" y1="55" x2="125" y2="95" stroke="#334155" strokeWidth="1.5" />
                    <line x1="150" y1="55" x2="175" y2="95" stroke="#334155" strokeWidth="1.5" />

                    {/* Nodes mapping tree */}
                    {[
                      { x: 110, y: 20, val: 50 },
                      { x: 70, y: 55, val: 20 },
                      { x: 150, y: 55, val: 80 },
                      { x: 45, y: 95, val: 10 },
                      { x: 95, y: 95, val: 30 },
                      { x: 125, y: 95, val: 70 },
                      { x: 175, y: 95, val: 90 }
                    ].map((node, i) => {
                      const isActive = activeFrame.active === node.val;
                      const isVisited = activeFrame.visited?.includes(node.val);
                      let color = '#020617';
                      let stroke = '#475569';
                      let text = '#e2e8f0';

                      if (isVisited) {
                        color = 'rgba(79, 70, 229, 0.45)';
                        stroke = '#818cf8';
                      }
                      if (isActive) {
                        color = '#8b5cf6';
                        stroke = '#a78bfa';
                        text = '#fff';
                      }

                      return (
                        <g key={i}>
                          <circle cx={node.x} cy={node.y} r={i < 3 ? 14 : 11} fill={color} stroke={stroke} strokeWidth={isActive ? '3' : '1.5'} className="transition-all duration-300" />
                          <text x={node.x} y={node.y + 3} fill={text} fontSize={i < 3 ? '10' : '8'} fontWeight={isActive ? 'bold' : 'normal'} textAnchor="middle">{node.val}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}

            </div>

            {/* Traversal State Stack/Queue indicators */}
            {currentAlgo.type === 'Graph' && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider mb-1">
                    {selectedAlgo === 'dfs' ? 'Implicit Stack (LIFO)' : 'Queue (FIFO)'}
                  </span>
                  <div className="flex gap-1 overflow-x-auto min-h-[30px] items-center">
                    {activeFrame.frontier?.map((val, idx) => (
                      <span key={idx} className="bg-violet-950/60 border border-violet-500/30 text-violet-200 text-xs px-2.5 py-1 rounded font-mono font-bold">
                        {val}
                      </span>
                    ))}
                    {(!activeFrame.frontier || activeFrame.frontier.length === 0) && (
                      <span className="text-[10px] text-slate-650 italic">Empty</span>
                    )}
                  </div>
                </div>
                <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider mb-1">Visited Order</span>
                  <div className="flex gap-1 overflow-x-auto min-h-[30px] items-center">
                    {activeFrame.visited?.map((val, idx) => (
                      <span key={idx} className="bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs px-2 py-0.5 rounded font-mono">
                        {val}
                      </span>
                    ))}
                    {(!activeFrame.visited || activeFrame.visited.length === 0) && (
                      <span className="text-[10px] text-slate-650 italic">Empty</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Playback Controls Panel */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={stepBackward}
                  disabled={currentFrameIdx === 0}
                  className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition active:scale-95"
                  title="Step Backward"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsPlaying(prev => !prev)}
                  className="rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 text-white font-semibold text-sm px-6 py-2.5 shadow-md hover:scale-[1.01] transition-all duration-200 active:scale-95"
                >
                  {isPlaying ? 'Pause' : 'Play Simulation'}
                </button>
                <button
                  onClick={stepForward}
                  disabled={currentFrameIdx === frames.length - 1}
                  className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition active:scale-95"
                  title="Step Forward"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4zM19.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" />
                  </svg>
                </button>
                <button
                  onClick={handleReset}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 rounded-xl text-xs px-4 py-2.5 font-medium transition active:scale-95"
                >
                  Reset
                </button>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 font-mono block">Simulation Frames</span>
                <span className="text-sm font-semibold text-slate-300 font-mono">
                  {currentFrameIdx + 1} / {frames.length || 1}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Timeline & Complexity */}
        <div className="space-y-8">
          
          {/* Explanation panel */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Execution Panel
            </h3>
            <p className="text-xs text-slate-400 mb-4">{currentAlgo.desc}</p>
            <div className="rounded-2xl bg-slate-950/60 p-4 border border-white/5 min-h-[100px] flex items-center justify-center">
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {activeFrame.explanation}
              </p>
            </div>
          </div>

          {/* Complexity analysis card */}
          <div className="glass rounded-[2rem] border border-white/10 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Asymptotic Complexity
            </h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 font-medium">Best Case Time</span>
                <span className="font-mono text-xs text-cyan-300 font-bold">{currentAlgo.complexity.best}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 font-medium">Average Case Time</span>
                <span className="font-mono text-xs text-violet-300 font-bold">{currentAlgo.complexity.avg}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 font-medium">Worst Case Time</span>
                <span className="font-mono text-xs text-rose-400 font-bold">{currentAlgo.complexity.worst}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 font-medium">Auxiliary Space</span>
                <span className="font-mono text-xs text-indigo-300 font-bold">{currentAlgo.complexity.space}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Animation Timeline Walkthrough Section */}
      <div className="glass rounded-[2rem] border border-white/10 p-6 md:p-8 mb-8 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Active Animation Timeline
        </h3>
        <p className="text-sm text-slate-400 mb-6">Execution log trace of the visualizer step process. Click any node to jump directly to that state frame.</p>

        <div className="relative">
          {/* Scrollable Horizontal timeline nodes */}
          <div className="flex items-center gap-6 overflow-x-auto py-4 px-2 w-full select-none">
            {frames.map((frame, idx) => {
              const isActive = idx === currentFrameIdx;
              const isPast = idx < currentFrameIdx;
              
              let stepStyle = 'border-white/10 bg-slate-900 text-slate-400';
              let lineStyle = 'bg-white/10';

              if (isActive) {
                stepStyle = 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-950/60 font-bold';
              } else if (isPast) {
                stepStyle = 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300';
                lineStyle = 'bg-indigo-500/40';
              }

              return (
                <div key={idx} className="flex items-center flex-shrink-0 relative">
                  {/* Step bubble button */}
                  <button 
                    onClick={() => {
                      stopPlayback();
                      setCurrentFrameIdx(idx);
                    }}
                    className={`h-9 w-9 rounded-full border flex items-center justify-center text-xs font-mono transition-all duration-200 hover:scale-105 active:scale-95 ${stepStyle}`}
                  >
                    {idx + 1}
                  </button>

                  {/* Step label text overlay */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center w-28 text-center pointer-events-none mt-1">
                    <span className={`text-[9px] truncate w-full font-mono ${isActive ? 'text-indigo-300 font-bold' : 'text-slate-500'}`}>
                      {frame.stepLabel}
                    </span>
                  </div>

                  {/* connecting line path */}
                  {idx < frames.length - 1 && (
                    <div className={`h-0.5 w-10 ml-6 ${lineStyle} transition-colors`} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Blank space to clear absolute elements */}
          <div className="h-10" />
        </div>
      </div>

    </div>
  );
}

export default AlgorithmVisualizerPage;
