export const languages = [
  {
    id: 'python',
    name: 'Python',
    accent: 'from-emerald-400 to-lime-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    glow: 'shadow-emerald-950/20',
    releaseYear: 1991,
    paradigm: 'Multi-paradigm (OOP, Functional, Imperative)',
    typing: 'Dynamic, Strong',
    executionModel: 'Interpreted (CPython / Bytecode VM)',
    description: 'Highly readable, clean, and expressive language. The dominant language for Data Science, Machine Learning, AI, scripting, and rapid web prototyping.',
    advantages: [
      'Extremely clean, readable syntax with minimal boilerplate.',
      'Massive package ecosystem (PyPI) and unmatched libraries for AI/ML.',
      'Excellent for rapid prototyping and short development cycles.'
    ],
    disadvantages: [
      'Significantly slower execution speed compared to compiled languages.',
      'Global Interpreter Lock (GIL) limits native multi-threaded CPU execution.',
      'Dynamic typing can lead to runtime errors that static analysis would catch.'
    ],
    performance: {
      speed: 15.0, // relative to C (1.0)
      memory: 12,  // MB relative size
      compilation: 'None (Interpreted / JIT in PyPy)',
      speedLabel: '15x Slower than C',
      memoryLabel: '~12 MB baseline'
    },
    popularity: {
      tiobeRank: '1st',
      soSurveyPct: 45.2,
      githubPRPct: 16.5
    },
    tutorials: [
      { title: 'Official Python Tutorial', url: 'https://docs.python.org/3/tutorial/index.html', difficulty: 'Beginner' },
      { title: 'Python for Beginners (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', difficulty: 'Beginner' },
      { title: 'Learn Python in Y Minutes', url: 'https://learnxinyminutes.com/docs/python/', difficulty: 'Intermediate' }
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    accent: 'from-fuchsia-400 to-pink-500',
    border: 'border-fuchsia-500/30',
    bg: 'bg-fuchsia-500/10',
    glow: 'shadow-fuchsia-950/20',
    releaseYear: 1995,
    paradigm: 'Multi-paradigm (Event-driven, Functional, Prototype-based)',
    typing: 'Dynamic, Weak',
    executionModel: 'JIT Compiled (V8, SpiderMonkey, JavaScriptCore)',
    description: 'The native runtime of the web browser. Powers almost all interactive web frontend logic, and operates on the server-side via Node.js, Bun, and Deno.',
    advantages: [
      'Runs everywhere natively—every web browser is an execution engine.',
      'Highly responsive event-driven model suited for network I/O.',
      'Largest library community in the world (npm) and fast iteration.'
    ],
    disadvantages: [
      'Weak typing allows implicit type coercions that can cause obscure bugs.',
      'Single-threaded event loop can easily get blocked by heavy computations.',
      'Inconsistent API design historically (callback hell, old syntax anomalies).'
    ],
    performance: {
      speed: 4.2,
      memory: 18,
      compilation: 'JIT (Just-In-Time Compile)',
      speedLabel: '4.2x Slower than C',
      memoryLabel: '~18 MB baseline'
    },
    popularity: {
      tiobeRank: '6th',
      soSurveyPct: 61.8,
      githubPRPct: 19.2
    },
    tutorials: [
      { title: 'MDN Web Docs: JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', difficulty: 'Beginner' },
      { title: 'JavaScript.info (Modern Guide)', url: 'https://javascript.info/', difficulty: 'Intermediate' },
      { title: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net/', difficulty: 'Advanced' }
    ]
  },
  {
    id: 'go',
    name: 'Go',
    accent: 'from-sky-400 to-cyan-500',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    glow: 'shadow-sky-950/20',
    releaseYear: 2009,
    paradigm: 'Procedural, Concurrent, Imperative',
    typing: 'Static, Strong',
    executionModel: 'AOT Compiled to Machine Code',
    description: 'Open source programming language created by Google. Focuses on absolute simplicity, hyper-fast compilation, and first-class concurrency primitives (Goroutines).',
    advantages: [
      'Sub-second compilation times feel like scripting, but builds binaries.',
      'Goroutines and Channels make safe concurrent network programming simple.',
      'Opinionated, clean design with minimal syntax variations.'
    ],
    disadvantages: [
      'Lack of advanced abstract expressiveness (explicit error checking verbose).',
      'Uses Garbage Collection, introducing periodic minor pause delays.',
      'Simple type system avoids traditional OOP classes and inheritance structures.'
    ],
    performance: {
      speed: 1.5,
      memory: 2.2,
      compilation: 'Fast AOT (Ahead-of-Time)',
      speedLabel: '1.5x Slower than C',
      memoryLabel: '~2.2 MB baseline'
    },
    popularity: {
      tiobeRank: '8th',
      soSurveyPct: 13.9,
      githubPRPct: 5.8
    },
    tutorials: [
      { title: 'A Tour of Go (Interactive)', url: 'https://go.dev/tour/', difficulty: 'Beginner' },
      { title: 'Go by Example', url: 'https://gobyexample.com/', difficulty: 'Intermediate' },
      { title: 'Effective Go Reference', url: 'https://go.dev/doc/effective_go', difficulty: 'Advanced' }
    ]
  },
  {
    id: 'rust',
    name: 'Rust',
    accent: 'from-rose-400 to-red-500',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    glow: 'shadow-rose-950/20',
    releaseYear: 2015,
    paradigm: 'Multi-paradigm (Systems, Functional, Concurrent)',
    typing: 'Static, Strong (Inferred)',
    executionModel: 'AOT Compiled to Machine Code (LLVM)',
    description: 'A systems programming language focused on absolute speed, memory safety, and thread safety without a garbage collector via compile-time borrow checking.',
    advantages: [
      'Guarantees memory and concurrency safety at compile time.',
      'Performance comparable to C and C++ with zero-cost abstractions.',
      'Excellent toolchain (Cargo) for dependencies, testing, and documentation.'
    ],
    disadvantages: [
      'Steep learning curve due to ownership, lifetime annotations, and borrow rules.',
      'Compilations are notably slower than other modern languages like Go.',
      'Strict compiler rejects programs that other languages would allow at runtime.'
    ],
    performance: {
      speed: 1.02,
      memory: 0.7,
      compilation: 'Slow AOT (Ahead-of-Time)',
      speedLabel: 'Nearly identical to C',
      memoryLabel: '< 1 MB baseline'
    },
    popularity: {
      tiobeRank: '13th',
      soSurveyPct: 14.2,
      githubPRPct: 3.1
    },
    tutorials: [
      { title: 'The Rust Programming Language Book', url: 'https://doc.rust-lang.org/book/', difficulty: 'Beginner' },
      { title: 'Rust by Example', url: 'https://doc.rust-lang.org/stable/rust-by-example/', difficulty: 'Intermediate' },
      { title: 'Comprehensive Rust (Google)', url: 'https://google.github.io/comprehensive-rust/', difficulty: 'Advanced' }
    ]
  },
  {
    id: 'java',
    name: 'Java',
    accent: 'from-amber-400 to-orange-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    glow: 'shadow-amber-950/20',
    releaseYear: 1995,
    paradigm: 'Object-oriented, Structured, Imperative',
    typing: 'Static, Strong',
    executionModel: 'Compiled to Bytecode (JVM Virtual Machine)',
    description: 'Enterprise standard designed around "Write Once, Run Anywhere". Widely used for large enterprise systems, Android application backend, and financial infrastructure.',
    advantages: [
      'Extremely stable, backwards-compatible, and highly standardized platform.',
      'Ultra-optimized Garbage Collectors and JIT compilation (HotSpot JVM).',
      'Immense ecosystem of robust frameworks (Spring, Hibernate, etc.).'
    ],
    disadvantages: [
      'Verbose code syntax requires significant boilerplate code.',
      'Higher baseline memory consumption due to the Java Virtual Machine overhead.',
      'Slower startup times, making it less ideal for serverless / CLI utilities.'
    ],
    performance: {
      speed: 2.1,
      memory: 32,
      compilation: 'Bytecode to JVM + JIT',
      speedLabel: '2.1x Slower than C',
      memoryLabel: '~32 MB baseline'
    },
    popularity: {
      tiobeRank: '4th',
      soSurveyPct: 30.5,
      githubPRPct: 8.9
    },
    tutorials: [
      { title: 'Java Programming (Oracle Docs)', url: 'https://docs.oracle.com/javase/tutorial/', difficulty: 'Beginner' },
      { title: 'Java tutorial for Beginners (freeCodeCamp)', url: 'https://www.youtube.com/watch?v=A74TOX803D0', difficulty: 'Beginner' },
      { title: 'Baeldung (Advanced Guide)', url: 'https://www.baeldung.com/', difficulty: 'Advanced' }
    ]
  },
  {
    id: 'cpp',
    name: 'C++',
    accent: 'from-indigo-400 to-violet-500',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    glow: 'shadow-indigo-950/20',
    releaseYear: 1985,
    paradigm: 'Multi-paradigm (Procedural, Generic, OOP)',
    typing: 'Static, Strong',
    executionModel: 'AOT Compiled to Machine Code',
    description: 'Extension of C adding object-oriented features and high-level abstractions. Dominates game engines, graphics, compilers, and high-frequency trading applications.',
    advantages: [
      'Uncompromising runtime efficiency and direct, low-level hardware control.',
      'Zero-cost abstractions—you do not pay in performance for clean structures.',
      'Immense flexibility allowing programming in OOP, procedural, or functional modes.'
    ],
    disadvantages: [
      'No safety net—buffer overflows, memory leaks, and wild pointers are easy to write.',
      'Very complex language features (templates, rules, multiple inheritance).',
      'No standardized build/package tool, leading to complex build setups.'
    ],
    performance: {
      speed: 1.01,
      memory: 0.8,
      compilation: 'AOT (Ahead-of-Time)',
      speedLabel: 'Equivalent to C',
      memoryLabel: '< 1 MB baseline'
    },
    popularity: {
      tiobeRank: '2nd',
      soSurveyPct: 22.4,
      githubPRPct: 4.5
    },
    tutorials: [
      { title: 'Learn C++ (Comprehensive Guide)', url: 'https://www.learncpp.com/', difficulty: 'Beginner' },
      { title: 'C++ Tutorial - cplusplus.com', url: 'https://cplusplus.com/doc/tutorial/', difficulty: 'Intermediate' },
      { title: 'Effective Modern C++ (Scott Meyers)', url: 'https://github.com/hitesh-singh/Books/blob/master/Effective%20Modern%20C%2B%2B%20(Scott%20Meyers).pdf', difficulty: 'Advanced' }
    ]
  },
  {
    id: 'c',
    name: 'C',
    accent: 'from-cyan-400 to-sky-500',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    glow: 'shadow-cyan-950/20',
    releaseYear: 1972,
    paradigm: 'Imperative, Procedural',
    typing: 'Static, Weakly Typed',
    executionModel: 'AOT Compiled to Machine Code',
    description: 'The foundation of modern computing. Created to implement UNIX, C provides simple hardware mapping and serves as the lingua franca of low-level embedded software and kernels.',
    advantages: [
      'Simple, tiny core language that compiles to extremely small executables.',
      'Direct, unfiltered access to hardware registers and RAM memory mapping.',
      'Available for virtually every microprocessor and hardware controller.'
    ],
    disadvantages: [
      'Requires meticulous manual pointer and memory layout management.',
      'Lacks modern abstractions like classes, namespaces, collections, or modules.',
      'Vulnerable to critical security exploits (buffer overflow, stack smashing).'
    ],
    performance: {
      speed: 1.0,
      memory: 0.5,
      compilation: 'Fast AOT (Ahead-of-Time)',
      speedLabel: 'Gold Standard (1.0x)',
      memoryLabel: '< 0.5 MB baseline'
    },
    popularity: {
      tiobeRank: '3rd',
      soSurveyPct: 18.2,
      githubPRPct: 3.5
    },
    tutorials: [
      { title: 'C Programming Absolute Beginners Guide', url: 'https://cprogramming.com/', difficulty: 'Beginner' },
      { title: 'The C Programming Language (K&R)', url: 'https://archive.org/details/TheCProgrammingLanguageSecondEdition', difficulty: 'Intermediate' },
      { title: 'Modern C (Jens Gustedt)', url: 'https://modernc.gforge.inria.fr/', difficulty: 'Advanced' }
    ]
  }
];

export const presets = {
  hello: {
    name: 'Hello, World!',
    python: `print("Hello, World!")`,
    javascript: `console.log("Hello, World!");`,
    go: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
    rust: `fn main() {\n    println!("Hello, World!");\n}`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`
  },
  fibonacci: {
    name: 'Fibonacci Sequence',
    python: `def fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]

print(fibonacci(10))`,
    javascript: `function fibonacci(n) {
  const seq = [0, 1];
  while (seq.length < n) {
    seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  }
  return seq.slice(0, n);
}

console.log(fibonacci(10));`,
    go: `package main

import "fmt"

func fibonacci(n int) []int {
    if n <= 0 {
        return []int{}
    }
    seq := []int{0, 1}
    for len(seq) < n {
        seq = append(seq, seq[len(seq)-1]+seq[len(seq)-2])
    }
    return seq[:n]
}

func main() {
    fmt.Println(fibonacci(10))
}`,
    rust: `fn fibonacci(n: usize) -> Vec<u32> {
    if n == 0 { return vec![]; }
    let mut seq = vec![0, 1];
    while seq.len() < n {
        let next = seq[seq.len() - 1] + seq[seq.len() - 2];
        seq.push(next);
    }
    seq.truncate(n);
    seq
}

fn main() {
    println!("{:?}", fibonacci(10));
}`,
    java: `import java.util.ArrayList;
import java.util.List;

public class Fibonacci {
    public static List<Integer> generate(int n) {
        List<Integer> seq = new ArrayList<>();
        if (n <= 0) return seq;
        seq.add(0);
        if (n == 1) return seq;
        seq.add(1);
        while (seq.size() < n) {
            seq.add(seq.get(seq.size() - 1) + seq.get(seq.size() - 2));
        }
        return seq;
    }

    public static void main(String[] args) {
        System.out.println(generate(10));
    }
}`,
    cpp: `#include <iostream>
#include <vector>

std::vector<int> fibonacci(int n) {
    if (n <= 0) return {};
    std::vector<int> seq = {0, 1};
    while (seq.size() < n) {
        seq.push_back(seq[seq.size() - 1] + seq[seq.size() - 2]);
    }
    seq.resize(n);
    return seq;
}

int main() {
    auto seq = fibonacci(10);
    for (int val : seq) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
    return 0;
}`,
    c: `#include <stdio.h>

void fibonacci(int n) {
    if (n <= 0) return;
    long long first = 0, second = 1, next;
    printf("%lld ", first);
    if (n == 1) return;
    printf("%lld ", second);
    for (int i = 2; i < n; i++) {
        next = first + second;
        printf("%lld ", next);
        first = second;
        second = next;
    }
    printf("\\n");
}

int main() {
    fibonacci(10);
    return 0;
}`
  },
  binarySearch: {
    name: 'Binary Search',
    python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

nums = [2, 5, 8, 12, 16, 23, 38, 56, 72]
print(binary_search(nums, 23))  # Output: 5`,
    javascript: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}

const nums = [2, 5, 8, 12, 16, 23, 38, 56, 72];
console.log(binarySearch(nums, 23));  // Output: 5`,
    go: `package main

import "fmt"

func binarySearch(arr []int, target int) int {
    low, high := 0, len(arr)-1
    for low <= high {
        mid := (low + high) / 2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            low = mid + 1
        } else {
            high = mid - 1
        }
    }
    return -1
}

func main() {
    nums := []int{2, 5, 8, 12, 16, 23, 38, 56, 72}
    fmt.Println(binarySearch(nums, 23))  // Output: 5
}`,
    rust: `fn binary_search(arr: &[i32], target: i32) -> Option<usize> {
    let mut low = 0;
    let mut high = arr.len() as isize - 1;
    while low <= high {
        let mid = (low + high) / 2;
        let mid_idx = mid as usize;
        if arr[mid_idx] == target {
            return Some(mid_idx);
        } else if arr[mid_idx] < target {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    None
}

fn main() {
    let nums = vec![2, 5, 8, 12, 16, 23, 38, 56, 72];
    println!("{:?}", binary_search(&nums, 23));  // Output: Some(5)
}`,
    java: `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] nums = {2, 5, 8, 12, 16, 23, 38, 56, 72};
        System.out.println(search(nums, 23));  // Output: 5
    }
}`,
    cpp: `#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    std::vector<int> nums = {2, 5, 8, 12, 16, 23, 38, 56, 72};
    std::cout << binarySearch(nums, 23) << std::endl;  // Output: 5
    return 0;
}`,
    c: `#include <stdio.h>

int binarySearch(int arr[], int size, int target) {
    int low = 0, high = size - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    int nums[] = {2, 5, 8, 12, 16, 23, 38, 56, 72};
    int size = sizeof(nums) / sizeof(nums[0]);
    printf("%d\\n", binarySearch(nums, size, 23));  // Output: 5
    return 0;
}`
  },
  httpServer: {
    name: 'HTTP Server',
    python: `from http.server import SimpleHTTPRequestHandler, HTTPServer

class MyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Hello from Python HTTP server!")

server = HTTPServer(("localhost", 8080), MyHandler)
print("Server running on port 8080...")
server.serve_forever()`,
    javascript: `const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js HTTP server!\\n');
});

server.listen(8080, () => {
  console.log('Server running on port 8080...');
});`,
    go: `package main

import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "Hello from Go HTTP server!")
}

func main() {
    http.HandleFunc("/", handler)
    fmt.Println("Server running on port 8080...")
    http.ListenAndServe(":8080", nil)
}`,
    rust: `use std::io::prelude::*;
use std::net::{TcpListener, TcpStream};

fn handle_client(mut stream: TcpStream) {
    let response = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\n\\r\\nHello from Rust!";
    stream.write_all(response.as_bytes()).unwrap();
}

fn main() {
    let listener = TcpListener::bind("127.0.0.1:8080").unwrap();
    println!("Server running on port 8080...");
    for stream in listener.incoming() {
        handle_client(stream.unwrap());
    }
}`,
    java: `import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class SimpleWebServer {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/", new MyHandler());
        System.out.println("Server running on port 8080...");
        server.start();
    }

    static class MyHandler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            String response = "Hello from Java HTTP server!";
            t.sendResponseHeaders(200, response.length());
            OutputStream os = t.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}`,
    cpp: `// Using cpp-httplib (header-only library)
#include <httplib.h>
#include <iostream>

int main() {
    httplib::Server svr;
    svr.Get("/", [](const httplib::Request&, httplib::Response& res) {
        res.set_content("Hello from C++ HTTP server!", "text/plain");
    });
    std::cout << "Server running on port 8080..." << std::endl;
    svr.listen("localhost", 8080);
    return 0;
}`,
    c: `// Minimal TCP socket listener in C (Winsock2)
#include <stdio.h>
#include <string.h>
#include <winsock2.h>

#pragma comment(lib, "ws2_32.lib")

int main() {
    WSADATA wsa;
    SOCKET s, new_socket;
    struct sockaddr_in server, client;
    int c;
    char *message;

    WSAStartup(MAKEWORD(2,2), &wsa);
    s = socket(AF_INET, SOCK_STREAM, 0);
    server.sin_family = AF_INET;
    server.sin_addr.s_addr = INADDR_ANY;
    server.sin_port = htons(8080);

    bind(s, (struct sockaddr *)&server, sizeof(server));
    listen(s, 3);
    printf("Server running on port 8080...\\n");

    c = sizeof(struct sockaddr_in);
    while((new_socket = accept(s, (struct sockaddr *)&client, &c)) != INVALID_SOCKET) {
        message = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\n\\r\\nHello from C!";
        send(new_socket, message, strlen(message), 0);
        closesocket(new_socket);
    }
    closesocket(s);
    WSACleanup();
    return 0;
}`
  },
  jsonParsing: {
    name: 'JSON Parsing',
    python: `import json

data_str = '{"name": "Alice", "age": 28, "skills": ["Python", "JS"]}'
data = json.loads(data_str)

print(f"Name: {data['name']}")
print(f"First Skill: {data['skills'][0]}")`,
    javascript: `const dataStr = '{"name": "Alice", "age": 28, "skills": ["Python", "JS"]}';
const data = JSON.parse(dataStr);

console.log(\`Name: \${data.name}\`);
console.log(\`First Skill: \${data.skills[0]}\`);`,
    go: `package main

import (
    "encoding/json"
    "fmt"
)

type Person struct {
    Name   string   \`json:"name"\`
    Age    int      \`json:"age"\`
    Skills []string \`json:"skills"\`
}

func main() {
    dataStr := \`{"name": "Alice", "age": 28, "skills": ["Python", "JS"]}\`
    var p Person
    json.Unmarshal([]byte(dataStr), &p)

    fmt.Println("Name:", p.Name)
    fmt.Println("First Skill:", p.Skills[0])
}`,
    rust: `// Using serde_json crate
use serde_json::Value;

fn main() {
    let data_str = r#"{"name": "Alice", "age": 28, "skills": ["Python", "JS"]}"#;
    let data: Value = serde_json::from_str(data_str).unwrap();

    println!("Name: {}", data["name"].as_str().unwrap());
    println!("First Skill: {}", data["skills"][0].as_str().unwrap());
}`,
    java: `// Using org.json library
import org.json.JSONObject;
import org.json.JSONArray;

public class JsonParser {
    public static void main(String[] args) {
        String dataStr = "{\\"name\\": \\"Alice\\", \\"age\\": 28, \\"skills\\": [\\"Python\\", \\"JS\\"]}";
        JSONObject data = new JSONObject(dataStr);

        System.out.println("Name: " + data.getString("name"));
        JSONArray skills = data.getJSONArray("skills");
        System.out.println("First Skill: " + skills.getString(0));
    }
}`,
    cpp: `#include <iostream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

int main() {
    std::string data_str = R"({"name": "Alice", "age": 28, "skills": ["Python", "JS"]})";
    json data = json::parse(data_str);

    std::cout << "Name: " << data["name"] << std::endl;
    std::cout << "First Skill: " << data["skills"][0] << std::endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <cjson/cJSON.h>

int main() {
    const char *data_str = "{\\"name\\": \\"Alice\\", \\"age\\": 28, \\"skills\\": [\\"Python\\", \\"JS\\"]}";
    cJSON *data = cJSON_Parse(data_str);

    cJSON *name = cJSON_GetObjectItemCaseSensitive(data, "name");
    cJSON *skills = cJSON_GetObjectItemCaseSensitive(data, "skills");
    cJSON *first_skill = cJSON_GetArrayItem(skills, 0);

    printf("Name: %s\\n", name->valuestring);
    printf("First Skill: %s\\n", first_skill->valuestring);

    cJSON_Delete(data);
    return 0;
}`
  }
};

