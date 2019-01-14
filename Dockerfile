FROM node:10.13.0

WORKDIR /app
COPY *.json ./
RUN npm install
COPY . .
RUN npm run build

CMD ["npm", "start"]
