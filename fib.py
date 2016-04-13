#!/usr/bin/python

def memoize(fn):
    cache = {}
    def wrapped_fn(*args, **kwargs):        
        if repr(args) in cache:
            return cache[repr(args)]
        result = fn(*args, **kwargs)
        cache[repr(args)] = result
        return result
    return wrapped_fn

@memoize
def fib(n):
    if n < 1:
        raise ValueError("No can do bruh")
    return 1 if n == 1 or n == 2 else fib(n - 1) + fib(n - 2)

for i in range(1, 100):
    print fib(i)
