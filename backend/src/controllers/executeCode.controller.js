 import { pollBatchResults, submitBatch } from "../utils/judge0.util.js";
 import { db } from "../db/db.js";

// const executeCode = async (req, res) => {
//   try {
//     const { source_code, language_id, stdin, expected_outputs, problemId } =
//       req.body;

//     const userId = req.user.id;

//     // validate test cases

//     if (
//       !Array.isArray(stdin) ||
//       stdin.length === 0 ||
//       !Array.isArray(expected_outputs) ||
//       expected_outputs.length !== stdin.length
//     ) {
//       return res.status(400).json({ error: 'Invalid or missing test cases' });
//     }

//     // step 2 , prepare each test cases for judge0 batch submission
//     const submissions = stdin.map((input)=> ({
//         source_code,
//         language_id,
//         stdin: input,
//         // base64_encoded:false,
//         // wait:false,
//     }));

//     // step 3 submit the code ie Send this batch of submissions to judge0
//     const submitResponse = await submitBatch(submissions);

//     const tokens = submitResponse.map((res) => res.token);

//     // step 4 Poll judge0 for results of submitted testcases
//     const results = await pollBatchResults(tokens);
//     console.log('Results--------',results)

//     res.status(200).json({
//         message:"Code executed"
//     })
//   } catch (error) {}
// };

// export { executeCode };

const executeCode = async (req, res) => {
    try {
      const { source_code, language_id, stdin, expected_outputs, problemId } =
        req.body;
        console.log('from body', problemId);
      const userId = req.user.id;
  
      // Validate test cases
  
      if (
        !Array.isArray(stdin) ||
        stdin.length === 0 ||
        !Array.isArray(expected_outputs) ||
        expected_outputs.length !== stdin.length
      ) {
        return res.status(400).json({ error: "Invalid or Missing test cases" });
      }

      // Check if problemId exists
      const problemExists = await db.problem.findUnique({
        where: { id: problemId }
    });

    if (!problemExists) {
        return res.status(404).json({ error: "Problem not found" });
    }
  
      // 2. Prepare each test cases for judge0 batch submission
      const submissions = stdin.map((input) => ({
        source_code,
        language_id,
        stdin: input
      }));
      console.log(submissions);
  
      // 3. Send batch of submissions to judge0
      const submitResponse = await submitBatch(submissions);
  
      const tokens = submitResponse.map((res)=>res.token);
  
      // 4. Poll judge0 for results of all submitted test cases
      const results = await pollBatchResults(tokens);
  
      console.log('Result-------------')
      console.log(results);
  
      // store submission details in the database
      const submission = await db.submission.create({
        data: {
          userId,
          problemId,
          sourceCode: source_code,
          language: language_id.toString(),
          status: results.every(result => result.status.id === 3) ? "Accepted" : "Wrong answer",
          testCases: {
            create: results.map((result, index) => ({
              testCase: index + 1,
              passed: result.status.id === 3,
              stdout: result.stdout,
              expected: expected_outputs[index],
              stderr: result.stderr,
              compileOutput: result.complile_output,
              status: result.status.description,
              memory: result.memory !== null ? result.memory.toString() : null,
              time: result.time
            }))
          }
        }
      });

      // update problem solved status of all test cases passed
      if(submission.status === "Accepted") {
        await db.problemSolved.upsert({
          where: {
            userId_problemId: {
              userId,
              problemId
            }
          },
          update: {},
          create: {
            userId,
            problemId
          }
        });

      }
      res.status(200).json({
        message: "Code Executed!",
        submission
      });
    } catch (error) {
      console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    }
  };

  export {executeCode}
