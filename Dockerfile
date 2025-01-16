FROM node:alpine
WORKDIR /usr/src/app
COPY . .
COPY package*.json ./
RUN npm install -g @angular/cli
RUN npm install
RUN npm run build --prod
EXPOSE 3000
CMD ["ng", "serve", "--host", "0.0.0.0"]