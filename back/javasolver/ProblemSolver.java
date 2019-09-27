public class ProblemSolver
{

	/*
	 * We expect arguments in the form:
	 * 
	 * ./ProblemSolver <-d> dfs/bfs/aso/asm <initial state> <optional parameter>
	 * 
	 * Example: ./ProblemSolver dfs 0 1 2 3 4 5 6 7 8
	 * 
	 * See Readme for more information.
	 */
	public static void main(String[] args)
	{
		// Numbers to be adjusted if the debug toggle is present, as components
		// of args will be in different locations if it is.
		int searchTypeDebug = 0;
		int eightPuzzleDebug = 1;
		boolean debug = false;

		// Print out correct usage and end the program if there aren't any
		// parameters
		if (args.length < 1)
		{
			printUsage();
		}

		// Check for debug toggle
		if (args[0].equals("-d"))
		{
			searchTypeDebug = 1;
			eightPuzzleDebug = 2;
			debug = true;
			System.out.println("Search Type passed in: "
					+ args[searchTypeDebug].toLowerCase());
		}

		String searchType = args[searchTypeDebug].toLowerCase();

		if (args.length > 2) // We will run with 8puzzle
		{
			int[] startingStateBoard = dispatchEightPuzzle(args,
					eightPuzzleDebug);

			if (searchType.equals("dfs")) // Use DFSearch.java
			{
				DFSearch.search(startingStateBoard, debug);
			}
			else if (searchType.equals("bfs")) // Use BFSearch.java
			{
				BFSearch.search(startingStateBoard, debug);
			}
			// Use AStarSearch.java with number out of place
			else if (searchType.equals("aso"))
			{
				AStarSearch.search(startingStateBoard, debug, 'o');
			}
			// Use AStarSearch.java with Manhattan Distance
			else if (searchType.equals("asm"))
			{
				AStarSearch.search(startingStateBoard, debug, 'm');
			}
			// An invalid searchType has been passed in. Print correct usage and
			// end the program.
			else
			{
				printUsage();
			}
		}

		else
		// We will run with fwgc
		{
			if (searchType.equals("dfs")) // Use DFSearch.java
			{
				DFSearch.search(debug);
			}
			else if (searchType.equals("bfs")) // Use BFSearch.java
			{
				BFSearch.search(debug);
			}
			else
			{
				printUsage();
			}
		}
	}

	// Helper method to print the correct usage and end the program
	private static void printUsage()
	{
		System.out.println("Usage: ./Main <searchType> [Initial Puzzle State]");
		System.exit(-1);
	}

	// Helper method to build our initial 8puzzle state passed in through args
	private static int[] dispatchEightPuzzle(String[] a, int d)
	{
		int[] initState = new int[9];
		// i -> loop counter
		for (int i = d; i < a.length; i++)
		{
			initState[i - d] = Integer.parseInt(a[i]);
		}
		return initState;
	}
}
