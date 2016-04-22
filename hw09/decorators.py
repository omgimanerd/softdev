#!/usr/bin/python
# Author: Alvin Lin (alvin.lin.dev@gmail.com)

import time

def debug(fn):
    def wrapped_fn(*args, **kwargs):
        print "%s%s" % (fn.func_name, args)
        return fn(*args, **kwargs)
    return wrapped_fn

def runtime(fn):
    def wrapped_fn(*args, **kwargs):
        start_time = time.time()
        result = fn(*args, **kwargs)
        print "Runtime: %ss" % (time.time() - start_time)
        return result
    return wrapped_fn

@debug
@runtime
def trash(*args, **kwargs):
    print 'blhasd;fiahsd;fliahsdf' + str(args) + str(kwargs)

trash('what', 'the', 1, 2, 3, hey='no')
