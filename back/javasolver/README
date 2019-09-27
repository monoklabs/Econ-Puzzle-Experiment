===============
=== READ ME ===
===============


IT340 Program 1

Michael Langston & Gabe Ferrer

Generic problem solver capable of performing different types of searches.
Currently performs the following searches:

Depth-first ('dfs')
Breadth-first ('bfs')
A* Search ('asm' or 'aso' depending on heuristic) (only usable with 8puzzle)

You must specify the searchtype as an argument to the
main program binary (ProblemSolver). 

A* Search can use one of two heuristics:

Number Out of Place ('aso')
Manhattan Distance ('asm')

The solver is generic and can solve different types of problems. 
Currently can solve the following puzzles:

Farmer,Wolf,Goat,Cabbage (fwgc)
8-puzzle

Compilation:
	javac ProblemSolver.java
	
A note on command-line examples:
	Parameters in <> mean you pick one of the ones
	Parameters in [] means the parameter is optional
	-Xmx1024 gives the Java Virtual Machine more memory to run, and is required for this program

Execution:
	If a starting board state is passed as a command line parameter,
	it will be assumed that the user attempts to run 8-puzzle. So, to invoke 
	a solution to fwgc:

		java -Xmx1024m ProblemSolver <dfs/bfs> 

	and for 8-puzzle

		java -Xmx1024m ProblemSolver <dfs/bfs> <starting board>
		
	To run with debug, add -d to the beginning:
		java -Xmx1024m ProblemSolver -d <dfs/bfs> [starting board]

	Example usage for bfs with 8-puzzle and debug enabled:
		java -Xmx1024m ProblemSolver -d bfs 5 6 8 4 0 1 2 3 7
	Example usage for dfs with fwgc with no debug:
		java -Xmx1024m ProblemSolver dfs
	Example usage for dfs with 8-puzzle and debug enabled:
		java -Xmx1024m ProblemSolver -d dfs 5 6 8 4 0 1 2 3 7
	Example usage for aso with debug enabled:
		java -Xmx1024m ProblemSolver -d aso 5 6 8 4 0 1 2 3 7
	Example usage for asm with no debug:
		java -Xmx1024m ProblemSolver asm 5 6 8 4 0 1 2 3 7