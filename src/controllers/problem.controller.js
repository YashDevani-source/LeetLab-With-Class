import { db } from "../libs/db"
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.libs"

export const createProblem = async (req, res) => {
    // going to get all the data from req.body
    const {title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body
    // going to check the user role once aganin
    if(req.user.role !== "ADMIN"){
        res.status(403).json({error: "you are not allowed to create a problem"})
    }
    // Loop through each refrence solution for different languages

   try {
       for(const [language, solutionCode] of Object.entries(referenceSolutions)){
        const languageId = getJudge0LanguageId(language)

        if(!languageId){
            return res.status(400).json({error: `Language: ${language} is not supported`})
        }
        const submissions = testcases.map(({input, output}) => ({
            source_code:solutionCode,
            language_id:languageId,
            stdin:input,
            expected_output:output,
        }))

        const submissionResults = await submitBatch(submissions)
        const tokens = submissionResults.map((res) => res.token)
        const results = await pollBatchResults(tokens)

        for(let i = 0; i < results.length; i++){
            const result = results[i]

            if(result.status.id !== 3){
                return res.status(400).json({error: `Testcase ${i + 1} failed for language ${language}`})
            }
        }
        // save the problem to the database

        const newProblem = await db.problem.create({
            data:{
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippets,
                referenceSolutions,
                userId:req.user.id,
            },
        })

        return res.status(201).json(newProblem)

       }

   } catch (error) {
    
   }

}

export const getAllProblems = async (req, res) => {}

export const getProblemById = async (req, res) => {}

export const updateProblem = async (req, res) => {}

export const deleteProblem = async (req, res) => {}

export const getAllProblemsSolvedByUser = async (req, res) => {}

