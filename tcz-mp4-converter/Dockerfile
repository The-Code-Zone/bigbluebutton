# Use Node 20 base
FROM node:20-bullseye

WORKDIR /usr/src/app

# Install Chrome
RUN apt-get update && apt-get install -y \
    curl gnupg2 \
    software-properties-common \
    fonts-liberation libappindicator1 libnss3 xdg-utils \
    wget xvfb fluxbox pulseaudio pulseaudio-utils libasound2 \
    && curl -sS -o - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable

# Copy project files
COPY *.sh ./ 
COPY *.js ./ 
COPY *.json ./ 
COPY .env ./

# Create folders
RUN mkdir processing processed

# Install npm dependencies
RUN npm install

# Environment
ENV REC_URL=" "

# Start command
ENTRYPOINT ["sh","docker-entrypoint.sh"]
CMD ["node","/usr/src/app/bbb-mp4.js"]

