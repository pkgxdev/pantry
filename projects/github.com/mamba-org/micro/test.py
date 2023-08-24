#!/usr/bin/env python
# https://www.pugetsystems.com/labs/hpc/standalone-python-conda-envs-without-installing-conda-using-micromamba-2287/

"""
Matrix multiplication of 2 n x n matrices
"""

import numpy as np
import time

n = 8000
A = np.array(np.random.rand(n, n))
B = np.array(np.random.rand(n, n))
C = np.empty_like(A)

start_time = time.time()
C = np.matmul(A, B)
run_time = time.time() - start_time

print( f'{(2e-9 * (n ** 3 + n ** 2)) / run_time :.2f} GFLOPS' )
