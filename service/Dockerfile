FROM mhart/alpine-node:4.5

MAINTAINER Ben Simpson, ben@newcrossfoodcoop.org.uk

WORKDIR /home/app

RUN npm install -g gulp abao

ADD package.json /home/app/package.json
RUN npm install

ADD gulpfile.js /home/app/gulpfile.js

# Make everything available for start
ADD . /home/app

# Port 4000 for server
EXPOSE 4000

# CMD ["gulp","prod:service"] for production
CMD ["gulp", "service"]
