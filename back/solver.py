# -*- coding: utf-8 -*-
import sys
from slidingpuzzle import Board
size = sys.argv[1]
board = sys.argv[2]
b = Board(int(size), board)
print b
print(b.get_solution())