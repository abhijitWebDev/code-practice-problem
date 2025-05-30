import { db } from '../db/db.js';
import {
  getJudge0LanguageId,
  submitBatch,
  pollBatchResults,
} from '../utils/judge0.util.js';

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  // Validate referenceSolutions
  if (!referenceSolutions || typeof referenceSolutions !== 'object') {
    return res.status(400).json({ error: 'referenceSolutions is missing or invalid' });
  }

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res.status(400).json({ error: `Language ${language} is not supported` });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.map((res) => res.token);
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({ error: `Testcase ${i + 1} failed` });
        }
      }
    }

    // Save the problem to database
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      }
    });

    return res.status(201).json(newProblem);
  } catch (error) {
    console.error("Error creating problem:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      include: {
        solvedBy: {
          where: {
            userId: req.user.id
          }
        }
      }
    });

    // check if problems array is empty
    if (!problems || problems.length === 0) {
      return res.status(404).json({ error: "No problems found" })
    }

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems
    })
  } catch (error) {
    console.error("Error fetching problems:", error);
    return res.status(500).json({
      error: "Error while fetching problems"
    })
  }
};

const getProblemById = async (req, res) => {
  const {id} = req.params
  try {
  const problem = await db.problem.findUnique({
    where: {
      id
    }
    
  })
  if(!problem) {
    return res.status(404).json({error: "Problem not found"})
  }
  res.status(200).json({
    success:true,
    message:"Message Fetched successfully",
    problem
  })

  
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error while fetching problem with id",
    })
  }
};

const updateProblemById = async (req, res) => {
  const {id} = req.params;

  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

try {
  const existingProblem = await db.problem.findUnique({
    where: {id},
  });

  if (!existingProblem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  // If new referenceSolutions are provbided, validate them
  if(referenceSolutions && typeof referenceSolutions === 'object') {
    for(const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);
      if(!languageId) {
        return res.status(400).json({ error: `Language ${language} is not supported` });
      }

      const testCasesToUse = testCasesToUse || existingProblem.testCases;

      const submissions = testCasesToUse.map(({input, output}) => ({
        source_code: solutionCode,
          language_id: languageId,
          stdin: input,
          expected_output: output,
      }));
      const submissionResults = await submitBatch(submissions);
        const tokens = submissionResults.map((res) => res.token);
        const results = await pollBatchResults(tokens);

        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status.id !== 3) {
            return res.status(400).json({ error: `Testcase ${i + 1} failed` });
          }
      }
    }
  }

  const updatedProblem = await db.problem.update({
    where: {id},
    data: {
      title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
    },
  })
  return res.status(200).json(updatedProblem);
} catch (error) {
  console.error("Error updating problem:", error);
    return res.status(500).json({ error: 'Internal server error' });
}
};

const deleteProblemById = async (req, res) => {
  const {id} = req.params;
  try {
    const problem = await db.problem.findUnique({where:{id}})

  if(!problem) {
    return res.status(404).json({error:"Problem not found"})
  }

  await db.problem.delete({where:{id}})

  res.status(200).json({
    success:true,
    message:"Problem deleted successfully"
  })
    
  } catch (error) {
    console.log(error)
    res.status(500).json({error:"Problem deletion failed"})
  }

  
};

const getAllProblemSolvedByUser = async (req, res) => {
  const userId = req.user.id // assuming the user id available in request
  try {
    // fetch all problems solved by the user
    const solvedProblems = await db.problemSolved.findMany({
      where: {
        userId: userId
      },
      include: {
        problem:true, // include the problem details
      }
    });

    if(!solvedProblems || solvedProblems.length === 0) {
      return res.status(404).json({error:"No solved problems found for that user"})
    }

    res.status(200).json({
      success: true,
      message: "Solved problems fetched successfully",
      problems: solvedProblems.map(s => s.problem),
    });
    
  } catch (error) {
    console.log("errir fetching solved problems:", error);
    return res.status(500).json({error:"Internal serever error"})
    
  }
};

export {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblemById,
  deleteProblemById,
  getAllProblemSolvedByUser,
};
