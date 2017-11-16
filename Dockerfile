# Dockerfile
# publish a static website to nginx

FROM nginx:alpine
COPY . /usr/share/nginx/html

