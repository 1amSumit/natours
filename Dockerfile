FROM node:22

WORKDIR /app

COPY package* .
RUN npm install 

COPY . .

EXPOSE 8000

CMD [ "npm",  "run", "start:prod" ]