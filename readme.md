SUPERASSIST AI - AGENTIC AI FULL STACK WEB APPLICATION


Q.What is SuperAssist AI ?

Ans.Superassist AI is a (Agentic AI ) Full stack web application build with the help of postgresql , express, react & node.js
    with the use of Generative & Agentic Ai technologies with the use of langchain , langgraph , stateGraph, a multipurpose 
    full stack web application with followed by MVC & microservice architecure , help users to solve their basic needs problem
    by Agentic Ai with understand the users problem an & take actions accordingly , from formal conversations to Summarize the
    pdf , or solve coding problem & debugging , or generating code , Also giving users to real time information by their needs
    All in one Agentic Ai platform , remembers users chat history and Take action accordingly 

----------------------------------------------------------------------------------------------------------------------------------
TECHNOLOGIES USED:-

Frontend: React , Vite , Redux , React-router , RTK Query , RTK state management , Axios , ReactMarkdown , Syntax Highlighter

Backend: Node.js , Express, LangGraph , LangGraph StateGraph , Tavily , Agent calling , Express-http-proxy , Zod Validation , proxyHeaders ,Pdf Parser , Nodemon , Concurrently  , LangChain , Redis ,AI short time memory , Redis-caching

LLM:  OLLAMA LOCAL , OLLAM CLOUD , GEMINI , GROQ , OPENAI

Storage: Cloudniary , Multer Middleware , 

Architecuture: MVC architeture , Microservice Implementation

API: REST API , GraphQl

Database: Supabase (PostGresQl) , Mongoose (optional)

Authentication / Authorization : JWTOKEN , Cookie-parser , dotenv  , CORS 

Depolyment : Vercel , Render

--------------------------------------------------------------------------------------------------------------------------------


/*--------------------------APIs--------------------------------*/



Gateway
============================
auth->  /auth

chat->  /chat

agent-> /agent

Auth
=========================================
SignUp -> auth/api/signup

SignIn -> auth/api/signin

SignOut -> auth/api/signout

Chat
=========================================
chat -> chat/api/createchat   

chat -> chat/api/deletechat   

chat -> chat/api/sendmessage  

chat -> chat/api/fetchchat/:userid

chat -> chat/api/updatechat/:userid

Agent
=========================================
Agent -> agent/api/chat


/*-------------------------------