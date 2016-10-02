FROM mhart/alpine-node:4.5

MAINTAINER Ben Simpson, ben@newcrossfoodcoop.org.uk

WORKDIR /home/app

RUN npm install -g gulp abao

ADD package.json /home/app/package.json
RUN npm install

ADD gulpfile.js /home/app/gulpfile.js

# Make everything available for start
ADD . /home/app

# Run build
RUN gulp build

# 3000 3001 for api dev/test 
# 3004 3004 for worker dev/test
# 5858 for debug
EXPOSE 3000 3001 3004 3005 5858


# CMD ["gulp","api"]
# CMD ["gulp","worker"]
# for production:
# CMD ["gulp","prod:api"]
# CMD ["gulp","prod:worker"]
CMD ["gulp"]
