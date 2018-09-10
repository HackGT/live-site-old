FROM ruby:2.4.1
ADD . .
RUN "./docker_resources/build.sh"

FROM nginx:stable-alpine
COPY --from=0 _site/ /usr/share/nginx/html/