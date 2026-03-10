https://medium.com/@thrilled_bisque_gnu_255/exploring-prime-factorization-and-the-sieve-of-eratosthenes-in-number-theory-934a363f4507

Exploring Prime Factorization and the Sieve of Eratosthenes in Number Theory
DevSphere
DevSphere

Follow
4 min read
·
Dec 12, 2024
51




We will use C++ to demonstrate these concepts, explaining how to implement a prime check, prime factorization, and the Sieve of Eratosthenes algorithm.

1. Prime Factorization: Breaking Down Numbers into Primes
Prime factorization is the process of breaking a number down into its prime factors. For example, the prime factorization of 28 is 2 * 2 * 7 .

Before diving into the code, let’s take a brief look at prime numbers. A prime number is a number greater than 1 that has no divisors other than 1 and itself. For instance, 2, 3, 5, 7, and 11 are all prime numbers.

Get DevSphere’s stories in your inbox
Join Medium for free to get updates from this writer.

Enter your email
Subscribe
To find the prime factors of a number, we need to check if it can be divided evenly by smaller prime numbers. Let’s look at the C++ code that implements this.

C++ Code for Prime Check and Prime Factorization
#include<bits/stdc++.h>
using namespace std;

// Function to check if a number is prime
bool isPrime(int n){

    if(n == 1) return false;  // 1 is not a prime number

    for(int i = 2; i * i <= n; i++){  // Check divisibility from 2 to sqrt(n)

        if(n % i == 0){  // If divisible by any number, not prime
            return false;
        }

    }
    return true;  // If no divisors found, it's prime
}


// Function to get all prime factors of a number
vector<int> primefactors(int n){

    vector<int> pf;  // Vector to store prime factors

    for(int i = 2; i * i <= n; i++){  // Loop from 2 to sqrt(n)

        while(n % i == 0){  // While i divides n, add i to the list
            pf.push_back(i);  // Add factor to the vector
            n /= i;  // Reduce n
        }

    }
    if(n > 1){  // If n is still greater than 1, it must be prime
        pf.push_back(n);
    }
    return pf;  // Return the list of prime factors
}

int main(){
    cout << isPrime(1080) << endl;  // Output 0 (1080 is not prime)
    return 0;
}
Explanation of the Code:
Prime Check (isPrime function)
This function checks whether a given number n is prime by checking divisibility up to sqrt(n). If no divisors are found other than 1 and n, the function returns true, indicating that the number is prime. If a divisor is found, it returns false, indicating that the number is composite.

Prime Factorization (primefactors function)
The function works by iterating through potential divisors starting from 2 up to sqrt{n}. If n is divisible by a divisor, the divisor is added to the list of prime factors, and n is divided by this divisor repeatedly until no longer divisible. If, after the loop, n is greater than 1, it is added as a prime factor.

Example: Prime Factorization of 1080
If you run the program with n = 1080, it will output the prime factorization of 1080 as:

2, 2, 2, 3, 3, 3, 5
2. The Sieve of Eratosthenes: Efficiently Finding All Primes
While prime factorization helps us break down a number into its prime factors, generating a list of all prime numbers up to a large number can be computationally expensive. Fortunately, the Sieve of Eratosthenes is an efficient algorithm to generate all primes up to a given limit in O(n*log(⁡log(⁡n))) time complexity, which is much faster than checking each number individually.

C++ Code for the Sieve of Eratosthenes
#include<bits/stdc++.h>
using namespace std;
const int N = 1e7+1;
vector<bool> isPrime(N, 1);  // Boolean vector to mark prime numbers

int main(){

    isPrime[0] = isPrime[1] = false;  // 0 and 1 are not prime

    // Sieve of Eratosthenes Algorithm
    for(int i = 2; i < N; i++){

        if(isPrime[i] == true){  // If i is prime

            for(int j = 2 * i; j < N; j += i){  // Mark all multiples of i as non-prime
                isPrime[j] = false;
            }

        }

    }
    
    int t = 1; //number of test-cases
    while(t-- > 0){
        vector<int> p;

        // Collecting all primes up to N
        for(int i = 2; i <= 1e7; i++){
            if(isPrime[i]) p.push_back(i);
        }

        // Printing the prime numbers
        for(auto it : p){
            cout << it << " ,";
        }
        cout << endl;

    }
    return 0;
}
Explanation of the Sieve of Eratosthenes Algorithm:
The Sieve of Eratosthenes works by marking the multiples of each prime number starting from 2. Here’s how it works:

Initialize a boolean array isPrime[] where each element is initially set to true, indicating that every number is assumed to be prime.
Set isPrime[0] and isPrime[1] to false since 0 and 1 are not prime.
Starting from 2, if isPrime[i] is true, mark all multiples of i as false, as they are composite numbers.
Continue this process for all numbers up to sqrt{N}, as any composite number above sqrt{N} will have already been marked.
Complexity of the Sieve of Eratosthenes:
The time complexity of this algorithm is O(n*log(⁡log(⁡n))), making it one of the most efficient methods to generate primes up to large numbers, much more efficient than testing each number for primality individually.

Practical Use:
The Sieve of Eratosthenes is extremely useful in problems where you need to find all prime numbers up to a large value, such as in cryptography or prime-based algorithms.

Conclusion:
In this blog, we’ve explored two essential algorithms in number theory: Prime Factorization and the Sieve of Eratosthenes.

Prime Factorization helps us break a number down into its prime components, which has applications in various mathematical and cryptographic problems.
The Sieve of Eratosthenes is an efficient way to generate all prime numbers up to a large limit and is widely used in number-theoretic algorithms.
Understanding these fundamental algorithms can serve as the basis for solving more complex problems in number theory and beyond.

If you have any questions or would like to learn more about number theory algorithms, feel free to leave a comment below!

Written By : Harsh @ DevSphere