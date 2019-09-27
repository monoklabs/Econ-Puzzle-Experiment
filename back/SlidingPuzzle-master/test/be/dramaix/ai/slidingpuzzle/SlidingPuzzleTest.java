package be.dramaix.ai.slidingpuzzle;

import junit.framework.TestCase;

import org.junit.Ignore;

import be.dramaix.ai.slidingpuzzle.server.search.IDAStar;
import be.dramaix.ai.slidingpuzzle.server.search.SearchAlgorithm;
import be.dramaix.ai.slidingpuzzle.server.search.heuristic.LinearConflict;
import be.dramaix.ai.slidingpuzzle.server.search.heuristic.ManhattanDistance;
import be.dramaix.ai.slidingpuzzle.server.search.heuristic.UseHeuristic;
import be.dramaix.ai.slidingpuzzle.shared.Node;
import be.dramaix.ai.slidingpuzzle.shared.Path;
import be.dramaix.ai.slidingpuzzle.shared.State;

public class SlidingPuzzleTest extends TestCase {

	@Ignore
	public void test3x3() {

		runAStar(SLIDE_3X3, State.GOAL_3_3);

	}
	
	
	public void test4x4() {

		runAStar(SLIDE_4X4, State.GOAL_4_4);

	}

	public void runAStar(byte[][] testData, State goal){
		long averageTime = 0;
		int solutionLength = 0;
		int inError = 0;

		for (byte[] startState : testData) {
			SearchAlgorithm algo = new IDAStar();
			//((UseHeuristic)algo).setHeuristic(new LinearConflict());
			((UseHeuristic)algo).setHeuristic(new ManhattanDistance());
			long startTime = System.nanoTime();
			Path solution = algo.resolve(new State(startState), goal).getPath();
			if (solution != null){
				averageTime += (System.nanoTime() - startTime);
				solutionLength += solution.length();
			}else{
				inError++;
			}

		}

		int inSuccess = testData.length - inError;
		System.out.println("Puzzle resolved : " +inSuccess + "("+inSuccess/testData.length*100+"%)");
		System.out.println("Puzzle not resolved : " +inError + "("+inError/testData.length*100+"%)");
		System.out.println("Average time : " + (averageTime / inSuccess));
		System.out.println("Average length : " + (solutionLength / inSuccess));

	}
	
	
	public void testLinearConflictHeuristic(){
		LinearConflict lc = new LinearConflict();
		
		//MD : 8 + horizontal conflict : 6
		State s = new State(new byte[]{4,3,2,1,5,6,7,8,9,10,11,12,13,14,15,0});
		assertEquals(8+6, lc.h(new Node(s)));
		
		
		//MD : 8 + vertical conflict : 6
		s = new State(new byte[]{13,2,3,4,9,6,7,8,5,10,11,12,1,14,15,0});
					
		assertEquals(8+6, lc.h(new Node(s)));
		
		//vertical and horizontal conflict
		s = new State(new byte[]{13, 4, 3, 2,
								  9, 6, 7, 8,
								  5,10,11,12,
								  1,14,15, 0});
		
		assertEquals(12 + 10,  lc.h(new Node(s)));
		
		
		s = new State(new byte[]{ 4, 3, 2, 1,
				                  5, 7,10, 8,
				                  9, 6,11,12,
				                 13,14,15, 0});
		assertEquals(12 + 6, lc.h(new Node(s)));
	
		 
		
		s = new State(new byte[]{ 2, 8, 1, 7,   
								 12, 4, 13, 3,  
								 15, 10, 9, 5,  
								 11, 6, 0, 14});
		assertEquals(37 + 6, lc.h(new Node(s)));
		
		
	}
	
	

