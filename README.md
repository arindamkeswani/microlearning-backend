Flow:
1. Video gets uploaded to S3 via Admin panel, URL is stored in DB
2. Periodically, 
  2.1 We pick a video, 
  2.2 Download it, 
  2.3 Convert it to MP3, 
  2.4 Transcribe it
  2.5 Store transcription in DB
  2.5 Delete video + audio from server (optionally upload audio to S3)
3. Using ChatGPT, we pass the transcription and get a question with 4 options (and the correct options), which we store in DB
4. Place the question at the end of the video while scrolling
5. Student answers the questions, we get
  5.1 Subtitles for the video for better content quality, powered by AI
  5.2 Subtitles help in including those who have hearing impairment
  5.3 To study consumer behaviour
  5.4 More engagement on our content
  5.5 Student's knowledge gets reinforced upon explicit interaction

6. Based on the data received, we can 
  6.1 Suggest batches that fit with the kind of content that the student interacts with
  6.2 Suggest products (like books from PW Store) that might be relevant to the student (based on interest and weaknesses)
  6.3 Gamify the experience by rewarding top 10 submissions (by quantity/month) with credits to the PW Store/Courses to promote engagement
  6.4 Sales
