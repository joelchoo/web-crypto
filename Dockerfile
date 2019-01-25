FROM node:10-alpine
RUN npm install -g http-server@0.11.1

COPY . /

EXPOSE 8080
CMD ["http-server", "-c-1"]