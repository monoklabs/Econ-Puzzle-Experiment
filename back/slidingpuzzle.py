# -*- coding: utf-8 -*-
"""
A* sliding puzzle solver
Solver script for the fifteen-puzzle and derivations of it (8-puzzle etc.),
based on what we've learnt on ai-class.com so far. Don't expect it to run very
fast, certain puzzle states take ages to solve. I have documented and
commented the code thoroughly, so hopefully it's easy to understand what's
going on.

Written by Håvard Pettersson. Released into the public domain.

Example usage:

    >>> from slidingpuzzle import Board
    >>> b = Board(3, "1,8,7,3,0,5,4,6,2")
    >>> print b
     1  8  7
     3     5
     4  6  2
    >>> b.get_solution()
    Solution found!
    Moves: 22
    Nodes visited: 601
    Time: 0.856076
    All moves: (1, 0), (2, 0), ..., (2, 2)
"""

import copy
import math
import time
import bisect
import random
import itertools

class Board:
    """

    Contains the state of a sliding puzzle board, as well as some methods for
    manipulating it.

    """
    def __init__(self, size=4, text=None):
        """
        Initialize a new Board object.

        Keyword arguments:
            size -- the width/height of the board to create (default: 4)
            text -- string representation of the board; a comma-separated
                    string of numbers where 0 represents the empty tile
                    (optional; if left out a board at the goal state will be
                    generated)
        """
        if size < 2: raise ValueError("Board has to be at least 2 by 2 tiles large")
        self._size = size
        size_sq = size * size

        if text != None:
            values = [int(n) for n in text.split(",")]

            # make sure we have valid input
            if sorted(values) != range(size_sq):
                raise ValueError("Invalid tile values supplied")
        else:
            # we are not given a string input, create a plain board
            values = range(1, size_sq) + [0]
        
        # list comprehension voodoo to put the values into a nested list
        self._tiles = [[n if n > 0 else None for n in values[y * size:(y + 1) * size]] for y in range(size)]
        
        # store the location of the empty tile
        self._empty = values.index(0) % size, values.index(0) / size
        
        # store the goal location of each tile
        self.goals = {}
        for x in range(size_sq):
            self.goals[x + 1] = x % size, x / size
        self.goals[None] = self.goals[x + 1]
    
    def get_solution(self):
        """
        Solve a sliding puzzle board. Note that this only prints the actual moves,
        it does not change the board to its solved state.
        """
        start_time = time.clock()
        frontier = [Node(self, None, 0, None)]
        explored = []
        visited = 0

        while True:
            visited += 1
            # pop the lowest value from the frontier (sorted using bisect, so pop(0) is the lowest)
            node = frontier.pop(0)

            # if the current node is at the goal state, we're done! 
            if node.board.h() == 0:
                # recursively compile a list of all the moves
                moves = []
                while node.parent:
                    moves.append(node.action)
                    node = node.parent
                moves.reverse()

                print "Solution found!"
                print "Moves:", len(moves)
                print "Nodes visited:", visited
                print "Time:", time.clock() - start_time
                print "All moves:", ", ".join(str(move) for move in moves)
                break
            else:
                # we're not done yet:
                # expand the node, and add the new nodes to the frontier, as long
                # as they're not in the frontier or explored list already
                for new_node in node.expand():
                    if new_node not in frontier and new_node not in explored:
                        # use bisect to insert the node at the proper place in the frontier
                        bisect.insort(frontier, new_node)
                
                explored.append(node)
    
    def h(self):
        """
        The heuristic function for A*. Currently implemented as the sum of
        the Manhattan distance between each tile and it's goal position.
        """
        h = 0
        for y, row in enumerate(self._tiles):
            for x, tile in enumerate(row):
                h += math.fabs(x - self.goals[tile][0]) + \
                     math.fabs(y - self.goals[tile][1])
        return h
    
    def apply_action(self, action):
        """
        Apply an action (a move) to the board.

        Arguments:
            action -- a 2-tuple containing the x,y coordinate of the tile to move
        
        Raises a ValueError on invalid moves.
        """
        x, y = action
        e_x, e_y = self._empty

        # check that the tile to move and the empty tile are neighbors
        if (math.fabs(x - e_x) == 1) ^ (math.fabs(y - e_y) == 1):
            # swap them
            self._tiles[y][x], self._tiles[e_y][e_x] = None, self._tiles[y][x]
            self._empty = x, y # empty tile has moved; store new location
        else:
            raise ValueError("Invalid move")

    def actions(self):
        """Return a list of possible actions to perform on the board."""
        x, y = self._empty

        actions = []

        if x > 0: actions.append((x - 1, y))
        if y > 0: actions.append((x, y - 1))
        if x < self._size - 1: actions.append((x + 1, y))
        if y < self._size - 1: actions.append((x, y + 1))

        return actions
    
    def randomize(self, moves=1000):
        """
        Randomize the board.

        Arguments:
            moves -- the amound of random moves to perform (default: 1000)
        """
        for _ in range(moves): self.apply_action(random.choice(self.actions()))
    
    def __str__(self):
        grid = "\n".join([" ".join(["{:>2}"] * self._size)] * self._size)
        values = itertools.chain(*self._tiles)
        return grid.format(*values).replace("None", "  ")


class Node:
    """

    Represents a node in the A* search algorithm graph.

    """
    def __init__(self, board, action, cost, parent):
        """
        Initialize a new Node object.

        Arguments:
            board -- the board state at this node (Board object)
            action -- the action that took us here from the previous node
            cost -- the total cost of the path from the initial node to this
                    node (the "g" component of the A* algorithm)
            parent -- the previous Node object
        """
        self.board = board
        self.action = action
        self.cost = cost
        self.parent = parent
        self.estimate = cost + board.h() # A* "f" function
    
    def expand(self):
        """Return a list possible nodes to move to from this node."""
        nodes = []

        for action in self.board.actions():
            # copy the current board
            board = copy.deepcopy(self.board)
            board.apply_action(action)

            nodes.append(Node(board, action, self.cost + 1, self))
        
        return nodes

    def __eq__(self, rhs):
        # when checking nodes for equality, compare their boards instead
        # thus, when checking if a node is in the frontier/explored list, check
        # for the board configuration instead
        if isinstance(rhs, Node):
            return self.board._tiles == rhs.board._tiles
        else:
            return rhs == self

    def __lt__(self, rhs):
        # when comparing nodes (sorting), compare their estimates (so they are sorted by estimates)
        return self.estimate < rhs.estimate
