FROM public.ecr.aws/docker/library/node:18
RUN mkdir /app && chown node:node /app
RUN mkdir /app/node_modules && chown node:node /app/node_modules
WORKDIR /app
COPY . .
COPY package*.json ./
RUN npm install -g @angular/cli
RUN npm install
RUN npm run build --prod
EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0"]