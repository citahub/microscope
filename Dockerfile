FROM node:8

# install nginx and so on...
RUN apt-get update -qq && \
 apt-get install -y build-essential nodejs git autoconf locales locales-all curl vim openssl libssl-dev libyaml-dev libxslt-dev cmake htop libreadline6-dev nginx && \
 apt-get clean && \
 rm -rf /var/lib/apt/lists/*

RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8
ENV LC_ALL en_US.UTF-8

RUN mkdir /app
WORKDIR /app

COPY . /app

RUN yarn install && yarn run dll && yarn build

COPY nginx.conf.example /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
