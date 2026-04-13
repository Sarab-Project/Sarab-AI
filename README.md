## Project Workflow
#### Repository Structure
* Create a folder named cleint and i place my React native project inside it.
* The backend project will be inside the backend folder.
* ai & data & tests folder is for ai services. 
---
#### Branching Startegy
* We have a main branch called main (stable version).
* We also have a develop branch for ongoing development.
* Do NOT work directly on main AND Do NOT merge to it.
--- 
#### How to work
1. Always start from th develop branch:
```
git checkout develop 
git pull
``` 
2. Create a new branch for each feature (No matter how simple) using this pattern:
```
git switch -c feature/ai-analyst
```
3. Work on your feature branch.
4. After finishing your work (example):
```
git push origin feature/ai-analyst
```
---
#### Notes
* Backend work should be inside the backend/ folder.
* mobile work should be inside the client/ folder.
* ai work should be inside those folders ai data tests
* Each feature must have its own branch.