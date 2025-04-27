import { getJudge0LanguageId } from "../libs/judge0.libs"

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
       }

   } catch (error) {
    
   }

}

export const getAllProblems = async (req, res) => {}

export const getProblemById = async (req, res) => {}

export const updateProblem = async (req, res) => {}

export const deleteProblem = async (req, res) => {}

export const getAllProblemsSolvedByUser = async (req, res) => {}

