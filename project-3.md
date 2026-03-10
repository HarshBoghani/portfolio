# Distributed Rate Limiter in C++🚦 

A **high-performance, distributed rate limiter microservice** built from scratch in **C++**.
This project evolves from a **simple in-memory library** to a **scalable, stateless gRPC service**.
It leverages **Redis** for centralized state management and **atomic Lua scripts** to implement a **race-condition-free Token Bucket algorithm**.

---

## 🛠 Workflow


<img src="image.png" alt="workflow-image">

---

## ✨ Key Features

* ⚡ **Stateless, low-latency gRPC microservice** in C++ to centralize and decouple rate-limiting logic, enabling independent horizontal scaling.
* 🔒 **Strong consistency, race-condition free** design via atomic Redis transactions with Lua scripting (Token Bucket algorithm).
* 📦 **Production-ready containerization** using multi-stage Docker build (95% smaller image, portable, secure).
* 🚀 **Token Bucket algorithm** for flexible rate limiting with burst handling — more powerful than simple approaches.

---

## 🧰 Technology Stack

* **Language:** C++ (17)
* **Communication:** gRPC & Protocol Buffers
* **State Store:** Redis
* **Atomic Logic:** Lua
* **Build System:** CMake
* **Containerization:** Docker
* **Dependency Management:** vcpkg

---

## 📂 Project Structure

```bash
.
├── CMakeLists.txt         
├── Dockerfile             
├── lua/
│   └── token_bucket.lua   
├── proto/
│   └── limiter.proto      # The gRPC service contract (Protocol Buffers)
├── src/
│   ├── client.cpp         # Example gRPC client
│   ├── RateLimiter.cpp    # In-memory rate limiter logic (Phase 1)
│   ├── RateLimiter.h      
│   └── server.cpp         # The gRPC server implementation
└── vcpkg.json             # C++ dependency manifest for vcpkg
```

---

## 🚀 Getting Started

### ✅ Prerequisites

* [Docker](https://www.docker.com/) must be installed and running.

---

### 🏗 Build & Run Instructions

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/HarshBoghani/Limitron.git
cd Limitron
```

#### 2️⃣ Start Redis

```bash
docker run --name my-redis -p 6379:6379 -d redis
```

#### 3️⃣ Build the Project Image

```bash
docker build -t rate-limiter-service .
```

#### 4️⃣ Run the Server

```bash
docker run --rm -p 50051:50051 --name rate-limiter-server --network host rate-limiter-service
```

* `--rm`: Auto-remove container when it exits
* `-p 50051:50051`: Map gRPC port to host
* `--network host`: Connect to Redis on `localhost`

👉 Output: `✅ Server listening on 0.0.0.0:50051`

#### 5️⃣ Run the Test Client

```bash
docker run --rm --network host rate-limiter-service ./build/rate_limiter_client
```

📌 The client will test its requests against the running server → proving **end-to-end functionality**.

---

## 📸 Working Screenshots


<img width="800" alt="server output" src="https://github.com/user-attachments/assets/823b0421-7921-4210-8696-18cf7d243d5d" />

<img width="800" alt="client output" src="https://github.com/user-attachments/assets/19ef0662-1ffc-4eec-a5aa-ca82832798a1" />


---
