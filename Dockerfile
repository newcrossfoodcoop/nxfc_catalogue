FROM mhart/alpine-node:4.5

MAINTAINER Ben Simpson, ben@newcrossfoodcoop.org.uk

WORKDIR /home/app

RUN npm install -g gulp

ADD package.json /home/app/package.json
RUN npm install

ADD gulpfile.js /home/app/gulpfile.js

# Make everything available for start
ADD . /home/app

# Run build
RUN gulp build

# 3010 3011 for api dev/test 
# 3014 3014 for worker dev/test
# 5858 for debug
EXPOSE 3010 3011 3014 3015 5858


# CMD ["gulp","api"]
# CMD ["gulp","worker"]
# for production:
# CMD ["gulp","prod:api"]
# CMD ["gulp","prod:worker"]
CMD ["gulp"]
