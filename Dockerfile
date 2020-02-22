
FROM node:13

RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm install --production

EXPOSE 8000
CMD [ "npm", "start" ]
