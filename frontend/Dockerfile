FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm","run","dev","--","--host"]


# FROM node:20

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# RUN npm run build

# RUN npm install -g serve

# EXPOSE 5173

# CMD ["serve", "-s", "dist", "-l", "5173"]