#!/usr/bin/python
# Author: Alvin Lin (alvin.lin.dev@gmail.com)

from itertools import product

def accepts_list(fn):
    def wrapped_fn(*args):
        if not all([isinstance(x, list) for x in args]):
            raise TypeError('%s can only be called with lists' % fn.func_name)
        return fn(*args)
    return wrapped_fn

def accepts(*arg_types):
    def wrapper(fn):
        def wrapped_fn(*args):
            if len(args) != len(arg_types):
                raise TypeError('what')
            if not all([isinstance(
                    arg, arg_types[i]) for i, arg in enumerate(args)]):
                raise TypeError('no')
            return fn(*args)
        return wrapped_fn
    return wrapper

@accepts(set, set)
def union(a, b):
    return a | b

@accepts(set, set)
def intersection(a, b):
    # res = []
    # [res.append(x) for x in a + b if x in a and x in b and x not in res]
    # return res
    return a & b

@accepts(set, set)
def set_difference(u, a):
    # res = []
    # [res.append(x) for x in u if x not in a]
    # return res
    return a - u
    
@accepts(set, set)
def symmetric_difference(a, b):
    # return set_difference(union(a, b), intersection(a, b))
    return a ^ b

@accepts(set, set)
def cartesian_product(a, b):
    # res = []
    # for x in a:
    #     for y in b:
    #         res.append([x, y])
    # return res
    return set([x for x in product(a, b)])

print union({1, 2, 3}, {3, 4, 5, 1})
print intersection({1, 2, 3}, {3, 4, 5})
print set_difference({1, 2, 3}, {3, 4, 5})
print set_difference({3, 4, 5}, {1, 2, 3})
print symmetric_difference({1, 2, 3}, {3, 4, 5})
print cartesian_product({1, 2, 3}, {4, 5, 6})
