import java.util.ArrayList;
import java.util.Arrays;

/**
 * FWGC_State defines a state for the classic Farmer,Wolf,Goat,Cabbage problem.
 * invalidStates are stored, not generated. Generated states are checked for
 * validity against the invalidStates 2D-array, and removed from the successors
 * array(list) if invalid. A state is defined as a 4-bit string (encapsulated by
 * the Pos enum) which represents whether a particular entity (in the order
 * FWGC) is on the west or east side of the river.
 * 
 * @author Michael Langston && Gabe Ferrer
 * 
 */
public class FWGC_State implements State
{
	// constant for the goal state
	private final FWGC_State.Pos[] GOAL = new FWGC_State.Pos[]
	{ Pos.E, Pos.E, Pos.E, Pos.E };

	/*
	 * All fwgc states are defined by the 4-item array of Pos primitives, either
	 * east or west (side of the river) for each member of the problem
	 * "Farmer, Wolf, Goat, Cabbage" in that order
	 */
	public enum Pos
	{
		W, E
	};

	// The current 4-bit representation of the state
	public Pos[] curState;

	/**
	 * Default Constructor
	 */
	public FWGC_State()
	{
		curState = new Pos[]
		{ Pos.W, Pos.W, Pos.W, Pos.W };

	}

	/**
	 * Polymorphic constructor #1
	 * 
	 * @param fPos
	 *            - Farmer position
	 * @param wPos
	 *            - Wolf position
	 * @param gPos
	 *            - Goat position
	 * @param cPos
	 *            - Cabbage position
	 */
	public FWGC_State(Pos fPos, Pos wPos, Pos gPos, Pos cPos)
	{
		curState = new Pos[]
		{ fPos, wPos, gPos, cPos };
	}

	/**
	 * Polymorphic constructor #2
	 * 
	 * @param stateArr
	 *            - Array containing a state, which has all four positions
	 */
	public FWGC_State(FWGC_State.Pos[] stateArr)
	{
		curState = new Pos[]
		{ stateArr[0], stateArr[1], stateArr[2], stateArr[3] };
	}

	/**
	 * How much it costs to come to this state
	 */
	@Override
	public double findCost()
	{
		return 1;
	}

	/**
	 * Generate all possible successors to the current state.
	 * 
	 * Will trim out successor states that match a state description in the
	 * "invalid states" array.
	 */
	@Override
	public ArrayList<State> genSuccessors()
	{
		ArrayList<State> successors = new ArrayList<State>();
		FWGC_State.Pos[] tempState = Arrays.copyOf(curState, curState.length);
		/*
		 * If the farmer is on the west He can take the w
		 */

		// if the farmer is on the west
		if (tempState[0] == Pos.W)
		{
			// he must select an entity to take
			// taking the wolf east, if the goat isn't alone there
			if (tempState[1] == Pos.W)
			{
				tempState[0] = Pos.E;
				tempState[1] = Pos.E;
				successors.add(new FWGC_State(tempState));
				tempState = Arrays.copyOf(curState, curState.length);// reset
			}
			// taking the goat east
			if (tempState[2] == Pos.W)
			{
				tempState[0] = Pos.E;
				tempState[2] = Pos.E;
				successors.add(new FWGC_State(tempState));
				tempState = Arrays.copyOf(curState, curState.length);
			}
			// taking the cabbage east, if the goat isn't alone there
			if (tempState[3] == Pos.W)
			{
				tempState[0] = Pos.E;
				tempState[3] = Pos.E;
				successors.add(new FWGC_State(tempState));
				tempState = Arrays.copyOf(curState, curState.length);
			}
			// going alone, if we didn't add anything
			tempState[0] = Pos.E;
			successors.add(new FWGC_State(tempState));
			tempState = Arrays.copyOf(curState, curState.length);

		}
		// if the farmer is on the east
		else
		{
			// he must select an entity to take
			// taking the wolf west
			if (tempState[1] == Pos.E)
			{
				tempState[0] = Pos.W;
				tempState[1] = Pos.W;
				successors.add(new FWGC_State(tempState));
				tempState = Arrays.copyOf(curState, curState.length);
			}
			// taking the goat west
			if (tempState[2] == Pos.E)
			{
				tempState[0] = Pos.W;
				tempState[2] = Pos.W;
				successors.add(new FWGC_State(tempState));
				tempState = Arrays.copyOf(curState, curState.length);
			}
			// taking the cabbage west
			if (tempState[3] == Pos.E)
			{
				tempState[0] = Pos.W;
				tempState[3] = Pos.W;
				successors.add(new FWGC_State(tempState));
				tempState = Arrays.copyOf(curState, curState.length);
			}
			// going alone
			tempState[0] = Pos.W;
			successors.add(new FWGC_State(tempState));
			tempState = Arrays.copyOf(curState, curState.length);

		}
		for (int i = 0; i < successors.size(); i++)
		{
			FWGC_State s = (FWGC_State) successors.get(i);
			tempState = s.curState;
			// check for conflicts, also don't return to the starting state why
			// not
			if (Arrays.equals(tempState, new FWGC_State.Pos[]
			{ Pos.E, Pos.E, Pos.W, Pos.W })
					|| Arrays.equals(tempState, new FWGC_State.Pos[]
					{ Pos.E, Pos.W, Pos.W, Pos.W })
					|| Arrays.equals(tempState, new FWGC_State.Pos[]
					{ Pos.E, Pos.W, Pos.W, Pos.E })
					|| Arrays.equals(tempState, new FWGC_State.Pos[]
					{ Pos.W, Pos.E, Pos.E, Pos.W })
					|| Arrays.equals(tempState, new FWGC_State.Pos[]
					{ Pos.W, Pos.W, Pos.E, Pos.E })
					|| Arrays.equals(tempState, new FWGC_State.Pos[]
					{ Pos.W, Pos.E, Pos.E, Pos.E })
					|| Arrays.equals(tempState, new FWGC_State.Pos[]
					{ Pos.W, Pos.W, Pos.W, Pos.W }))
			{
				successors.remove(i);
				i = 0; // start the search over to ensure all nodes are checked
						// x.x
			}
		}
		return successors;
	}

	/**
	 * Check to see if the current state is the goal state.
	 * 
	 * @return - true or false, depending on whether the current state matches
	 *         the goal
	 */
	@Override
	public boolean isGoal()
	{
		if (Arrays.equals(curState, GOAL))
		{
			return true;
		}
		return false;
	}

	/**
	 * Overriden equals method. Generated by Eclipse
	 */
	@Override
	public boolean equals(Object obj)
	{
		if (this == obj)
			return true;
		else if (obj == null)
			return false;
		else if (getClass() != obj.getClass())
			return false;
		FWGC_State other = (FWGC_State) obj;
		if (!curState.equals(other.curState))
			return false;
		return true;
	}

	/**
	 * Method to print out the current state. Prints the current position of
	 * each thing.
	 */
	@Override
	public void printState()
	{
		System.out.println("Farmer: " + curState[0]);
		System.out.println("Wolf: " + curState[1]);
		System.out.println("Goat: " + curState[2]);
		System.out.println("Cabbage: " + curState[3]);
	}

	/**
	 * Overloaded equals method to compare two states.
	 * 
	 * @return true or false, depending on whether the states are equal
	 */
	@Override
	public boolean equals(State s)
	{
		if (Arrays.equals(curState, ((FWGC_State) s).getCurState()))
		{
			return true;
		}
		else
			return false;

	}

	/**
	 * @return the curState
	 */
	public Pos[] getCurState()
	{
		return curState;
	}
}