	public static final byte[][] SLIDE_4X4 = {
			{ 8,2,6,4,5,7,10,11,9,12,0,13,14,3,1,15}/*,
			{6,1,0,3,8,13,2,11,4,9,7,15,12,5,14,10 },
			{ 10,11,2,14,6,8,5,3,4,1,13,7,9,12,0,15},
			{ 6,4, 10, 2, 9, 8, 1, 7, 5, 11, 3, 13, 12, 14, 0, 15 },
			{ 1, 8, 2, 7, 12, 6, 13, 3, 15, 5, 9, 10, 11, 4, 0, 14 },
			{ 13, 4, 2, 5, 0, 10, 14, 3, 6, 1, 15, 12, 8, 7, 9, 11 },
			{ 6, 3, 0, 4,7, 5, 15, 11, 14, 13, 1, 2, 12, 9, 8, 10 },
			{ 2, 3, 5, 11, 4, 7, 0, 6, 13, 9, 12, 1, 8, 14, 10, 15 },
			{ 2, 4, 1, 3, 6, 12, 7, 0, 5, 10, 9, 11, 13, 8, 14, 15 },
			{ 5, 10, 2, 3, 1, 4, 7, 11, 15, 8, 0, 13, 12, 6, 14, 9 },
			{ 1, 2, 6, 3, 5, 8, 11, 14, 13, 12, 15, 9, 7, 0, 4, 10 },
			{ 4, 13, 1, 2, 9, 11, 12, 3, 10, 8, 15, 6, 0, 7, 5, 14 },
			{ 8, 4, 2, 3, 6, 7, 0, 1, 5, 13, 14, 15, 10, 9, 12, 11 },
			{ 9, 2, 5, 15, 1, 14, 0, 7, 4, 8, 11, 6, 12, 10, 13, 3 },
			{ 1, 2, 3, 7, 4, 14, 6, 11, 8, 12, 0, 15, 5, 9, 13, 10 },
			{ 2, 12, 6, 1, 5, 15, 3, 7, 4, 8, 11, 0, 13, 9, 10, 14 },
			{ 6, 12, 2, 3, 5, 8, 4, 0, 9, 11, 10, 7, 1, 13, 15, 14 },
			{ 13, 1, 9, 3, 4, 5, 7, 11, 15, 0, 10, 2, 6, 8, 12, 14 },
			{ 5, 4, 3, 9, 10, 13, 12, 0, 14, 15, 2, 7, 8, 11, 6, 1 },
			{ 4, 1, 3, 5, 9, 11, 2, 15, 10, 8, 13, 7, 6, 0, 12, 14 },
			{ 1, 8, 4, 0, 9, 12, 10, 3, 5, 6, 7, 13, 15, 11, 2, 14 },
			{ 2, 6, 10, 0, 3, 5, 7, 11, 1, 4, 12, 9, 13, 8, 14, 15 },
			{ 6, 0, 4, 3, 2, 10, 14, 7, 9, 5, 13, 8, 12, 11, 1, 15 },
			{ 10, 1, 7, 3, 6, 2, 14, 9, 4, 5, 12, 13, 0, 8, 15, 11 },
			{ 1, 6, 4, 5, 2, 9, 0, 3, 8, 10, 7, 15, 12, 13, 11, 14 },
			{ 13, 4, 7, 12, 1, 6, 0, 3, 9, 2, 14, 10, 8, 15, 5, 11 },
			{ 5, 13, 2, 7, 1, 6, 4, 9, 10, 15, 3, 0, 12, 8, 11, 14 },
			{ 1, 10, 12, 6, 2, 13, 3, 7, 15, 9, 8, 4, 5, 11, 0, 14 },
			{ 6, 4, 11, 1, 9, 0, 12, 3, 5, 2, 13, 15, 10, 8, 7, 14 },
			{ 4, 1, 3, 6, 7, 5, 0, 15, 14, 10, 2, 11, 8, 13, 9, 12 },
			{ 6, 0, 3, 15, 5, 8, 1, 11, 4, 10, 7, 2, 9, 12, 13, 14 },
			{ 4, 1, 5, 3, 0, 13, 7, 6, 9, 8, 12, 11, 10, 14, 2, 15 },
			{ 7, 8, 11, 1, 6, 5, 0, 2, 12, 9, 4, 3, 14, 10, 15, 13 },
			{ 8, 1, 9, 2, 4, 15, 0, 6, 12, 11, 3, 7, 10, 14, 13, 5 },
			{ 4, 5, 8, 6, 2, 1, 13, 9, 0, 14, 7, 3, 12, 10, 15, 11 },
			{ 1, 15, 6, 3, 4, 13, 2, 9, 8, 14, 7, 0, 10, 5, 12, 11 },
			{ 4, 14, 1, 3, 5, 13, 2, 7, 10, 12, 9, 11, 8, 0, 15, 6 },
			{ 8, 1, 0, 14, 5, 12, 3, 6, 4, 9, 7, 15, 10, 2, 13, 11 },
			{ 0, 4, 7, 2, 1, 8, 3, 6, 13, 9, 14, 10, 12, 5, 11, 15 },
			{ 0, 8, 13, 1, 4, 3, 5, 9, 12, 15, 6, 2, 14, 11, 7, 10 },
			{ 5, 2, 9, 10, 1, 15, 3, 6, 4, 14, 7, 12, 8, 13, 11, 0 },
			{ 5, 2, 14, 10, 1, 12, 11, 7, 3, 4, 6, 0, 9, 8, 13, 15 },
			{ 14, 8, 0, 9, 4, 5, 1, 3, 11, 12, 10, 6, 2, 13, 15, 7 },
			{ 4, 1, 8, 6, 2, 13, 7, 14, 3, 0, 15, 9, 5, 12, 10, 11 },
			{ 1, 11, 10, 3, 4, 0, 13, 9, 14, 7, 8, 6, 5, 2, 15, 12 },
			{ 8, 4, 7, 1, 11, 13, 2, 10, 9, 5, 6, 15, 12, 0, 3, 14 },
			{ 5, 8, 10, 1, 9, 2, 3, 4, 12, 15, 14, 6, 0, 13, 11, 7 },
			{ 9, 3, 6, 7, 2, 10, 1, 15, 5, 12, 0, 14, 4, 8, 11, 13 },
			{ 8, 4, 7, 11, 9, 3, 6, 10, 5, 15, 2, 1, 12, 0, 13, 14 },
			{ 2, 0, 6, 3, 5, 4, 11, 15, 12, 8, 7, 14, 9, 1, 13, 10 },
			{ 10, 8, 2, 7, 11, 1, 15, 6, 14, 5, 13, 9, 4, 0, 12, 3 },
			{ 4, 0, 1, 10, 15, 7, 2, 3, 8, 14, 9, 5, 12, 6, 13, 11 },
			{ 14, 2, 3, 1, 4, 5, 9, 7, 6, 15, 13, 8, 10, 12, 0, 11 },
			{ 1, 3, 11, 7, 4, 0, 15, 10, 8, 2, 14, 6, 9, 12, 5, 13 },
			{ 13, 1, 3, 10, 7, 12, 6, 4, 9, 0, 11, 8, 15, 2, 5, 14 },
			{ 5, 0, 11, 7, 1, 9, 13, 3, 4, 10, 6, 12, 8, 14, 2, 15 },
			{ 5, 1, 2, 10, 8, 9, 11, 6, 15, 12, 14, 4, 13, 0, 7, 3 },
			{ 15, 1, 6, 7, 5, 4, 8, 11, 12, 9, 14, 13, 2, 0, 10, 3 },
			{ 6, 7, 14, 9, 1, 0, 5, 11, 4, 15, 8, 10, 2, 3, 12, 13 },
			{ 1, 6, 7, 3, 12, 14, 15, 11, 10, 4, 13, 2, 0, 5, 9, 8 },
			{ 5, 3, 13, 2, 1, 6, 12, 0, 4, 11, 9, 8, 14, 7, 10, 15 },
			{ 1, 2, 14, 3, 0, 9, 5, 7, 4, 12, 6, 11, 15, 8, 13, 10 },
			{ 0, 4, 3, 14, 8, 9, 5, 2, 1, 6, 10, 7, 13, 12, 15, 11 },
			{ 0, 8, 3, 7, 5, 13, 2, 1, 10, 4, 15, 14, 9, 11, 6, 12 },
			{ 3, 5, 1, 11, 6, 0, 2, 10, 8, 4, 7, 15, 12, 13, 14, 9 },
			{ 1, 13, 6, 2, 8, 0, 12, 9, 11, 5, 4, 15, 14, 10, 3, 7 },
			{ 13, 5, 4, 3, 2, 0, 11, 7, 10, 6, 15, 14, 8, 12, 1, 9 },
			{ 9, 4, 14, 2, 8, 0, 1, 6, 5, 12, 10, 3, 15, 13, 11, 7 },
			{ 13, 1, 5, 2, 6, 9, 0, 8, 7, 10, 11, 3, 12, 4, 14, 15 },
			{ 6, 3, 1, 7, 5, 13, 11, 2, 8, 0, 14, 4, 12, 9, 15, 10 },
			{ 2, 8, 14, 7, 4, 3, 6, 13, 1, 0, 10, 11, 12, 15, 5, 9 },
			{ 6, 11, 0, 1, 4, 8, 7, 3, 2, 9, 13, 10, 12, 14, 15, 5 },
			{ 8, 5, 3, 9, 13, 4, 2, 7, 12, 6, 15, 14, 0, 1, 10, 11 },
			{ 6, 1, 2, 11, 0, 9, 3, 15, 4, 12, 5, 13, 14, 8, 10, 7 },
			{ 10, 4, 6, 7, 9, 8, 14, 2, 5, 13, 0, 3, 12, 1, 11, 15 },
			{ 3, 10, 6, 14, 2, 0, 7, 15, 1, 9, 8, 13, 12, 5, 4, 11 },
			{ 4, 1, 2, 3, 6, 8, 11, 9, 0, 7, 12, 10, 14, 5, 13, 15 },
			{ 5, 3, 14, 7, 9, 4, 11, 13, 12, 0, 1, 2, 8, 10, 6, 15 },
			{ 14, 8, 3, 9, 4, 2, 1, 7, 0, 11, 13, 15, 6, 5, 12, 10 },
			{ 4, 8, 11, 1, 15, 3, 2, 7, 9, 12, 6, 0, 13, 10, 14, 5 },
			{ 3, 6, 9, 5, 4, 1, 2, 11, 13, 12, 15, 0, 8, 14, 7, 10 },
			{ 1, 10, 2, 6, 4, 5, 15, 9, 13, 12, 14, 0, 11, 3, 7, 8 },
			{ 5, 1, 12, 6, 8, 4, 15, 3, 9, 13, 11, 2, 14, 10, 7, 0 },
			{ 7, 14, 8, 6, 5, 4, 3, 2, 1, 12, 0, 11, 15, 9, 13, 10 },
			{ 12, 9, 6, 10, 5, 2, 3, 4, 0, 15, 1, 7, 14, 8, 13, 11 },
			{ 4, 5, 6, 15, 8, 3, 14, 2, 12, 9, 1, 10, 0, 7, 11, 13 },
			{ 8, 5, 2, 1, 4, 3, 9, 0, 13, 12, 11, 6, 14, 10, 15, 7 },
			{ 5, 2, 11, 6, 7, 1, 13, 3, 4, 0, 12, 8, 10, 15, 14, 9 },
			{ 2, 1, 6, 11, 0, 12, 9, 7, 3, 5, 14, 10, 13, 8, 15, 4 },
			{ 2, 1, 8, 6, 11, 9, 7, 0, 5, 14, 4, 15, 10, 13, 3, 12 },
			{ 5, 0, 7, 15, 4, 13, 11, 2, 1, 9, 8, 3, 14, 6, 12, 10 },
			{ 2, 1, 6, 7, 9, 10, 0, 14, 4, 3, 5, 11, 13, 12, 8, 15 },
			{ 1, 6, 5, 3, 2, 8, 11, 10, 0, 4, 7, 15, 12, 14, 9, 13 },
			{ 1, 3, 0, 7, 8, 2, 15, 5, 4, 11, 6, 12, 10, 9, 14, 13 },
			{ 4, 2, 7, 15, 1, 9, 3, 14, 5, 12, 13, 8, 0, 11, 6, 10 },
			{ 5, 0, 8, 2, 13, 10, 1, 15, 4, 14, 11, 3, 12, 9, 6, 7 },
			{ 5, 7, 8, 4, 13, 2, 11, 3, 9, 15, 12, 1, 14, 0, 10, 6 },
			{ 4, 10, 0, 2, 13, 1, 12, 7, 8, 3, 15, 14, 9, 6, 5, 11 },
			{ 3, 4, 2, 6, 1, 7, 11, 14, 0, 12, 5, 10, 9, 8, 15, 13 },
			{ 8, 1, 2, 4, 9, 5, 3, 6, 12, 0, 11, 7, 13, 10, 15, 14 },
			{ 4, 1, 11, 5, 10, 14, 7, 15, 3, 0, 8, 9, 2, 6, 12, 13 },
			{ 13, 2, 7, 3, 8, 4, 6, 0, 5, 14, 1, 12, 9, 15, 10, 11 },
			{ 1, 2, 3, 11, 9, 14, 0, 6, 5, 8, 7, 15, 4, 13, 12, 10 },
			{ 9, 1, 11, 2, 14, 8, 15, 3, 5, 4, 6, 13, 10, 7, 12, 0 },
			{ 5, 3, 1, 2, 8, 0, 14, 11, 4, 9, 15, 7, 12, 10, 6, 13 },
			{ 5, 1, 10, 2, 9, 4, 11, 14, 15, 13, 3, 7, 8, 12, 6, 0 },
			{ 8, 11, 0, 6, 1, 12, 5, 3, 2, 13, 7, 10, 4, 14, 9, 15 },
			{ 3, 6, 7, 11, 2, 9, 10, 5, 1, 0, 14, 15, 13, 8, 4, 12 },
			{ 6, 10, 4, 0, 1, 7, 15, 2, 9, 8, 5, 3, 12, 13, 11, 14 },
			{ 10, 9, 2, 6, 4, 5, 1, 3, 12, 8, 13, 15, 7, 0, 11, 14 },
			{ 1, 5, 0, 3, 6, 4, 10, 7, 8, 13, 9, 14, 12, 15, 11, 2 },
			{ 8, 10, 3, 1, 13, 12, 5, 4, 0, 2, 11, 7, 9, 6, 14, 15 },
			{ 8, 0, 13, 1, 5, 2, 6, 7, 9, 15, 10, 4, 14, 12, 11, 3 },
			{ 0, 8, 3, 7, 2, 1, 15, 11, 12, 6, 14, 10, 4, 5, 9, 13 },
			{ 4, 9, 7, 2, 8, 12, 3, 5, 14, 15, 11, 6, 13, 10, 1, 0 },
			{ 1, 6, 14, 2, 4, 9, 3, 13, 12, 15, 0, 7, 8, 5, 10, 11 },
			{ 12, 1, 6, 14, 0, 4, 3, 9, 11, 8, 10, 7, 2, 5, 13, 15 },
			{ 12, 10, 4, 2, 8, 0, 5, 11, 13, 3, 1, 9, 14, 15, 7, 6 },
			{ 4, 2, 0, 11, 13, 7, 3, 9, 1, 5, 10, 15, 8, 6, 14, 12 },
			{ 6, 1, 3, 9, 12, 11, 15, 2, 4, 5, 14, 0, 10, 8, 13, 7 },
			{ 5, 7, 4, 3, 8, 6, 1, 11, 10, 14, 0, 15, 12, 9, 13, 2 },
			{ 1, 4, 5, 15, 8, 11, 3, 6, 14, 12, 0, 9, 13, 7, 10, 2 },
			{ 1, 3, 10, 7, 2, 0, 5, 12, 4, 8, 13, 6, 14, 9, 15, 11 },
			{ 7, 1, 4, 2, 14, 9, 6, 11, 12, 8, 15, 10, 0, 5, 13, 3 },
			{ 1, 4, 5, 11, 9, 6, 14, 7, 10, 3, 8, 15, 13, 2, 0, 12 },
			{ 4, 1, 9, 5, 6, 10, 2, 7, 8, 13, 15, 3, 12, 0, 11, 14 },
			{ 1, 5, 0, 2, 4, 3, 15, 11, 13, 6, 8, 10, 9, 12, 14, 7 },
			{ 0, 6, 9, 10, 1, 13, 2, 5, 7, 8, 14, 11, 12, 15, 4, 3 },
			{ 4, 3, 8, 11, 9, 0, 13, 6, 10, 1, 15, 5, 12, 7, 2, 14 },
			{ 2, 13, 11, 9, 4, 5, 0, 1, 10, 6, 3, 14, 12, 15, 8, 7 },
			{ 8, 1, 5, 2, 9, 4, 14, 3, 15, 10, 0, 7, 6, 12, 11, 13 },
			{ 0, 6, 1, 9, 2, 5, 15, 3, 10, 8, 7, 4, 12, 14, 13, 11 },
			{ 1, 2, 5, 9, 6, 12, 0, 3, 15, 8, 10, 7, 13, 14, 4, 11 },
			{ 1, 4, 2, 7, 12, 11, 8, 5, 10, 15, 13, 3, 9, 14, 6, 0},
			{ 4, 5, 3, 11, 6, 0, 7, 10, 8, 2, 14, 15, 1, 12, 9, 13 },
			{ 13, 3, 6, 1, 8, 9, 15, 7, 14, 5, 0, 12, 4, 10, 11, 2 },
			{ 1, 8, 3, 12, 0, 7, 5, 10, 2, 13, 6, 11, 9, 14, 15, 4 },
			{ 0, 4, 12, 6, 2, 1, 15, 3, 9, 13, 8, 10, 11, 7, 5, 14 },
			{ 5, 14, 3, 7, 2, 13, 15, 6, 0, 4, 9, 11, 8, 1, 10, 12 },
			{ 14, 4, 10, 2, 7, 8, 13, 6, 11, 0, 3, 12, 5, 15, 1, 9 },
			{ 0, 4, 1, 7, 5, 3, 12, 11, 9, 13, 2, 15, 8, 14, 10, 6 },
			{ 4, 8, 11, 1, 6, 9, 13, 3, 2, 0, 7, 10, 12, 14, 15, 5 },
			{ 0, 8, 1, 10, 4, 5, 3, 9, 12, 13, 6, 2, 14, 11, 7, 15 },
			{ 4, 1, 2, 0, 5, 6, 10, 13, 14, 15, 12, 3, 11, 8, 7, 9 },
			{ 5, 11, 8, 14, 0, 1, 4, 2, 6, 15, 9, 3, 12, 10, 7, 13 },
			{ 4, 1, 15, 3, 6, 9, 2, 11, 13, 5, 10, 7, 8, 0, 12, 14 },
			{ 1, 4, 2, 6, 12, 8, 11, 5, 15, 9, 0, 7, 13, 14, 10, 3 },
			{ 0, 7, 8, 2, 6, 1, 9, 3, 4, 10, 5, 11, 12, 14, 13, 15 },
			{ 1, 13, 2, 14, 8, 6, 9, 3, 4, 0, 11, 5, 7, 12, 15, 10 },
			{ 0, 9, 1, 11, 12, 5, 4, 7, 13, 8, 3, 10, 14, 15, 6, 2 },
			{ 12, 0, 8, 3, 6, 1, 5, 7, 2, 14, 11, 15, 13, 9, 4, 10 },
			{ 13, 5, 7, 2, 6, 10, 0, 3, 9, 15, 12, 14, 8, 4, 1, 11 },
			{ 1, 7, 2, 3, 5, 10, 11, 15, 0, 8, 4, 14, 6, 12, 9, 13 },
			{ 0, 6, 3, 7, 2, 1, 13, 9, 10, 4, 5, 15, 8, 12, 11, 14 },
			{ 8, 4, 2, 3, 13, 12, 9, 7, 5, 11, 6, 15, 0, 1, 14, 10 },
			{ 1, 5, 11, 2, 4, 10, 6, 3, 14, 15, 0, 8, 9, 7, 12, 13 },
			{ 5, 7, 10, 4, 8, 1, 3, 11, 12, 6, 14, 2, 13, 0, 9, 15 },
			{ 4, 1, 11, 0, 10, 2, 3, 6, 8, 5, 9, 15, 12, 13, 7, 14 },
			{ 12, 6, 1, 3, 13, 4, 2, 11, 0, 8, 5, 15, 9, 7, 10, 14 },
			{ 0, 5, 1, 2, 8, 9, 6, 7, 13, 11, 14, 10, 4, 12, 3, 15 },
			{ 4, 0, 3, 5, 8, 2, 6, 14, 9, 13, 1, 7, 15, 12, 10, 11 },
			{ 1, 2, 11, 7, 5, 0, 8, 9, 12, 6, 14, 10, 4, 3, 13, 15 },
			{ 9, 3, 10, 2, 1, 5, 8, 15, 12, 11, 7, 4, 13, 6, 0, 14 },
			{ 2, 1, 9, 7, 0, 5, 3, 6, 11, 15, 4, 10, 12, 8, 13, 14 },
			{ 0, 6, 10, 3, 2, 5, 9, 11, 1, 8, 13, 15, 4, 14, 12, 7 },
			{ 0, 5, 3, 8, 4, 7, 11, 6, 12, 1, 13, 10, 14, 2, 9, 15 },
			{ 1, 7, 6, 4, 2, 3, 15, 11, 5, 10, 13, 12, 9, 8, 0, 14 },
			{ 8, 4, 14, 3, 1, 5, 0, 2, 6, 10, 7, 11, 13, 9, 12, 15 },
			{ 5, 2, 3, 10, 13, 1, 15, 6, 4, 11, 14, 7, 8, 12, 0, 9 },
			{ 7, 2, 10, 11, 1, 6, 0, 15, 4, 8, 3, 5, 9, 12, 13, 14 },
			{ 5, 2, 7, 0, 14, 8, 3, 6, 4, 13, 9, 10, 1, 12, 15, 11 },
			{ 5, 1, 2, 3, 6, 4, 14, 13, 8, 11, 15, 7, 0, 12, 10, 9 },
			{ 5, 0, 3, 2, 1, 7, 11, 14, 6, 10, 8, 9, 4, 12, 15, 13 },
			{ 4, 10, 0, 8, 6, 2, 3, 14, 5, 12, 15, 7, 9, 13, 1, 11 },
			{ 12, 10, 7, 11, 3, 2, 6, 5, 1, 0, 9, 15, 4, 14, 8, 13 },
			{ 4, 3, 1, 0, 7, 8, 6, 2, 5, 9, 15, 14, 12, 13, 10, 11 },
			{ 15, 8, 3, 4, 1, 13, 14, 2, 6, 0, 9, 11, 12, 5, 7, 10 },
			{ 1, 2, 3, 6, 8, 9, 4, 14, 13, 12, 10, 5, 15, 0, 7, 11 },
			{ 12, 5, 1, 10, 2, 4, 8, 3, 6, 0, 11, 9, 13, 14, 15, 7 },
			{ 9, 2, 14, 8, 4, 6, 1, 3, 12, 0, 13, 15, 10, 5, 11, 7 },
			{ 6, 3, 1, 15, 13, 9, 0, 11, 2, 4, 5, 14, 8, 7, 10, 12 },
			{ 6, 1, 2, 8, 10, 0, 14, 15, 4, 12, 3, 11, 9, 5, 7, 13 },
			{ 9, 4, 6, 5, 8, 0, 2, 1, 15, 3, 14, 12, 13, 10, 11, 7 },
			{ 9, 8, 3, 6, 1, 2, 5, 4, 15, 13, 7, 14, 12, 0, 10, 11 },
			{ 8, 0, 9, 7, 1, 6, 14, 5, 10, 4, 11, 15, 2, 3, 12, 13 },
			{ 4, 10, 9, 2, 8, 3, 1, 11, 13, 15, 12, 7, 0, 6, 5, 14 },
			{ 0, 4, 5, 3, 6, 11, 14, 2, 1, 7, 10, 12, 9, 8, 13, 15 },
			{ 4, 5, 2, 1, 0, 6, 3, 7, 9, 8, 13, 11, 12, 14, 10, 15 },
			{ 4, 1, 13, 2, 6, 0, 15, 9, 14, 8, 5, 3, 12, 7, 11, 10 },
			{ 1, 2, 5, 9, 4, 10, 6, 11, 7, 8, 0, 3, 13, 14, 12, 15 },
			{ 4, 2, 6, 3, 8, 1, 12, 7, 13, 9, 15, 14, 5, 0, 10, 11 },
			{ 4, 7, 5, 2, 8, 1, 13, 6, 9, 14, 0, 3, 12, 10, 15, 11 },
			{ 13, 4, 3, 7, 8, 5, 6, 2, 10, 1, 12, 14, 0, 9, 15, 11 },
			{ 4, 3, 13, 7, 14, 6, 15, 12, 8, 5, 10, 2, 9, 11, 1, 0 },
			{ 5, 7, 3, 15, 6, 1, 11, 2, 4, 9, 10, 14, 0, 13, 8, 12 },
			{ 5, 3, 0, 10, 9, 1, 7, 2, 13, 11, 12, 14, 4, 8, 15, 6 },
			{ 1, 3, 7, 6, 4, 8, 15, 10, 0, 9, 12, 13, 11, 14, 2, 5 },
			{ 6, 4, 7, 11, 10, 0, 5, 3, 1, 8, 14, 2, 12, 13, 9, 15 },
			{ 4, 5, 1, 7, 2, 9, 6, 11, 14, 15, 8, 13, 3, 12, 0, 10 },
			{ 12, 2, 4, 7, 0, 1, 10, 9, 13, 8, 11, 6, 5, 3, 14, 15 }*/ };

