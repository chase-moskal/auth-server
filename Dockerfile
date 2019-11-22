
FROM node:12

RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm install

EXPOSE 8080
CMD [ "npm", "start" ]
