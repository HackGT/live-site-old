FROM ruby:2.4.1

WORKDIR /workspace
RUN "./docker_resources/build.sh"

FROM nginx:stable-alpine

COPY _site/ /usr/share/nginx/html/
