\# Cloud Audio Scheduler — Production Deployment Workflow



\## 1. Development → Production Flow



```

Local Development PC

&#x20;     ↓

Code Changes

&#x20;     ↓

Git Commit

&#x20;     ↓

Push to GitHub

&#x20;     ↓

SSH into Production Server

&#x20;     ↓

git pull (fetch latest code)

&#x20;     ↓

Rebuild / Restart Docker containers

```



\---



\# 2. Production Server Access



```

ssh root@187.124.97.249

```



Then enter VPS password.



Once logged in:



```

cd /var/www/cloud-audio-scheduler/backend

```



\---



\# 3. Safe Deployment Workflow



Always use the following workflow when deploying backend updates.



\## When Backend Code Changes



This rebuilds \*\*only the API container\*\*.



```

git pull

docker compose -f docker-compose-server.yml up -d --build api-service

```



This will:



\* Pull latest code

\* Rebuild the backend Docker image

\* Restart only the API container

\* Leave database and other services untouched



\---



\## When Docker Infrastructure Changes



Example cases:



\* docker-compose changes

\* nginx/download container changes

\* new service added

\* network changes



Use:



```

git pull

docker compose -f docker-compose-server.yml up -d --build

```



This rebuilds \*\*all containers\*\*.



\---



\# 4. Database Safety Rule



\*\*Never run this command in production:\*\*



```

docker compose down -v

```



The `-v` flag \*\*deletes Docker volumes\*\*, which will erase:



\* MySQL database

\* stored data

\* persistent files



Your database is stored in Docker volume:



```

db\_data:/var/lib/mysql

```



Deleting the volume = \*\*data loss\*\*.



\---



\# 5. Optional Deployment Shortcut



You can add a command alias on the VPS for faster deployments.



Add to `.bashrc`:



```

alias deploy='git pull \&\& docker compose -f docker-compose-server.yml up -d --build api-service'

```



Then deploy using:



```

deploy

```



\---



\# 6. Example Deployment Session



```

ssh root@187.124.97.249

cd /var/www/cloud-audio-scheduler/backend



git pull



docker compose -f docker-compose-server.yml up -d --build api-service

```



De



