#!/usr/bin/python

"""
Duck
(lambda (a b) (* a b)) is a function that takes two parameters, a and b
and returns their product.

(define foo (lambda (a b) (* a b))) is a function that returns the previous
function, you can pass parameters into that return value since it is a function
and is callable.
"""

def repeat(word):
    def fn(n):
        return word * n
    return fn

r1 = repeat("hello")
r2 = repeat("goodbye")

print r1(2)
print r2(2)
print repeat("cool")(3)
