export default () => ({
  ENV: process.env.ENV,
  port: parseInt(process.env.PORT) || 5002,
  database: {
    uri: process.env.MONGODB_URI,
    port: parseInt(process.env.DATABASE_PORT) || 27017,
    poolSize: parseInt(process.env.POOL_SIZE) || 50,
  },
  http: {
    timeout: parseInt(process.env.HTTP_TIMEOUT) || 5000,
    maxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS) || 5,
  },
  logger: {
    logs: process.env.LOGS || 'error,warn,debug,verbose,log',
  },
  // services: {
  //   penpencil: {
  //     backend: { baseUrl: process.env.PENPENCIL_BACKEND_BASE_URL || "http://localhost:8000" },
  //     frontend: { baseUrl: process.env.PENPENCIL_FRONTEND_BASE_URL || "http://localhost:8000" },
  //   },
  //   workflows: {
  //     auth: { baseUrl: process.env.WORKFLOWS_AUTH_BASE_URL || "http://localhost:5001" },
  //     frontend: { baseUrl: process.env.WORKFLOWS_FRONTEND_BASE_URL || "http://localhost:3000" },
  //   },
  // },
  TWO_HOURS: 60 * 60 * 2,
  FOUR_HOURS: 60 * 60 * 4,
  EIGHT_HOURS: 60 * 60 * 8,
  ONE_DAY: 60 * 60 * 24,
  TWO_DAYS: 60 * 60 * 24 * 2,
  ONE_WEEK: 60 * 60 * 24 * 7,

  openAi: {
    baseUrl: 'https://api.openai.com',
    apiKey: process.env.OPENAI_API_KEY,
  },
  aws: {
    s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_S3_BUCKET,
    },
},
});
