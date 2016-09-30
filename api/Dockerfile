FROM mhart/alpine-node:4.5

MAINTAINER Ben Simpson, ben@newcrossfoodcoop.org.uk

WORKDIR /home/app

RUN npm install -g gulp abao

ADD package.json /home/app/package.json
RUN npm install

ADD gulpfile.js /home/app/gulpfile.js

# Make everything available for start
ADD . /home/app

# Port 3000 for server
EXPOSE 3000

RUN gulp build

# CMD ["gulp","prod:api"] for production
CMD ["gulp","api"]
