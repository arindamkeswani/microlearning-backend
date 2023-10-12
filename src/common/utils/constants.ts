export const MIN_ROW_LIMIT = 0;
export const MAX_ROW_LIMIT = 50;
export const MIN_PAGE_NUMBER = 1;
export const UNBOUNDED_ROW_LIMIT = 10000
export const URL_EXPIRATION_SECONDS = 5000

export class ResponseStatus {
    static Ok = 200;
    static Accepted = 201;
    static BadRequest = 400;
    static Invalid = 412;
    static Unauthorised = 401;
    static NotFound = 404;
    static Conflict = 409;
    static InternalServerError = 500;
  }
  
  export class ErrorMessages {
    static userMaintenance = 'Server is under maintenance. Please try after some time.';
    static unauthorisedAccess = 'Unauthorised access';
    static notFound = 'Resource not found';
    static accountInactive = 'This account is inactive. Please ask your manager to activate the account.';
    static capacityExceeded = (user) => `${user} has been assigned the maximum number of tasks, as per their specified capacity.`
    static mandatoryField = (data) => `${data} is required. ${data} is a mandatory field.`;
  }
  
  export class GenericResponse {
    constructor(success, data) {
      this.data = data;
      this.success = success;
    }
    data: any;
    success: boolean;
  }
  
  export class ResponseMessage {
    static Ok = "Okay";
    static Accepted = "Accepted";
    static BadRequest = "Bad Request";
    static Unauthorised = "Unauthorised";
    static NotFound = "Not Found";
    static Conflict = "Conflict / Duplicate"
    static InternalServerError = "Internal Server Error";
  }
  
  export const MEDIA_BASE_FOLDER = 'src/media/'

  export const EXT = {
    video : 'mp4',
    audio: 'mp3'
}


export const S3_ROUTES = {
  video : 'content/'
}

// export const QUESTION_GEN_PROMPT = 'Based on the transcript of an educational video, I want you to come to come up with an MCQ-type question with 4 options. I want return value in the form of a string that follows that format "<Question body>\\n<Option 1>\\n<Option 2>\\n<Option 3>\\n<Option 4>\\n<Index of correct answer, i.e. if option 1 is correct, then put the value 0 here (so this will be 0-based indexing)>". e.g. "Question\\nA\\nB\\nC\\nD\\n2". Following this format in your answer string is essential and mandatory. Make sure that you dont use duplicate newline chars. The transcript is:'
export function getQuestionGenerationPrompt(language, transcript) {
  return `Based on the transcript of an educational video, I want you to come to come up with an MCQ-type question with 4 options. I want return value in the form of a string that follows that format "<Question body>\\n<Option 1>\\n<Option 2>\\n<Option 3>\\n<Option 4>\\n<Index of correct answer, i.e. if option 1 is correct, then put the value 0 here (so this will be 0-based indexing)>". e.g. "Question\\nA\\nB\\nC\\nD\\n2". Following this format in your answer string is essential and mandatory. Make sure that you dont use duplicate newline chars. The output langage for questions and options (mentioned here as its ISO-639-1 code) is "${language}". The transcript is:"${transcript}"`
}
export function getTranslationPrompt(inputLang, outputLang, transcript) {
  return `Assuming that languages are mentioned here as their ISO-639-1 codes, translate the following audio transcript from "${inputLang}" to "${outputLang}":${transcript}`
} 
export const SEPARATOR = '\n'