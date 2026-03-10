import {
  Mail,
  Github,
  Linkedin,
} from 'lucide-react';

export type ProjectCategory = 'systems' | 'algorithms';

export interface Project {
  id: string;
  category: ProjectCategory;
  href?: string;
  github?: string;
  instagram?: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  features: string[];
  techStack: string[];
  date: string;
  views: number;
}

export const projects: Project[] = [
  {
    id: 'trie-engine',
    category: 'algorithms',
    github: 'https://github.com/HarshBoghani/Trie-Engine',
    href: 'https://github.com/HarshBoghani/Trie-Engine',
    title: 'C++ Trie Engine',
    description: 'High-performance search engine using a Trie data structure for O(m) search complexity. Features real-time autocomplete, fast multi-file search across 1500+ documents, and dynamic programming-based recommendations.',
    longDescription: 'A high-performance search engine built with a Trie data structure, featuring real-time autocomplete and fast search across 1500+ text documents. The backend preprocesses text (normalization, stop-word removal) and inserts every token into a Trie that tracks which files contain each word. A DFS-based recommendation engine uses dynamic programming on the Trie to pre-compute top-k completions at every node, giving O(partial_word_length) autocomplete.',
    tags: ["C++17", "React", "Docker", "Trie", "DFS", "DP"],
    features: [
      "Search time: O(word_length) to find all files containing a word.",
      "Recommendations: O(partial_word_length) with pre-computed suggestions.",
      "Index build: O(n) over all words, with memory-efficient prefix sharing."
    ],
    techStack: ["C++17", "React", "Docker", "Trie", "DFS", "DP"],
    date: '2025-01-01',
    views: 0
  },
  {
    id: 'limitron',
    category: 'systems',
    github: 'https://github.com/HarshBoghani/Limitron',
    href: 'https://github.com/HarshBoghani/Limitron',
    title: 'Distributed Rate Limiter',
    description: 'Stateless, low-latency gRPC microservice in C++ for centralized rate limiting. Uses atomic Redis transactions with Lua scripting to implement a race-condition-free Token Bucket algorithm with burst handling.',
    longDescription: 'A production-ready distributed rate limiter that evolves from an in-memory library into a stateless gRPC microservice. All shared state lives in Redis, and the core Token Bucket algorithm is implemented as an atomic Lua script to guarantee race-free updates under high concurrency. The service is containerized with a multi-stage Docker build, producing a small, portable image that can be horizontally scaled.',
    tags: ["C++", "gRPC", "Redis", "Lua", "Docker"],
    features: [
      "Stateless gRPC server in C++17, designed for low latency.",
      "Redis + Lua-based atomic operations for consistent token accounting.",
      "Simple client demonstrates end-to-end behavior under realistic request patterns."
    ],
    techStack: ["C++", "gRPC", "Redis", "Lua", "Docker"],
    date: '2025-02-01',
    views: 0
  },
  {
    id: 'kronosdb',
    category: 'systems',
    github: 'https://github.com/HarshBoghani/KronosDB',
    href: 'https://github.com/HarshBoghani/KronosDB',
    title: 'KronosDB',
    description: 'High-performance concurrent key-value database server built in C++. Implements asynchronous I/O with Boost.Asio, lock striping for fine-grained concurrency, and Append-Only File persistence for durability.',
    longDescription: 'KronosDB is a persistent, high-throughput key-value store inspired by systems like Redis and built from scratch in modern C++17. It uses Boost.Asio for fully asynchronous networking so the server can handle many concurrent clients without blocking threads. The in-memory core uses lock striping with a pool of shared mutexes, dramatically reducing contention while still guaranteeing correctness for concurrent writers.',
    tags: ["C++17", "Boost.Asio", "Docker", "CMake"],
    features: [
      "Append-Only File (AOF) persistence logs every write for durability across restarts.",
      "Clean separation between networking (Server/Session), storage core (KeyValueStore), and persistence layer.",
      "Ships with Docker support and simple CLI clients for manual and programmatic interaction."
    ],
    techStack: ["C++17", "Boost.Asio", "Docker", "CMake"],
    date: '2025-03-01',
    views: 0
  }
];

export const getCategoryLabel = (category: ProjectCategory): string => {
  switch (category) {
    case 'systems':
      return 'Systems';
    case 'algorithms':
      return 'Algorithms';
    default:
      return 'Projects';
  }
};

export const getProjectsByCategory = (category: ProjectCategory): Project[] => {
  return projects.filter((project) => project.category === category);
};

export const getAllCategories = (): ProjectCategory[] => {
  return ['systems', 'algorithms'];
};

export const getProjectCounts = () => {
  return {
    'systems': getProjectsByCategory('systems').length,
    'algorithms': getProjectsByCategory('algorithms').length,
    total: projects.length,
  };
};

export const socialLinks = [
  {
    icon: Github,
    handle: 'HarshBoghani',
    label: 'Github',
    href: 'https://github.com/HarshBoghani',
  },
  {
    icon: Linkedin,
    handle: 'Harsh Boghani',
    label: 'Linkedin',
    href: 'https://www.linkedin.com',
  },
  {
    icon: Mail,
    handle: 'your.email@example.com',
    label: 'Email',
    href: 'mailto:your.email@example.com',
  }
];
