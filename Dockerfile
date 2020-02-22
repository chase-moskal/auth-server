
FROM node:13

RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm install --production

EXPOSE 8080
CMD [ "npm", "start" ]
