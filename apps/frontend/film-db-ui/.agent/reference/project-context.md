**Project Overview:** This project is the frontend interface for "film-db," a personal project utilizing the IMDB movies dataset. The primary goal is to build a high-quality, rich application that interfaces with a robust backend server. The frontend's role is to provide a simple but aesthetically pleasing UI to represent the backend's capabilities. You can see backend's APIs at `@.agent/reference/backend-apis`

The tech stack i want to use frontend are nextjs with react and tailwind

Core Functional Domains (Based on Backend APIs):
- Authentication & User Management: login, registration (including admin registration), and token refresh flows. Users to update their profile metadata (bio, display name) and username.
- IMDB functions : Movies, people and the information relate to these
- For user : If a user is logged in, they can use many functions such as User Lists (CRUD list) with movies
- Admin Dashboard :  If an admin is logged in, they can use the admin functions like getting user's datas, approve admin request, or trigger the imported pipeline to import IMDB data...