	final byte[][] SLIDE_3X3 = { { 8, 4, 6, 2, 0, 7, 3, 5, 1 },
			{ 6, 0, 2, 5, 4, 8, 1, 3, 7 }, { 3, 6, 5, 4, 8, 2, 7, 0, 1 },
			{ 1, 8, 6, 3, 4, 2, 5, 0, 7 }, { 3, 1, 5, 8, 7, 6, 4, 2, 0 },
			{ 0, 2, 8, 4, 3, 1, 7, 5, 6 }, { 4, 0, 5, 2, 7, 3, 6, 1, 8 },
			{ 1, 8, 7, 5, 0, 2, 3, 4, 6 }, { 1, 8, 4, 6, 5, 0, 3, 2, 7 },
			{ 8, 1, 6, 7, 0, 4, 5, 3, 2 }, { 7, 1, 2, 8, 6, 4, 0, 3, 5 },
			{ 8, 6, 7, 4, 2, 3, 0, 1, 5 }, { 6, 2, 8, 3, 0, 1, 4, 5, 7 },
			{ 3, 4, 5, 1, 0, 7, 2, 6, 8 }, { 5, 6, 8, 3, 4, 0, 7, 2, 1 },
			{ 2, 5, 1, 3, 6, 7, 4, 8, 0 }, { 2, 6, 4, 7, 5, 0, 1, 3, 8 },
			{ 8, 6, 1, 3, 0, 4, 5, 7, 2 }, { 4, 1, 8, 6, 3, 0, 5, 7, 2 },
			{ 4, 5, 7, 1, 8, 3, 2, 0, 6 }, { 4, 2, 0, 3, 7, 1, 6, 8, 5 },
			{ 4, 3, 0, 2, 6, 8, 7, 5, 1 }, { 4, 0, 5, 2, 3, 7, 6, 8, 1 },
			{ 4, 1, 8, 2, 6, 3, 0, 5, 7 }, { 4, 0, 6, 7, 3, 5, 1, 8, 2 },
			{ 1, 2, 8, 4, 5, 0, 3, 7, 6 }, { 6, 4, 3, 2, 5, 1, 7, 8, 0 },
			{ 8, 5, 2, 7, 6, 3, 1, 4, 0 }, { 6, 0, 1, 7, 2, 5, 8, 4, 3 },
			{ 2, 0, 7, 3, 6, 1, 8, 4, 5 }, { 1, 0, 4, 8, 7, 2, 6, 5, 3 },
			{ 5, 1, 3, 0, 4, 7, 8, 2, 6 }, { 2, 8, 5, 4, 0, 3, 1, 7, 6 },
			{ 5, 2, 4, 7, 0, 1, 8, 3, 6 }, { 4, 2, 7, 8, 6, 3, 0, 1, 5 },
			{ 5, 4, 2, 6, 8, 0, 1, 7, 3 }, { 1, 7, 3, 4, 5, 2, 6, 0, 8 },
			{ 3, 0, 1, 5, 6, 2, 7, 8, 4 }, { 0, 3, 5, 6, 1, 4, 8, 7, 2 },
			{ 0, 1, 7, 8, 3, 6, 2, 4, 5 }, { 6, 7, 8, 5, 1, 3, 2, 4, 0 },
			{ 3, 7, 4, 1, 2, 0, 8, 6, 5 }, { 1, 0, 8, 4, 3, 2, 5, 7, 6 },
			{ 2, 3, 5, 8, 0, 4, 6, 1, 7 }, { 0, 3, 7, 1, 4, 2, 5, 6, 8 },
			{ 1, 3, 5, 6, 2, 7, 4, 0, 8 }, { 3, 6, 8, 2, 5, 1, 0, 4, 7 },
			{ 2, 4, 5, 3, 0, 1, 6, 7, 8 }, { 6, 3, 4, 8, 7, 1, 2, 0, 5 },
			{ 6, 0, 2, 3, 4, 1, 7, 8, 5 }, { 8, 4, 1, 2, 7, 6, 0, 5, 3 },
			{ 0, 3, 6, 8, 2, 4, 1, 7, 5 }, { 1, 2, 5, 8, 7, 3, 6, 0, 4 },
			{ 6, 1, 8, 3, 0, 2, 4, 7, 5 }, { 5, 1, 6, 7, 0, 3, 8, 4, 2 },
			{ 2, 0, 6, 1, 3, 4, 5, 8, 7 }, { 6, 3, 8, 5, 7, 1, 0, 2, 4 },
			{ 5, 6, 1, 7, 3, 2, 4, 0, 8 }, { 2, 7, 6, 5, 0, 8, 1, 3, 4 },
			{ 7, 1, 2, 6, 4, 3, 0, 5, 8 }, { 2, 8, 5, 3, 1, 0, 7, 6, 4 },
			{ 4, 8, 5, 0, 1, 7, 3, 2, 6 }, { 0, 1, 2, 3, 5, 8, 6, 7, 4 },
			{ 0, 1, 6, 7, 4, 2, 3, 5, 8 }, { 4, 3, 7, 1, 0, 2, 6, 5, 8 },
			{ 6, 4, 1, 8, 0, 3, 5, 2, 7 }, { 8, 3, 1, 2, 0, 4, 6, 5, 7 },
			{ 2, 0, 5, 4, 7, 1, 3, 8, 6 }, { 8, 0, 2, 3, 7, 5, 1, 6, 4 },
			{ 4, 2, 1, 3, 8, 5, 7, 0, 6 }, { 6, 8, 5, 0, 4, 7, 2, 1, 3 },
			{ 2, 3, 0, 8, 7, 5, 6, 4, 1 }, { 4, 7, 5, 3, 1, 8, 0, 6, 2 },
			{ 4, 6, 1, 0, 3, 8, 7, 5, 2 }, { 3, 1, 2, 8, 0, 4, 7, 5, 6 },
			{ 3, 7, 6, 4, 0, 2, 8, 1, 5 }, { 6, 3, 2, 0, 7, 1, 5, 4, 8 },
			{ 1, 8, 4, 7, 0, 3, 2, 6, 5 }, { 5, 3, 8, 0, 7, 2, 1, 4, 6 },
			{ 4, 3, 6, 7, 5, 0, 8, 2, 1 }, { 3, 1, 5, 7, 6, 0, 4, 2, 8 },
			{ 1, 5, 4, 7, 2, 0, 8, 3, 6 }, { 6, 3, 4, 8, 7, 1, 2, 5, 0 },
			{ 8, 6, 4, 1, 2, 7, 5, 3, 0 }, { 4, 2, 7, 0, 8, 5, 3, 6, 1 },
			{ 4, 7, 6, 2, 5, 3, 0, 1, 8 }, { 5, 7, 6, 2, 1, 0, 4, 8, 3 },
			{ 4, 3, 2, 5, 0, 7, 1, 8, 6 }, { 4, 7, 6, 0, 3, 1, 8, 2, 5 },
			{ 2, 3, 0, 7, 8, 6, 5, 4, 1 }, { 7, 0, 4, 8, 3, 5, 1, 2, 6 },
			{ 2, 1, 6, 4, 0, 5, 3, 7, 8 }, { 1, 4, 7, 0, 2, 5, 3, 8, 6 },
			{ 2, 0, 3, 6, 8, 5, 1, 7, 4 }, { 2, 3, 5, 6, 8, 1, 0, 7, 4 },
			{ 0, 2, 3, 5, 7, 4, 8, 1, 6 }, { 3, 6, 7, 4, 5, 8, 0, 1, 2 },
			{ 8, 0, 5, 6, 7, 2, 3, 4, 1 }, { 8, 4, 2, 0, 1, 5, 3, 6, 7 },
			{ 3, 8, 7, 0, 1, 5, 4, 2, 6 }, { 8, 4, 7, 0, 2, 3, 6, 5, 1 },
			{ 8, 7, 3, 5, 1, 0, 6, 2, 4 }, { 6, 5, 0, 1, 3, 2, 4, 7, 8 },
			{ 1, 4, 8, 3, 2, 5, 6, 7, 0 }, { 7, 6, 5, 0, 2, 8, 1, 4, 3 },
			{ 7, 4, 3, 6, 1, 2, 5, 8, 0 }, { 3, 0, 6, 7, 8, 4, 5, 1, 2 },
			{ 6, 2, 1, 4, 0, 8, 5, 7, 3 }, { 8, 6, 0, 3, 4, 2, 1, 7, 5 },
			{ 6, 2, 3, 8, 1, 4, 7, 0, 5 }, { 5, 0, 4, 3, 2, 1, 8, 6, 7 },
			{ 3, 7, 8, 0, 2, 4, 5, 6, 1 }, { 0, 4, 1, 7, 2, 6, 8, 5, 3 },
			{ 0, 8, 5, 2, 1, 4, 3, 7, 6 }, { 3, 7, 6, 8, 1, 2, 5, 4, 0 },
			{ 2, 5, 6, 3, 1, 0, 8, 4, 7 }, { 0, 4, 6, 2, 8, 7, 3, 1, 5 },
			{ 8, 6, 2, 1, 0, 5, 3, 7, 4 }, { 2, 0, 1, 3, 8, 7, 6, 4, 5 },
			{ 7, 8, 1, 6, 3, 0, 5, 4, 2 }, { 4, 7, 6, 8, 0, 3, 5, 1, 2 },
			{ 8, 5, 7, 3, 0, 4, 2, 6, 1 }, { 6, 3, 2, 0, 5, 8, 7, 4, 1 },
			{ 2, 3, 6, 8, 4, 1, 0, 5, 7 }, { 7, 2, 8, 4, 6, 5, 3, 1, 0 },
			{ 6, 5, 4, 8, 7, 1, 3, 0, 2 }, { 2, 0, 1, 6, 8, 5, 3, 4, 7 },
			{ 0, 8, 1, 3, 2, 6, 7, 4, 5 }, { 3, 1, 7, 8, 0, 2, 6, 4, 5 },
			{ 6, 0, 8, 3, 1, 2, 5, 4, 7 }, { 6, 4, 1, 5, 8, 0, 2, 7, 3 },
			{ 0, 6, 7, 2, 5, 4, 1, 3, 8 }, { 1, 0, 4, 2, 3, 7, 6, 8, 5 },
			{ 2, 3, 1, 4, 6, 8, 7, 5, 0 }, { 8, 0, 4, 1, 6, 5, 3, 2, 7 },
			{ 8, 7, 4, 3, 6, 5, 2, 0, 1 }, { 0, 2, 8, 6, 4, 5, 7, 3, 1 },
			{ 0, 3, 8, 7, 2, 6, 4, 1, 5 }, { 7, 2, 1, 0, 3, 6, 5, 4, 8 },
			{ 7, 2, 6, 0, 4, 3, 5, 8, 1 }, { 0, 6, 2, 5, 4, 3, 7, 8, 1 },
			{ 8, 1, 2, 3, 7, 6, 4, 0, 5 }, { 0, 4, 7, 6, 3, 8, 1, 5, 2 },
			{ 4, 7, 0, 3, 8, 2, 5, 1, 6 }, { 2, 5, 7, 0, 6, 4, 8, 3, 1 },
			{ 7, 2, 6, 4, 8, 5, 1, 0, 3 }, { 6, 1, 8, 7, 2, 0, 4, 5, 3 },
			{ 0, 6, 5, 3, 8, 2, 4, 7, 1 }, { 3, 6, 2, 1, 4, 8, 7, 0, 5 },
			{ 0, 8, 6, 2, 4, 7, 1, 3, 5 }, { 0, 7, 1, 8, 6, 4, 3, 2, 5 },
			{ 3, 2, 8, 5, 0, 7, 6, 4, 1 }, { 7, 1, 2, 0, 5, 8, 3, 6, 4 },
			{ 0, 7, 8, 3, 4, 2, 5, 1, 6 }, { 7, 3, 6, 1, 8, 2, 0, 5, 4 },
			{ 1, 4, 2, 3, 0, 5, 8, 6, 7 }, { 1, 2, 3, 4, 8, 6, 5, 0, 7 },
			{ 2, 6, 0, 8, 1, 5, 3, 4, 7 }, { 3, 8, 1, 7, 2, 4, 0, 5, 6 },
			{ 0, 5, 1, 4, 3, 2, 7, 6, 8 }, { 2, 0, 4, 3, 6, 5, 1, 8, 7 },
			{ 8, 3, 2, 7, 0, 4, 1, 6, 5 }, { 4, 5, 7, 6, 1, 2, 8, 3, 0 },
			{ 6, 3, 1, 0, 4, 2, 7, 8, 5 }, { 0, 6, 8, 2, 1, 4, 7, 5, 3 },
			{ 0, 5, 8, 6, 3, 7, 1, 4, 2 }, { 3, 4, 8, 6, 5, 7, 1, 0, 2 },
			{ 3, 0, 1, 4, 2, 6, 8, 5, 7 }, { 5, 6, 1, 2, 4, 7, 3, 0, 8 },
			{ 4, 0, 8, 5, 2, 3, 7, 1, 6 }, { 4, 2, 0, 8, 7, 6, 1, 3, 5 },
			{ 5, 1, 2, 7, 8, 3, 0, 4, 6 }, { 8, 0, 3, 4, 1, 5, 7, 2, 6 },
			{ 7, 0, 4, 6, 8, 3, 1, 5, 2 }, { 8, 7, 3, 0, 4, 5, 6, 2, 1 },
			{ 6, 7, 0, 2, 3, 1, 4, 5, 8 }, { 2, 7, 5, 0, 8, 3, 1, 4, 6 },
			{ 6, 2, 7, 3, 8, 1, 0, 4, 5 }, { 7, 1, 3, 6, 0, 5, 4, 8, 2 },
			{ 5, 6, 4, 0, 8, 2, 3, 7, 1 }, { 5, 2, 7, 3, 0, 6, 4, 8, 1 },
			{ 0, 5, 6, 8, 3, 1, 7, 4, 2 }, { 0, 1, 4, 8, 5, 6, 7, 3, 2 },
			{ 1, 5, 6, 3, 2, 8, 0, 7, 4 }, { 4, 0, 2, 3, 8, 5, 6, 7, 1 },
			{ 2, 6, 3, 7, 4, 5, 0, 8, 1 }, { 0, 7, 8, 2, 3, 4, 6, 5, 1 },
			{ 2, 8, 3, 0, 1, 6, 7, 4, 5 }, { 8, 3, 4, 1, 0, 5, 7, 2, 6 },
			{ 4, 1, 6, 7, 2, 3, 8, 5, 0 }, { 1, 5, 4, 6, 2, 3, 0, 8, 7 },
			{ 7, 3, 2, 5, 6, 8, 4, 1, 0 }, { 4, 3, 1, 6, 5, 8, 0, 2, 7 },
			{ 5, 7, 2, 8, 3, 4, 1, 6, 0 }, { 8, 5, 4, 7, 3, 1, 0, 2, 6 },
			{ 2, 0, 6, 5, 1, 4, 3, 8, 7 }, { 3, 6, 8, 0, 1, 2, 7, 5, 4 },
			{ 5, 0, 2, 6, 1, 3, 4, 7, 8 }, { 8, 3, 4, 6, 2, 5, 1, 0, 7 },
			{ 6, 1, 5, 0, 8, 2, 7, 3, 4 } };

}