export const constructs = [
  {
    feature: 'Variable Declaration',
    description: 'How static or dynamic identifiers are instantiated with runtime memory references.',
    python: 'name = "John"\nage = 30',
    javascript: 'const name = "John";\nlet age = 30;',
    go: 'name := "John"\nvar age int = 30',
    rust: 'let name = "John";\nlet mut age = 30;',
    java: 'String name = "John";\nint age = 30;',
    cpp: 'std::string name = "John";\nint age = 30;',
    c: 'char name[] = "John";\nint age = 30;'
  },
  {
    feature: 'Functions',
    description: 'Definition of executable code units, parameter mappings, and output signatures.',
    python: 'def greet(name: str) -> str:\n    return f"Hello, {name}"',
    javascript: 'function greet(name) {\n  return `Hello, ${name}`;\n}',
    go: 'func greet(name string) string {\n    return "Hello, " + name\n}',
    rust: 'fn greet(name: &str) -> String {\n    format!("Hello, {}", name)\n}',
    java: 'public String greet(String name) {\n    return "Hello, " + name;\n}',
    cpp: 'std::string greet(const std::string& name) {\n    return "Hello, " + name;\n}',
    c: 'void greet(char name[], char output[]) {\n    sprintf(output, "Hello, %s", name);\n}'
  },
  {
    feature: 'Conditionals',
    description: 'Branching execution paths based on evaluated boolean expressions.',
    python: 'if score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelse:\n    print("C")',
    javascript: 'if (score >= 90) {\n  console.log("A");\n} else if (score >= 80) {\n  console.log("B");\n} else {\n  console.log("C");\n}',
    go: 'if score >= 90 {\n    fmt.Println("A")\n} else if score >= 80 {\n    fmt.Println("B")\n} else {\n    fmt.Println("C")\n}',
    rust: 'if score >= 90 {\n    println!("A");\n} else if score >= 80 {\n    println!("B");\n} else {\n    println!("C");\n}',
    java: 'if (score >= 90) {\n    System.out.println("A");\n} else if (score >= 80) {\n    System.out.println("B");\n} else {\n    System.out.println("C");\n}',
    cpp: 'if (score >= 90) {\n    std::cout << "A" << std::endl;\n} else if (score >= 80) {\n    std::cout << "B" << std::endl;\n} else {\n    std::cout << "C" << std::endl;\n}',
    c: 'if (score >= 90) {\n    printf("A\\n");\n} else if (score >= 80) {\n    printf("B\\n");\n} else {\n    printf("C\\n");\n}'
  },
  {
    feature: 'Loops (Iteration)',
    description: 'Sequentially iterating over index counts or collection members.',
    python: 'for i in range(5):\n    print(i)',
    javascript: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
    go: 'for i := 0; i < 5; i++ {\n    fmt.Println(i)\n}',
    rust: 'for i in 0..5 {\n    println!("{}", i);\n}',
    java: 'for (int i = 0; i < 5; i++) {\n    System.out.println(i);\n}',
    cpp: 'for (int i = 0; i < 5; i++) {\n    std::cout << i << std::endl;\n}',
    c: 'for (int i = 0; i < 5; i++) {\n    printf("%d\\n", i);\n}'
  },
  {
    feature: 'Error Handling',
    description: 'Detecting, reporting, and recovering from exceptional runtime faults.',
    python: 'try:\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    print(f"Error: {e}")',
    javascript: 'try {\n  const result = 10 / 0;\n} catch (error) {\n  console.error("Error:", error.message);\n}',
    go: 'res, err := divide(10, 0)\nif err != nil {\n    log.Fatalf("Error: %v", err)\n}',
    rust: 'match divide(10, 0) {\n    Ok(res) => println!("Result: {}", res),\n    Err(e) => eprintln!("Error: {}", e),\n}',
    java: 'try {\n    int result = 10 / 0;\n} catch (ArithmeticException e) {\n    System.out.println("Error: " + e.getMessage());\n}',
    cpp: 'try {\n    throw std::runtime_error("Error occurred");\n} catch (const std::exception& e) {\n    std::cerr << e.what() << std::endl;\n}',
    c: 'int code = perform_action();\nif (code != 0) {\n    fprintf(stderr, "Error code: %d\\n", code);\n}'
  },
  {
    feature: 'Data Structures / Objects',
    description: 'Creating compound user-defined structures, classes, or modular properties.',
    python: 'class User:\n    def __init__(self, name: str):\n        self.name = name',
    javascript: 'class User {\n  constructor(name) {\n    this.name = name;\n  }\n}',
    go: 'type User struct {\n    Name string\n}',
    rust: 'struct User {\n    name: String,\n}',
    java: 'public class User {\n    private String name;\n    public User(String name) {\n        this.name = name;\n    }\n}',
    cpp: 'class User {\npublic:\n    std::string name;\n    User(std::string n) : name(n) {}\n};',
    c: 'struct User {\n    char name[50];\n};'
  }
];
