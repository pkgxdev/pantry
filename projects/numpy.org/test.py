import numpy as np
t = np.ones((3,3), int)
assert t.sum() == 9
assert np.dot(t, t).sum() == 27