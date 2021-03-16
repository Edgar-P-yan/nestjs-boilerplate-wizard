FROM node:14

WORKDIR /usr/src/app

<% if(packageManager === 'yarn') { %>

COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

<% } else { %>

COPY package.json package-lock.json ./
RUN npm i
COPY . .
RUN npm run build

<% } %>

EXPOSE 3000

CMD ["node", "dist/main"]
